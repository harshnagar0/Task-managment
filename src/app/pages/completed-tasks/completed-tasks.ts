import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { Task, TaskService } from '../../services/task';

@Component({
  selector: 'app-completed-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './completed-tasks.html',
  styleUrls: ['./completed-tasks.scss']
})
export class CompletedTasksComponent implements OnInit {
  completedTasks$!: Observable<Task[]>;

  constructor(public taskService: TaskService) {}

  ngOnInit(): void {
    this.completedTasks$ = this.taskService.tasks$.pipe(
      map((tasks) => tasks.filter((task) => task.status === 'Completed'))
    );

    if (this.taskService.currentTasks.length === 0) {
      this.taskService.loadTasks().subscribe();
    }
  }
}