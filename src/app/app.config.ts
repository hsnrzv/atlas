import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { ATLAS_ENVIRONMENT } from './core/config/atlas-environment';
import { provideAtlasData } from './core/data-access/data-access.providers';
import { AtlasTitleStrategy } from './core/layout/atlas-title-strategy';
import { AtlasRouteFocus } from './core/layout/route-focus';
import { AtlasTheme } from './core/theme/atlas-theme';

const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition }) => {
          if (prefersReducedMotion()) {
            transition.skipTransition();
          }
        },
      }),
    ),
    { provide: TitleStrategy, useExisting: AtlasTitleStrategy },
    { provide: ATLAS_ENVIRONMENT, useValue: environment },
    provideAtlasData(),
    provideAppInitializer(() => {
      inject(AtlasTheme);
      inject(AtlasRouteFocus);
    }),
  ],
};
