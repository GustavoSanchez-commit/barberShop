import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AppointmentService } from '../../services/appointment.service';
import { BarberService } from '../../services/barber.service';
import { ServiceService } from '../../services/service.service';
import { Appointment } from '../../models/appointment.model';
import { Barber } from '../../models/barber.model';
import { Service } from '../../models/service.model';
import { format, addMinutes, parseISO } from 'date-fns';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.css']
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm!: FormGroup;
  barbers: Barber[] = [];
  services: Service[] = [];
  availableTimeSlots: string[] = [];
  isEditMode = false;
  appointmentId?: number;
  
  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private barberService: BarberService,
    private serviceService: ServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadBarbers();
    this.loadServices();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.appointmentId = +params['id'];
        this.loadAppointment(this.appointmentId);
      }
    });
    
    // Update available time slots when date or barber changes
    this.appointmentForm.get('date')?.valueChanges.subscribe(() => {
      this.updateAvailableTimeSlots();
    });
    
    this.appointmentForm.get('barberId')?.valueChanges.subscribe(() => {
      this.updateAvailableTimeSlots();
    });
    
    this.appointmentForm.get('serviceId')?.valueChanges.subscribe(() => {
      this.updateAvailableTimeSlots();
    });
  }

  initForm(): void {
    this.appointmentForm = this.fb.group({
      customerName: ['', [Validators.required]],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: ['', [Validators.required]],
      date: [new Date(), [Validators.required]],
      startTime: ['', [Validators.required]],
      barberId: ['', [Validators.required]],
      serviceId: ['', [Validators.required]],
      notes: ['']
    });
  }

  loadBarbers(): void {
    this.barberService.getBarbers().subscribe(barbers => {
      this.barbers = barbers;
    });
  }

  loadServices(): void {
    this.serviceService.getServices().subscribe(services => {
      this.services = services;
    });
  }

  loadAppointment(id: number): void {
    this.appointmentService.getAppointment(id).subscribe(appointment => {
      if (appointment) {
        this.appointmentForm.patchValue({
          customerName: appointment.customerName,
          customerEmail: appointment.customerEmail,
          customerPhone: appointment.customerPhone,
          date: appointment.date,
          startTime: appointment.startTime,
          barberId: appointment.barber.id,
          serviceId: appointment.service.id,
          notes: appointment.notes || ''
        });
        
        // Update time slots after loading the appointment
        this.updateAvailableTimeSlots();
      }
    });
  }

  updateAvailableTimeSlots(): void {
    const date = this.appointmentForm.get('date')?.value;
    const barberId = this.appointmentForm.get('barberId')?.value;
    const serviceId = this.appointmentForm.get('serviceId')?.value;
    
    if (!date || !barberId || !serviceId) {
      this.availableTimeSlots = [];
      return;
    }
    
    const selectedDate = new Date(date);
    const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(selectedDate);
    
    // Get the selected barber's availability
    this.barberService.getBarber(barberId).subscribe(barber => {
      if (!barber || !barber.availability || !barber.availability[dayOfWeek]) {
        this.availableTimeSlots = [];
        return;
      }
      
      const availability = barber.availability[dayOfWeek];
      const startHour = parseInt(availability.start.split(':')[0]);
      const startMinute = parseInt(availability.start.split(':')[1]);
      const endHour = parseInt(availability.end.split(':')[0]);
      const endMinute = parseInt(availability.end.split(':')[1]);
      
      // Get the selected service duration
      this.serviceService.getService(serviceId).subscribe(service => {
        if (!service) {
          this.availableTimeSlots = [];
          return;
        }
        
        const serviceDuration = service.durationMinutes;
        const timeSlots: string[] = [];
        
        // Generate time slots in 30-minute intervals
        for (let hour = startHour; hour <= endHour; hour++) {
          for (let minute = (hour === startHour ? startMinute : 0); minute < 60; minute += 30) {
            if (hour === endHour && minute >= endMinute) {
              break;
            }
            
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            // Check if this time slot is available
            const endTimeHour = Math.floor((hour * 60 + minute + serviceDuration) / 60);
            const endTimeMinute = (hour * 60 + minute + serviceDuration) % 60;
            
            if (endTimeHour > endHour || (endTimeHour === endHour && endTimeMinute > endMinute)) {
              // Skip time slots that would extend beyond barber's availability
              continue;
            }
            
            // Check against existing appointments
            this.appointmentService.checkAvailability(
              selectedDate, 
              barberId, 
              serviceId, 
              timeString
            ).subscribe(isAvailable => {
              if (isAvailable) {
                timeSlots.push(timeString);
              }
            });
          }
        }
        
        this.availableTimeSlots = timeSlots;
      });
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      return;
    }
    
    const formValue = this.appointmentForm.value;
    
    // Get the selected barber and service
    this.barberService.getBarber(formValue.barberId).subscribe(barber => {
      this.serviceService.getService(formValue.serviceId).subscribe(service => {
        if (!barber || !service) {
          this.snackBar.open('Error: Barber or service not found', 'Close', { duration: 3000 });
          return;
        }
        
        // Calculate end time based on service duration
        const startTimeParts = formValue.startTime.split(':');
        const startHour = parseInt(startTimeParts[0]);
        const startMinute = parseInt(startTimeParts[1]);
        
        const endTimeDate = new Date();
        endTimeDate.setHours(startHour);
        endTimeDate.setMinutes(startMinute + service.durationMinutes);
        
        const endTime = `${endTimeDate.getHours().toString().padStart(2, '0')}:${endTimeDate.getMinutes().toString().padStart(2, '0')}`;
        
        const appointment: Appointment = {
          id: this.isEditMode ? this.appointmentId : undefined,
          customerName: formValue.customerName,
          customerEmail: formValue.customerEmail,
          customerPhone: formValue.customerPhone,
          date: formValue.date,
          startTime: formValue.startTime,
          endTime: endTime,
          barber: barber,
          service: service,
          status: 'scheduled',
          notes: formValue.notes
        };
        
        if (this.isEditMode) {
          this.appointmentService.updateAppointment(appointment).subscribe(() => {
            this.snackBar.open('Appointment updated successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/appointments']);
          });
        } else {
          this.appointmentService.addAppointment(appointment).subscribe(() => {
            this.snackBar.open('Appointment booked successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/appointments']);
          });
        }
      });
    });
  }
}