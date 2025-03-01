import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models/appointment.model';
import { format } from 'date-fns';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule
  ],
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.css']
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  selectedDate: Date | null = null;
  searchTerm: string = '';
  
  displayedColumns: string[] = [
    'date', 
    'time', 
    'customerName', 
    'service', 
    'barber', 
    'status', 
    'actions'
  ];
  
  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService.getAppointments().subscribe(appointments => {
      this.appointments = appointments;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let filtered = [...this.appointments];
    
    // Filter by date if selected
    if (this.selectedDate) {
      const dateString = format(this.selectedDate, 'yyyy-MM-dd');
      filtered = filtered.filter(appointment => {
        const appointmentDate = format(new Date(appointment.date), 'yyyy-MM-dd');
        return appointmentDate === dateString;
      });
    }
    
    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(appointment => 
        appointment.customerName.toLowerCase().includes(term) ||
        appointment.customerEmail.toLowerCase().includes(term) ||
        appointment.customerPhone.toLowerCase().includes(term) ||
        appointment.barber.name.toLowerCase().includes(term) ||
        appointment.service.name.toLowerCase().includes(term)
      );
    }
    
    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      if (dateA !== dateB) {
        return dateA - dateB;
      }
      
      return a.startTime.localeCompare(b.startTime);
    });
    
    this.filteredAppointments = filtered;
  }

  onDateChange(): void {
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedDate = null;
    this.searchTerm = '';
    this.applyFilters();
  }

  formatDate(date: Date): string {
    return format(new Date(date), 'MMM dd, yyyy');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'status-scheduled';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  updateStatus(appointment: Appointment, newStatus: 'scheduled' | 'completed' | 'cancelled'): void {
    const updatedAppointment: Appointment = {
      ...appointment,
      status: newStatus
    };
    
    this.appointmentService.updateAppointment(updatedAppointment).subscribe(() => {
      this.snackBar.open(`Appointment status updated to ${newStatus}`, 'Close', { duration: 3000 });
      this.loadAppointments();
    });
  }

  deleteAppointment(id: number): void {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.appointmentService.deleteAppointment(id).subscribe(success => {
        if (success) {
          this.snackBar.open('Appointment deleted successfully', 'Close', { duration: 3000 });
          this.loadAppointments();
        } else {
          this.snackBar.open('Error deleting appointment', 'Close', { duration: 3000 });
        }
      });
    }
  }
}