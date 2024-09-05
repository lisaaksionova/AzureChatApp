import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent {
  // FormGroup instance to manage the login form
  logInForm!: FormGroup;
  // Injecting FormBuilder to create and manage form controls
  fb = inject(FormBuilder);
  // Injecting Router for navigation
  router = inject(Router);
   // Injecting ChatService to handle user authentication
  chatService = inject(ChatService);

  // Lifecycle hook that is called after the component has been initialized
  ngOnInit(): void{
    // Initialize the logInForm with validation for the userName field
    this.logInForm = this.fb.group({
      userName: ['',Validators.required]
    })
  }

  // Method to handle the logic for user login
  logIn(){
     // Destructure the userName value from the form
    const {userName} = this.logInForm.value;

     // Store the user's name in session storage
    sessionStorage.setItem("user", userName);

     // Call the logIn method from ChatService to handle user authentication
    this.chatService.logIn(userName)
    .then(()=>{
      // Navigate to the 'join-room' route upon successful login
      this.router.navigate(['join-room']);
    }).catch((err)=>{
       // Log any errors encountered during login
      console.log(err);
    });

  }
}
