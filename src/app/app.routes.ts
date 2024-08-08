import { Routes } from '@angular/router';
import { IndexComponent } from './core/index/index.component';
import { ProjectComponent } from './core/project/project.component';

export const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    component: IndexComponent,
  },
  {
    path: 'projects',
    component: ProjectComponent,
  },
  {
    path: ':project',
    component: ProjectComponent,
  },
];
