import { Routes } from '@angular/router';
import { IndexComponent } from './core/index/index.component';
import { ProjectsComponent } from './core/projects/projects.component';
import { ContactComponent } from './core/contact/contact.component';

export const routes: Routes = [
  // Default redirect to home component
  { path: '', redirectTo: '', pathMatch: 'full' },
  
  // Main routes
  {
    path: '',
    component: IndexComponent,
  },
  {
    path: 'projects',
    component: ProjectsComponent,
  },
  {
    path: 'contact',
    component: ContactComponent,
  },
  
  // Wildcard route for 404 - must be the last route
  { path: '**', redirectTo: '' }
];
