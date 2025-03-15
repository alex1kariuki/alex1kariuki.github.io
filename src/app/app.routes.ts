import { Routes } from '@angular/router';
import { IndexComponent } from './core/index/index.component';
import { ProjectsComponent } from './core/projects/projects.component';

export const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    component: IndexComponent,
  },
  {
    path: 'projects',
    component: ProjectsComponent,
  },
];
