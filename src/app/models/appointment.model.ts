import { Barber } from './barber.model';
import { Service } from './service.model';

export interface Appointment {
  id?: number;
  customerId?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: Date;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  barber: Barber;
  service: Service;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}