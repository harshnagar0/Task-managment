import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Task {
  id: number;
  title: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/tasks';

  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  constructor(private http: HttpClient) {}

  get currentTasks(): Task[] {
    return this.tasksSubject.value;
  }

  loadTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      tap((tasks) => {
        this.tasksSubject.next([...tasks]);
      })
    );
  }

  addTask(task: Omit<Task, 'id'>): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task).pipe(
      tap((newTask) => {
        this.tasksSubject.next([...this.currentTasks, newTask]);
      })
    );
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task).pipe(
      tap((updatedTask) => {
        this.tasksSubject.next(
          this.currentTasks.map((t) =>
            t.id === updatedTask.id ? updatedTask : t
          )
        );
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.tasksSubject.next(this.currentTasks.filter((t) => t.id !== id));
      })
    );
  }

  updateTaskStatus(
    id: number,
    status: Task['status'],
    task: Task
  ): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, { ...task, status }).pipe(
      tap((updatedTask) => {
        this.tasksSubject.next(
          this.currentTasks.map((t) =>
            t.id === updatedTask.id ? updatedTask : t
          )
        );
      })
    );
  }
}