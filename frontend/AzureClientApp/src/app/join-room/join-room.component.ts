import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-join-room',
  templateUrl: './join-room.component.html',
  styleUrl: './join-room.component.css'
})
export class JoinRoomComponent {
  // FormGroup instance to manage the join room form
  joinRoomForm!: FormGroup;

  // Injecting FormBuilder for creating and managing form controls
  fb = inject(FormBuilder);

   // Injecting Router for navigation
  router = inject(Router);

  // Injecting ChatService to handle chat room operations
  chatService = inject(ChatService);

  // Lifecycle hook that is called after the component has been initialized
  ngOnInit(): void{
     // Initialize the joinRoomForm with validation for user and room fields
    this.joinRoomForm = this.fb.group({
      user: ['',Validators.required],
      room: ['', Validators.required]
    })
  }

   // Method to handle the logic for joining a chat room
  joinRoom(){
    // Destructure the form values for 'user' and 'room'
    const {user, room} = this.joinRoomForm.value;

     // Save the user's name to session storage
    sessionStorage.setItem("user", user);

    // Call the joinRoom method from ChatService to join the specified room
    this.chatService.joinRoom(user, room)
    .then(()=>{
      // Navigate to the 'chat' route upon successful room join
      this.router.navigate(['chat']);
    }).catch((err)=>{
      // Log any errors encountered while joining the room
      console.log(err);
       // Navigate to the 'welcome' route if joining the room fails
      this.router.navigate(['welcome']);
    });

  }
}
