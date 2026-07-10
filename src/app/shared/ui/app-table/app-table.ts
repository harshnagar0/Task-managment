import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppBadgeComponent } from '../app-badge/app-badge';
import { AppButtonComponent } from '../app-button/app-button';

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
  imports: [CommonModule, AppBadgeComponent, AppButtonComponent],
  templateUrl: './app-table.html',
  styleUrls: ['./app-table.scss'],
})
export class AppTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Input() loading = false;
  @Input() hasLoaded = false;
  @Input() errorMessage = '';
  @Input() emptyTitle = 'No data found';
  @Input() emptyMessage = 'There is nothing to display.';
  @Input() pageSize = 3;

  @Input() disabledActionMap: Record<string, (row: any) => boolean> = {};
  @Input() dynamicLabelMap: Record<string, (row: any) => string> = {};

  @Output() actionClick = new EventEmitter<{ actionKey: string; row: any }>();

  currentPage = 1;

  get totalItems(): number {
    return this.data.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.data.slice(startIndex, endIndex);
  }

  get startItem(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  onActionClick(actionKey: string, row: any): void {
    this.actionClick.emit({ actionKey, row });
  }

  getCellValue(row: any, key: string): any {
    return row[key];
  }

  getStatusVariant(status: string): 'progress' | 'completed' | 'pending' {
  if (status === 'Completed') return 'completed';
  if (status === 'In Progress') return 'progress';
  return 'pending';
}

getPriorityVariant(priority: string): 'high' | 'medium' | 'low' {
  if (priority === 'High') return 'high';
  if (priority === 'Medium') return 'medium';
  return 'low';
}

  isActionDisabled(action: TableAction, row: any): boolean {
    return this.disabledActionMap[action.actionKey]?.(row) ?? false;
  }

  getActionLabel(action: TableAction, row: any): string {
    return this.dynamicLabelMap[action.actionKey]?.(row) ?? action.label;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }
}