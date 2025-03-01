import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Appointment } from '../models/appointment.model';
import { format, addMinutes, parseISO } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointments: Appointment[] = [];
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  
  constructor() {
    // Load from localStorage if available
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      try {
        this.appointments = JSON.parse(savedAppointments, (key, value) => {
          // Convert date strings back to Date objects
          if (key === 'date' && typeof value === 'string') {
            return new Date(value);
          }
          return value;
        });
        this.appointmentsSubject.next([...this.appointments]);
      } catch (e) {
        console.error('Error loading appointments from localStorage', e);
      }
    }
  }

  getAppointments(): Observable<Appointment[]> {
    return this.appointmentsSubject.asObservable();
  }

  getAppointment(id: number): Observable<Appointment | undefined> {
    const appointment = this.appointments.find(a => a.id === id);
    return of(appointment);
  }

  addAppointment(appointment: Appointment): Observable<Appointment> {
    // Generate ID
    const newId = this.appointments.length > 0 
      ? Math.max(...this.appointments.map(a => a.id || 0)) + 1 
      : 1;
    
    const newAppointment = {
      ...appointment,
      id: newId,
      status: 'scheduled' as const
    };
    
    this.appointments.push(newAppointment);
    this.appointmentsSubject.next([...this.appointments]);
    
    // Save to localStorage
    this.saveToLocalStorage();
    
    return of(newAppointment);
  }

  updateAppointment(appointment: Appointment): Observable<Appointment> {
    const index = this.appointments.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      this.appointments[index] = appointment;
      this.appointmentsSubject.next([...this.appointments]);
      this.saveToLocalStorage();
    }
    return of(appointment);
  }

  deleteAppointment(id: number): Observable<boolean> {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      this.appointments.splice(index, 1);
      this.appointmentsSubject.next([...this.appointments]);
      this.saveToLocalStorage();
      return of(true);
    }
    return of(false);
  }

  getAppointmentsByDate(date: Date): Observable<Appointment[]> {
    const dateString = format(date, 'yyyy-MM-dd');
    const filtered = this.appointments.filter(a => {
      const appointmentDate = format(a.date, 'yyyy-MM-dd');
      return appointmentDate === dateString;
    });
    return of(filtered);
  }

  getAppointmentsByBarber(barberId: number): Observable<Appointment[]> {
    const filtered = this.appointments.filter(a => a.barber.id === barberId);
    return of(filtered);
  }

  checkAvailability(date: Date, barberId: number, serviceId: number, startTime: string): Observable<boolean> {
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Find appointments for the same barber on the same day
    const barberAppointments = this.appointments.filter(a => {
      const appointmentDate = format(a.date, 'yyyy-MM-dd');
      return appointmentDate === dateString && a.barber.id === barberId && a.status !== 'cancelled';
    });
    
    // Check if the time slot is available
    const isAvailable = !barberAppointments.some(a => {
      return (startTime >= a.startTime && startTime < a.endTime) || 
             (a.startTime >= startTime && a.startTime < a.endTime);
    });
    
    return of(isAvailable);
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('appointments', JSON.stringify(this.appointments));
    } catch (e) {
      console.error('Error saving appointments to localStorage', e);
    }
  }
}