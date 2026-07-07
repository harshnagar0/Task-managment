import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-button.html',
  styleUrls: ['./app-button.scss'],
})
export class AppButtonComponent {
  @Input() label = 'Button';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'success' | 'danger' = 'primary';
  @Input() disabled = false;
  @Input() fullWidth = false;

  @Output() buttonClick = new EventEmitter<void>();

  handleClick(): void {
    if (!this.disabled) {
      this.buttonClick.emit();
    }
  }
}