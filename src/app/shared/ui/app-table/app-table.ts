import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppButtonComponent } from '../app-button/app-button';
import { AppBadgeComponent } from '../app-badge/app-badge';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'status-badge' | 'priority-badge';
}

export interface TableAction {
  label: string;
  variant: 'primary' | 'secondary' | 'success' | 'danger';
  actionKey: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, AppButtonComponent, AppBadgeComponent],
  templateUrl: './app-table.html',
  styleUrls: ['./app-table.scss'],
})
export class AppTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Input() emptyTitle = 'No data found';
  @Input() emptyMessage = 'There is nothing to display.';
  @Input() loading = false;
  @Input() hasLoaded = false;
  @Input() errorMessage = '';

  @Input() disabledActionMap: Record<string, (row: any) => boolean> = {};
  @Input() dynamicLabelMap: Record<string, (row: any) => string> = {};

  @Output() actionClick = new EventEmitter<{ actionKey: string; row: any }>();

  getStatusVariant(status: string): 'progress' | 'completed' | 'pending' {
    if (status === 'In Progress') return 'progress';
    if (status === 'Completed') return 'completed';
    return 'pending';
  }

  getPriorityVariant(priority: string): 'high' | 'medium' | 'low' {
    if (priority === 'High') return 'high';
    if (priority === 'Medium') return 'medium';
    return 'low';
  }

  getCellValue(row: any, key: string): any {
    return row?.[key] ?? '';
  }

  getActionLabel(action: TableAction, row: any): string {
    const resolver = this.dynamicLabelMap[action.actionKey];
    return resolver ? resolver(row) : action.label;
  }

  isActionDisabled(action: TableAction, row: any): boolean {
    const resolver = this.disabledActionMap[action.actionKey];
    return resolver ? resolver(row) : false;
  }

  onActionClick(actionKey: string, row: any): void {
    this.actionClick.emit({ actionKey, row });
  }
}