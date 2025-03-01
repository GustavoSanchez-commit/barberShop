export interface Barber {
  id: number;
  name: string;
  specialties: string[];
  imageUrl?: string;
  availability?: {
    [key: string]: { // day of week
      start: string; // HH:MM format
      end: string;   // HH:MM format
    }
  };
}