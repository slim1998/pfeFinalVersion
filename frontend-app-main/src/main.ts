import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
(window as any).global = window;
Object.defineProperty(Object.prototype, 'safeAccess', {
  value: function(prop: string) {
    return this ? this[prop] : undefined;
  },
  writable: true,
  configurable: true
});
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
