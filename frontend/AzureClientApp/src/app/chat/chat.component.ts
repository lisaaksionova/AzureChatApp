import { Component, inject, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  // Injecting the ChatService to handle chat-related operations
  chatService = inject(ChatService);

   // Holds the current input message from the user
  inputMessage  = "";

  // Array to store the list of messages in the chat
  messages: any[] = [];

   // Injecting Router to handle navigation
  router = inject(Router);

  // Retrieves the logged-in user's name from session storage
  loggedInUserName = sessionStorage.getItem("user");

   // Lifecycle hook that is called after the component has been initialized
  ngOnInit(): void {
    // Subscribes to the messages observable from the ChatService
    this.chatService.messages$.subscribe(res=>{
       // Updates the messages array with the latest messages from the service
      this.messages = res;
      // Logs the messages to the console for debugging purposes
      console.log(this.messages);
    });
  }

  // Method to send a message to the chat service
  sendMessage(){
    // Calls the sendMessage method from ChatService to send the current input message
    this.chatService.sendMessage(this.inputMessage)
    .then(()=>{
      // Clears the input message field after successful sending
      this.inputMessage = "";
    }).catch((err)=>{
       // Logs any errors encountered while sending the message
      console.log(err);
    })
    
  }
  // Method to handle leaving the chat
  leaveChat(){
     // Calls the leaveChat method from ChatService to handle leaving the chat
      this.chatService.leaveChat()
      .then(()=>{
         // Navigates to the 'welcome' route after successfully leaving the chat
        this.router.navigate(['welcome']);
      }).catch((err)=>{
         // Logs any errors encountered while leaving the chat
        console.log(err);
      })
  }
}
