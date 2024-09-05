using backend.Data;
using backend.Hub;
using backend.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSignalR(hubOptions =>
{
    hubOptions.EnableDetailedErrors = true;
    hubOptions.KeepAliveInterval = TimeSpan.FromMinutes(1);
});
builder.Services.AddSingleton<IDictionary<string, UserConnection>>(
    new Dictionary<string, UserConnection>());
builder.Services.Configure<CookiePolicyOptions>(options =>
{
    options.MinimumSameSitePolicy = SameSiteMode.None;
    options.CheckConsentNeeded = context => true;
});
//var sqlConnection = builder.Configuration["ConnectionStrings:ChatDbConnectionString"];
var sqlConnection = builder.Configuration["ConnectionStrings:ChatDbConnectionString"];
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(sqlConnection));

builder.Services.AddCors(opts =>
{
    opts.AddDefaultPolicy(builder =>
    builder.WithOrigins("http://localhost:4200")
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseRouting();
app.UseCors();
app.UseEndpoints(endpoints =>
{
    endpoints.MapHub<ChatHub>("/chat");
});

app.MapControllers();

app.Run();
