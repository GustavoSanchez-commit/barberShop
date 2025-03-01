import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  features = [
    {
      title: 'Easy Scheduling',
      description: 'Book your appointment with just a few clicks',
      icon: 'event_available'
    },
    {
      title: 'Choose Your Barber',
      description: 'Select from our team of professional barbers',
      icon: 'person'
    },
    {
      title: 'Service Selection',
      description: 'Choose from a variety of barbering services',
      icon: 'content_cut'
    },
    {
      title: 'Manage Appointments',
      description: 'View, modify or cancel your appointments',
      icon: 'edit_calendar'
    }
  ];
}