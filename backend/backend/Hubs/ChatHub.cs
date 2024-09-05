
using Azure;
using Azure.AI.TextAnalytics;
using backend.Data;
using backend.Models;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNetCore.Server.HttpSys;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Runtime.CompilerServices;
using System.Security.Claims;

namespace backend.Hub
{
    public class ChatHub : Microsoft.AspNetCore.SignalR.Hub
    {
        // Dictionary to keep track of user connections and their rooms
        private readonly IDictionary<string, UserConnection> _connection;

        // Database context for accessing user and message data
        private readonly AppDbContext _appDbContext;

        // Configuration settings for accessing external services
        private readonly IConfiguration _configuration;

        // Credentials and endpoint for a text analytics service
        private readonly AzureKeyCredential _credentials;
        private readonly Uri _endpoint;

        // Constructor to initialize the ChatHub with dependencies
        public ChatHub(IDictionary<string, UserConnection> connection, AppDbContext context, IConfiguration configuration)
        {
            _connection = connection;
            _appDbContext = context;
            _configuration = configuration;

            // Initialize credentials and endpoint for text analytics service using configuration values

            _credentials = new AzureKeyCredential(_configuration["KEY"]);
            _endpoint = new Uri(_configuration["ENDPOINT"]);
        }

        // Method to handle user login and registration
        public async Task LogIn(string userName)
        {
            // Check if the user already exists in the database
            if (_appDbContext.Users.FirstOrDefault(u => u.Name == userName) != null)
                throw new Exception("User already exist");

            // Create a new user and add to the database
            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Name = userName
            };

            _appDbContext.Users.Add(user);
            await _appDbContext.SaveChangesAsync();
        }

        // Method to handle a user joining a chat room
        public async Task JoinRoom(string userName, string room)
        {
            // Check if the user exists in the database
            if (_appDbContext.Users.FirstOrDefault(u => u.Name == userName) == null)
                throw new Exception("User does not exist");

            // Create a new UserConnection object to represent the user's connection to the room
            var connection = new UserConnection
            {
                User = userName,
                Room = room
            };

            // Add the connection to the specified chat room
            await Groups.AddToGroupAsync(Context.ConnectionId, connection.Room);

            // Ensure the _connection dictionary is not null before accessing it
            if (_connection is null)
                throw new ArgumentNullException(nameof(connection));

            // Store the connection information in the dictionary
            _connection[Context.ConnectionId] = connection;

            // Notify all clients in the room that a new user has joined
            await Clients.Group(connection.Room!)
                .SendAsync("ReceiveMessage", "Bot", $"{connection.User} has joined the group", DateTime.Now);
        }

        // Method to handle sending a message to a chat room
        public async Task SendMessage(string messageContent)
        {

            // Retrieve the user's connection information from the dictionary
            if (_connection.TryGetValue(Context.ConnectionId, out UserConnection connection))
            {

                // Analyze sentiment of the message content using the text analytics service
                var client = new TextAnalyticsClient(_endpoint, _credentials);
                DocumentSentiment review = client.AnalyzeSentiment(messageContent);
                var sentiment = review.Sentiment;

                // Create a new message object with sentiment analysis results
                var message = new Message
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = _appDbContext.Users.FirstOrDefault(u => u.Name == connection.User).Id,
                    Content = messageContent,
                    SentimentResult = sentiment.ToString()
                };

                // Save the message to the database
                _appDbContext.Messages.Add(message);
                await _appDbContext.SaveChangesAsync();

                // Send the message to all clients in the room with sentiment analysis results
                await Clients.Group(connection.Room)
                    .SendAsync("ReceiveMessage", connection.User, message.Content, message.SentimentResult);
            }
        }

        // Method to handle user disconnection from a chat room
        public override Task OnDisconnectedAsync(Exception? exception)
        {

            // Check if the connection does not exist in the dictionary
            if (!_connection.TryGetValue(Context.ConnectionId, out UserConnection connection))
            {
                return base.OnDisconnectedAsync(exception);
            }

            // Notify all clients in the room that the user has left
            Clients.Group(connection.Room!)
                .SendAsync("ReceiveMessage", "Bot", $"{connection.User} has left the group");

            // Remove the user connection from the dictionary
            _connection.Remove(Context.ConnectionId);

            return base.OnDisconnectedAsync(exception);
        }
    }
}
