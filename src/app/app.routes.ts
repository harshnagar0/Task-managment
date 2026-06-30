import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AllTasksComponent } from './pages/all-tasks/all-tasks';
import { CompletedTasksComponent } from './pages/completed-tasks/completed-tasks';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'all-tasks', component: AllTasksComponent },
  { path: 'completed-tasks', component: CompletedTasksComponent },
];