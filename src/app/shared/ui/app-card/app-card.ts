import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-card.html',
  styleUrls: ['./app-card.scss'],
})
export class AppCardComponent {
  @Input() variant: 'default' | 'progress' | 'completed' | 'pending' | 'active' = 'default';
  @Input() padded = true;
}