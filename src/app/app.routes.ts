import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AppointmentFormComponent } from './components/appointment-form/appointment-form.component';
import { AppointmentListComponent } from './components/appointment-list/appointment-list.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'appointments/new', component: AppointmentFormComponent },
  { path: 'appointments/edit/:id', component: AppointmentFormComponent },
  { path: 'appointments', component: AppointmentListComponent },
  { path: '**', redirectTo: '' }
];