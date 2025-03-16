import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; 
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component'; 
import { routes } from './app.routes';

@NgModule({
  declarations: [
   
  ],
  imports: [
    BrowserModule,
    AppComponent,
    HttpClientModule,
    RouterModule.forRoot(routes, {
      useHash: false, // Don't use hash in development
      scrollPositionRestoration: 'enabled'
    })
  ],
  providers: [], 
  bootstrap: []
})
export class AppModule { }
