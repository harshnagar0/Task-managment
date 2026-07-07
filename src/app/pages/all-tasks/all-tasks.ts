import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task';
import { AppBadgeComponent } from '../../shared/ui/app-badge/app-badge';

@Component({
  selector: 'app-all-tasks',
  standalone: true,
  imports: [CommonModule, AppBadgeComponent],
  templateUrl: './all-tasks.html',
  styleUrls: ['./all-tasks.scss']
})
export class AllTasksComponent implements OnInit {
  constructor(public taskService: TaskService) {}

  ngOnInit(): void {
    if (this.taskService.currentTasks.length === 0) {
      this.taskService.loadTasks().subscribe();
    }
  }
}