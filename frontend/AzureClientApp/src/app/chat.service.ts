import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalR";
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
 // Hub connection for real-time communication with the chat server
  public connection : signalR.HubConnection = new signalR.HubConnectionBuilder().withUrl("http://localhost:5000/chat")
  .configureLogging(signalR.LogLevel.Information)
  .build();

  // Observable that emits messages for subscribers to receive updates
  public messages$ = new BehaviorSubject<any>([]);
  
  // Array to hold the list of messages locally
  public messages: any[] = [];


  constructor() {
    // Start the connection and set up event handlers
    this.start();

     // Event handler for receiving messages from the server
    this.connection.on("ReceiveMessage", (user : string, message : string, sentiment: string) =>{
      // Add the new message to the messages array
      this.messages = [...this.messages, {user, message, sentiment}];
      // Emit the updated messages array to subscribers
      this.messages$.next(this.messages);
    });
   }
   // Method to start the SignalR connection
  public async start(){
    try {
      // Attempt to start the connection
      await this.connection.start();
      console.log("Connection is established!");
    } catch (error) {
      // Log any errors encountered while starting the connection
      console.log(error);
    }
  }
    // Method to join a chat room
  public async joinRoom(user: string, room: string) {
    // Invoke the 'JoinRoom' method on the server with the user and room parameters
    return this.connection.invoke("JoinRoom",  user, room );
}
  // Method to send a message to the chat room
  public async sendMessage(message: string){
     // Invoke the 'SendMessage' method on the server with the message parameter
    return this.connection.invoke("SendMessage", message);
  }
 // Method to leave the chat
  public async leaveChat(){
    // Stop the connection to the chat server
    return this.connection.stop();
  }
 // Method to log in a user
  public async logIn(userName: string){
      // Invoke the 'LogIn' method on the server with the userName parameter
    return this.connection.invoke("LogIn", userName);
  }
}
