import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withDebugTracing, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(
      routes,
      // Only use hash routing in production, not in development
      ...(!isDevMode() ? [withHashLocation()] : []),
      // Only enable debug tracing in development
      ...(isDevMode() ? [withDebugTracing()] : [])
    ), 
    provideClientHydration(), 
    provideHttpClient()
  ]
};
