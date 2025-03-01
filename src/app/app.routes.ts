import { Routes } from '@angular/router';
import { IndexComponent } from './core/index/index.component';

export const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    component: IndexComponent,
  },
];
