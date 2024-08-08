import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; 

import { AppComponent } from './app.component';
import { ProjectService } from './shared/services/project/project.service'; 
import { ProjectComponent } from './core/project/project.component';

@NgModule({
  declarations: [
   
  ],
  imports: [
    BrowserModule,
    AppComponent,
    HttpClientModule,
    ProjectComponent
  ],
  providers: [ProjectService], 
  bootstrap: []
})
export class AppModule { }
