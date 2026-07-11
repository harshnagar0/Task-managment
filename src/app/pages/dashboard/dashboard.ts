import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Task, TaskService } from '../../services/task';
import { AppButtonComponent } from '../../shared/ui/app-button/app-button';
import { AppCardComponent } from '../../shared/ui/app-card/app-card';
import {
  AppTableComponent,
  TableAction,
  TableColumn,
} from '../../shared/ui/app-table/app-table';
import { AppModalComponent } from '../../shared/ui/app-modal/app-modal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppButtonComponent,
    AppCardComponent,
    AppTableComponent,
    AppModalComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  showForm = false;
  editingTaskId: number | null = null;

  searchText = '';
  statusFilter = 'All';
  priorityFilter = 'All';

  tasks: Task[] = [];

  isLoading = false;
  hasLoaded = false;
  errorMessage = '';

  deletingTaskId: number | null = null;
  completingTaskId: number | null = null;
  savingTask = false;

  private tasksSubscription?: Subscription;

  tableColumns: TableColumn[] = [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'status', label: 'Status', type: 'status-badge' },
    { key: 'priority', label: 'Priority', type: 'priority-badge' },
    { key: 'dueDate', label: 'Due Date', type: 'text' },
  ];

  tableActions: TableAction[] = [
    { label: 'Edit', variant: 'secondary', actionKey: 'edit' },
    { label: 'Done', variant: 'success', actionKey: 'complete' },
    { label: 'Delete', variant: 'danger', actionKey: 'delete' },
  ];

  disabledActionMap = {
    edit: (task: Task) =>
      this.deletingTaskId === task.id || this.completingTaskId === task.id,

    complete: (task: Task) =>
      this.completingTaskId === task.id ||
      this.deletingTaskId === task.id ||
      task.status === 'Completed',

    delete: (task: Task) =>
      this.deletingTaskId === task.id || this.completingTaskId === task.id,
  };

  dynamicLabelMap = {
    complete: (task: Task) =>
      this.completingTaskId === task.id ? 'Updating...' : 'Done',

    delete: (task: Task) =>
      this.deletingTaskId === task.id ? 'Deleting...' : 'Delete',
  };

  newTask: Omit<Task, 'id'> = {
    title: '',
    status: 'Pending',
    priority: 'Medium',
    dueDate: '',
  };

  constructor(
    public taskService: TaskService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.hasLoaded = false;
    this.errorMessage = '';

    this.tasksSubscription = this.taskService.tasks$.subscribe({
      next: (tasks) => {
        this.ngZone.run(() => {
          this.tasks = [...tasks];
          this.isLoading = false;
          this.hasLoaded = true;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Tasks subscription error:', err);
        this.ngZone.run(() => {
          this.errorMessage = 'Unable to load tasks.';
          this.isLoading = false;
          this.hasLoaded = true;
          this.cdr.detectChanges();
        });
      },
    });

    if (this.taskService.currentTasks.length === 0) {
      this.taskService.loadTasks().subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.tasks = [...this.taskService.currentTasks];
            this.isLoading = false;
            this.hasLoaded = true;
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          console.error('Load tasks error:', err);
          this.ngZone.run(() => {
            this.errorMessage = 'Unable to load tasks.';
            this.isLoading = false;
            this.hasLoaded = true;
            this.cdr.detectChanges();
          });
        },
      });
    } else {
      this.tasks = [...this.taskService.currentTasks];
      this.isLoading = false;
      this.hasLoaded = true;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.tasksSubscription?.unsubscribe();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;

    if (!this.showForm) {
      this.resetForm();
    }
  }

  get filteredTasks(): Task[] {
  return this.tasks
    .filter((task) => task.status !== 'Completed')
    .filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(this.searchText.toLowerCase());

      const matchesStatus =
        this.statusFilter === 'All' || task.status === this.statusFilter;

      const matchesPriority =
        this.priorityFilter === 'All' || task.priority === this.priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort(
      (a, b) => this.getDateValue(a.dueDate) - this.getDateValue(b.dueDate)
    );
}

  get totalTasks(): number {
    return this.tasks.length;
  }

  get inProgressTasks(): number {
    return this.tasks.filter((task) => task.status === 'In Progress').length;
  }

  get completedTasks(): number {
    return this.tasks.filter((task) => task.status === 'Completed').length;
  }

  get pendingTasks(): number {
    return this.tasks.filter((task) => task.status === 'Pending').length;
  }

  get overdueTasks(): number {
    return this.tasks.filter((task) => this.isOverdue(task)).length;
  }

  getDateValue(dateString: string): number {
    const parsedDate = new Date(dateString).getTime();
    return isNaN(parsedDate) ? Number.MAX_SAFE_INTEGER : parsedDate;
  }

  isOverdue(task: Task): boolean {
    if (task.status === 'Completed') return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  }

  addOrUpdateTask(): void {
    if (!this.newTask.title.trim() || !this.newTask.dueDate.trim()) {
      alert('Please fill in task title and due date.');
      return;
    }

    this.errorMessage = '';
    this.savingTask = true;

    if (this.editingTaskId !== null) {
      const updatedTask: Task = {
        id: this.editingTaskId,
        ...this.newTask,
      };

      this.taskService.updateTask(updatedTask).subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.tasks = [...this.taskService.currentTasks];
            this.savingTask = false;
            this.resetForm();
            this.showForm = false;
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          console.error('Update task error:', err);
          this.ngZone.run(() => {
            this.errorMessage = 'Unable to update task.';
            this.savingTask = false;
            this.cdr.detectChanges();
          });
        },
      });
    } else {
      this.taskService.addTask(this.newTask).subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.tasks = [...this.taskService.currentTasks];
            this.savingTask = false;
            this.resetForm();
            this.showForm = false;
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          console.error('Add task error:', err);
          this.ngZone.run(() => {
            this.errorMessage = 'Unable to add task.';
            this.savingTask = false;
            this.cdr.detectChanges();
          });
        },
      });
    }
  }

  editTask(task: Task): void {
    this.newTask = {
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    };

    this.editingTaskId = task.id;
    this.showForm = true;
    this.cdr.detectChanges();
  }

  deleteTask(taskId: number): void {
    this.deletingTaskId = taskId;
    this.cdr.detectChanges();

    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.deletingTaskId = null;
          this.tasks = [...this.taskService.currentTasks];
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error deleting task:', error);
        this.ngZone.run(() => {
          this.deletingTaskId = null;
          this.errorMessage = 'Unable to delete task.';
          this.cdr.detectChanges();
        });
      },
    });
  }

  markAsCompleted(task: Task): void {
    if (task.status === 'Completed') return;

    this.completingTaskId = task.id;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.taskService.updateTaskStatus(task.id, 'Completed', task).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.completingTaskId = null;
          this.tasks = [...this.taskService.currentTasks];
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Complete task error:', err);
        this.ngZone.run(() => {
          this.errorMessage = 'Unable to mark task as completed.';
          this.completingTaskId = null;
          this.cdr.detectChanges();
        });
      },
    });
  }

  onTableAction(event: { actionKey: string; row: Task }): void {
    if (event.actionKey === 'edit') {
      this.editTask(event.row);
    }

    if (event.actionKey === 'complete') {
      this.markAsCompleted(event.row);
    }

    if (event.actionKey === 'delete') {
      this.deleteTask(event.row.id);
    }
  }

  resetForm(): void {
    this.newTask = {
      title: '',
      status: 'Pending',
      priority: 'Medium',
      dueDate: '',
    };

    this.editingTaskId = null;
    this.savingTask = false;
  }
  get totalItems(): number {
  return this.filteredTasks.length;
}
}