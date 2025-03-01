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
      title: 'Agendamento fácil',
      description: 'Agende sua consulta com apenas alguns cliques',
      icon: 'event_available'
    },
    {
      title: 'Escolha o seu barbeiror',
      description: 'Selecione entre nossa equipe de barbeiros profissionais',
      icon: 'person'
    },
    {
      title: 'Seleção de serviço',
      description: 'Escolha entre uma variedade de serviços de barbearia',
      icon: 'content_cut'
    },
    {
      title: 'Gerenciar compromissos',
      description: 'Visualize, modifique ou cancele seus compromissos',
      icon: 'edit_calendar'
    }
  ];
}