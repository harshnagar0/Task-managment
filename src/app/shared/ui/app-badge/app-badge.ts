import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-badge.html',
  styleUrls: ['./app-badge.scss']
})
export class AppBadgeComponent {
  @Input() text = '';
  @Input() variant:
    | 'progress'
    | 'completed'
    | 'pending'
    | 'high'
    | 'medium'
    | 'low' = 'pending';
}