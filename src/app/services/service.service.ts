import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Service } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private services: Service[] = [
    {
      id: 1,
      name: 'Haircut',
      description: 'Classic haircut with scissors or clippers',
      price: 25,
      durationMinutes: 30
    },
    {
      id: 2,
      name: 'Beard Trim',
      description: 'Shaping and trimming of beard',
      price: 15,
      durationMinutes: 20
    },
    {
      id: 3,
      name: 'Haircut & Beard Combo',
      description: 'Full haircut and beard trim service',
      price: 35,
      durationMinutes: 45
    },
    {
      id: 4,
      name: 'Hot Towel Shave',
      description: 'Traditional hot towel straight razor shave',
      price: 30,
      durationMinutes: 30
    },
    {
      id: 5,
      name: 'Hair Coloring',
      description: 'Professional hair coloring service',
      price: 50,
      durationMinutes: 60
    }
  ];

  constructor() { }

  getServices(): Observable<Service[]> {
    return of(this.services);
  }

  getService(id: number): Observable<Service | undefined> {
    const service = this.services.find(s => s.id === id);
    return of(service);
  }
}