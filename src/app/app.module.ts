import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { HomeComponent } from './core/home/home.component';
import { ProjectsComponent } from './core/projects/projects.component';
import { ContactComponent } from './core/contact/contact.component';
import { SuccessComponent } from './core/success/success.component';
import { BeyondComponent } from './core/beyond/beyond.component';
import { ContactFormComponent } from './shared/contact-form/contact-form.component';
import { ContactServiceComponent } from './shared/contact-service/contact-service.component';
import { FooterComponent } from './shared/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    ProjectsComponent,
    ContactComponent,
    SuccessComponent,
    BeyondComponent,
    ContactFormComponent,
    ContactServiceComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
