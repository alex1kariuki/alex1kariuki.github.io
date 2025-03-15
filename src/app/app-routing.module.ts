import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import your components here

const routes: Routes = [
  // Define your routes here
  // Example:
  // { path: '', component: HomeComponent },
  // { path: 'projects', component: ProjectsComponent },
  // { path: 'contact', component: ContactComponent },
  
  // Wildcard route for 404
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: false,
    scrollPositionRestoration: 'enabled',
    initialNavigation: 'enabledBlocking'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { } 