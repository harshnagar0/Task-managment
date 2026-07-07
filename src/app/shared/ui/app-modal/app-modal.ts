import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-modal.html',
  styleUrls: ['./app-modal.scss'],
})
export class AppModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Modal';
  @Input() closeOnOverlay = true;

  @Output() close = new EventEmitter<void>();

  onOverlayClick(): void {
    if (this.closeOnOverlay) {
      this.close.emit();
    }
  }

  onCloseClick(): void {
    this.close.emit();
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}