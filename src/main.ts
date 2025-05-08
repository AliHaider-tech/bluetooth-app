import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { app, BrowserWindow } from "electron";


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
