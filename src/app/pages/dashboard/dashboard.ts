import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskService } from '../../services/task';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit {
  showForm = false;
  editingTaskId: number | null = null;

  searchText = '';
  statusFilter = 'All';
  priorityFilter = 'All';

  tasks: Task[] = [];

  isLoading = false;
  errorMessage = '';

  deletingTaskId: number | null = null;
  completingTaskId: number | null = null;
  savingTask = false;

  private loaderDelayTimeout: ReturnType<typeof setTimeout> | null = null;

  newTask: Omit<Task, 'id'> = {
    title: '',
    status: 'Pending',
    priority: 'Medium',
    dueDate: '',
  };

  constructor(public taskService: TaskService) {}

 ngOnInit(): void {
  this.taskService.tasks$.subscribe((tasks) => {
    this.tasks = tasks;
  });

  if (this.taskService.currentTasks.length === 0) {
    this.taskService.loadTasks().subscribe();
  }
}

  loadTasks(): void {
    this.errorMessage = '';

    this.clearLoaderDelay();
    this.loaderDelayTimeout = setTimeout(() => {
      this.isLoading = true;
    }, 250);

    this.taskService.loadTasks().subscribe({
      next: () => {
        this.clearLoaderDelay();
        this.isLoading = false;
      },
      error: (err) => {
        this.clearLoaderDelay();
        console.error('Load tasks error:', err);
        this.errorMessage = 'Unable to load tasks. Please try again.';
        this.isLoading = false;
      },
    });
  }

  clearLoaderDelay(): void {
    if (this.loaderDelayTimeout) {
      clearTimeout(this.loaderDelayTimeout);
      this.loaderDelayTimeout = null;
    }
  }

  get filteredTasks(): Task[] {
    return this.tasks
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

  toggleForm(): void {
    this.showForm = !this.showForm;

    if (!this.showForm) {
      this.resetForm();
    }
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
          this.savingTask = false;
          this.resetForm();
          this.showForm = false;
        },
        error: (err) => {
          console.error('Update task error:', err);
          this.errorMessage = 'Unable to update task.';
          this.savingTask = false;
        },
      });
    } else {
      this.taskService.addTask(this.newTask).subscribe({
        next: () => {
          this.savingTask = false;
          this.resetForm();
          this.showForm = false;
        },
        error: (err) => {
          console.error('Add task error:', err);
          this.errorMessage = 'Unable to add task.';
          this.savingTask = false;
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
  }

  deleteTask(id: number): void {
    this.deletingTaskId = id;
    this.errorMessage = '';

    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.deletingTaskId = null;
      },
      error: (err) => {
        console.error('Delete task error:', err);
        this.errorMessage = 'Unable to delete task.';
        this.deletingTaskId = null;
      },
    });
  }

  markAsCompleted(task: Task): void {
    if (task.status === 'Completed') return;

    this.completingTaskId = task.id;
    this.errorMessage = '';

    this.taskService.updateTaskStatus(task.id, 'Completed', task).subscribe({
      next: () => {
        this.completingTaskId = null;
      },
      error: (err) => {
        console.error('Complete task error:', err);
        this.errorMessage = 'Unable to mark task as completed.';
        this.completingTaskId = null;
      },
    });
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
}