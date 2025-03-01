import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; 

import { AppComponent } from './app.component'; 

@NgModule({
  declarations: [
   
  ],
  imports: [
    BrowserModule,
    AppComponent,
    HttpClientModule,
  ],
  providers: [], 
  bootstrap: []
})
export class AppModule { }
