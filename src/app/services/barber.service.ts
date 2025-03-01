import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Barber } from '../models/barber.model';

@Injectable({
  providedIn: 'root'
})
export class BarberService {
  private barbers: Barber[] = [
    {
      id: 1,
      name: 'John Smith',
      specialties: ['Haircut', 'Beard Trim', 'Hot Towel Shave'],
      imageUrl: 'assets/barbers/john.jpg',
      availability: {
        'Monday': { start: '09:00', end: '17:00' },
        'Tuesday': { start: '09:00', end: '17:00' },
        'Wednesday': { start: '09:00', end: '17:00' },
        'Thursday': { start: '09:00', end: '17:00' },
        'Friday': { start: '09:00', end: '17:00' }
      }
    },
    {
      id: 2,
      name: 'Mike Johnson',
      specialties: ['Fade', 'Hair Coloring', 'Styling'],
      imageUrl: 'assets/barbers/mike.jpg',
      availability: {
        'Monday': { start: '10:00', end: '18:00' },
        'Tuesday': { start: '10:00', end: '18:00' },
        'Wednesday': { start: '10:00', end: '18:00' },
        'Thursday': { start: '10:00', end: '18:00' },
        'Saturday': { start: '09:00', end: '15:00' }
      }
    },
    {
      id: 3,
      name: 'David Williams',
      specialties: ['Classic Cuts', 'Beard Grooming', 'Facial Treatments'],
      imageUrl: 'assets/barbers/david.jpg',
      availability: {
        'Tuesday': { start: '09:00', end: '17:00' },
        'Wednesday': { start: '09:00', end: '17:00' },
        'Thursday': { start: '09:00', end: '17:00' },
        'Friday': { start: '09:00', end: '17:00' },
        'Saturday': { start: '09:00', end: '15:00' }
      }
    }
  ];

  constructor() { }

  getBarbers(): Observable<Barber[]> {
    return of(this.barbers);
  }

  getBarber(id: number): Observable<Barber | undefined> {
    const barber = this.barbers.find(b => b.id === id);
    return of(barber);
  }

  getAvailableBarbers(date: Date, time: string): Observable<Barber[]> {
    const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
    
    const availableBarbers = this.barbers.filter(barber => {
      const availability = barber.availability?.[dayOfWeek];
      if (!availability) return false;
      
      return time >= availability.start && time <= availability.end;
    });
    
    return of(availableBarbers);
  }
}