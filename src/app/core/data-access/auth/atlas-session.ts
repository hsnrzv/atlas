import { HttpClient } from '@angular/common/http';
import { DOCUMENT, Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ATLAS_ENVIRONMENT } from '../../config/atlas-environment';
import { API_BASE_URL, apiUrl } from '../http/api-config';

/**
 * Where the browser goes to sign in: the backend's BFF login under `/api/auth/**` (atlas-microservices ADR-0005 §3).
 * The exact path and a return-path parameter are not in the API contract yet (frontend.md FQ-22).
 */
export const AUTH_SIGN_IN_URL = new InjectionToken<string>('AUTH_SIGN_IN_URL', {
  providedIn: 'root',
  factory: () => '/api/auth/login',
});

/** Full-page navigation to the sign-in flow; a token so tests can observe it without leaving the page. */
export const AUTH_REDIRECT = new InjectionToken<(url: string) => void>('AUTH_REDIRECT', {
  providedIn: 'root',
  factory: () => {
    const view = inject(DOCUMENT).defaultView;
    return (url: string) => view?.location.assign(url);
  },
});

/**
 * The signed-in owner as far as the client needs it. `GET /me` has no contract yet (FQ-22): the client relies only
 * on the status (200 signed in, 401 not) and reads an optional display name.
 */
export interface AtlasUser {
  readonly displayName?: string | null;
}

/** `disabled`: the build has auth off (F4-5 flag); `unknown`: `/me` not answered yet. */
export type SessionStatus = 'disabled' | 'unknown' | 'signed-in' | 'signed-out';

/**
 * The browser session (F4-5, frontend.md §14). The backend keeps the tokens; the browser holds only the HttpOnly
 * session cookie, which same-origin `fetch` sends by default, so nothing here reads or stores a token. With the
 * `auth` flag on, {@link bootstrap} asks `/me` once and any `401` from the API sends the browser to sign in.
 */
@Injectable({ providedIn: 'root' })
export class AtlasSession {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  private readonly signInUrl = inject(AUTH_SIGN_IN_URL);
  private readonly redirect = inject(AUTH_REDIRECT);
  private readonly enabled = inject(ATLAS_ENVIRONMENT, { optional: true })?.auth ?? false;
  private readonly state = signal<SessionStatus>(this.enabled ? 'unknown' : 'disabled');
  private readonly current = signal<AtlasUser | null>(null);
  private redirecting = false;

  readonly status = this.state.asReadonly();
  readonly user = this.current.asReadonly();
  readonly signedIn = computed(() => this.state() === 'signed-in');

  /** Loads `/me` when auth is on. A `401` leads to sign-in through the 401 hook; other failures keep `unknown`. */
  async bootstrap(): Promise<void> {
    if (!this.enabled) {
      return;
    }
    try {
      const user = await firstValueFrom(this.http.get<AtlasUser | null>(apiUrl(this.base, 'me')));
      this.current.set(user ?? {});
      this.state.set('signed-in');
    } catch {
      // A 401 already went through `atlasAuthInterceptor`; anything else leaves the status `unknown`.
    }
  }

  /** Called for every API `401`: the session is gone, so the browser goes to sign in (once). */
  unauthorized(): void {
    if (!this.enabled) {
      return;
    }
    this.current.set(null);
    this.state.set('signed-out');
    if (!this.redirecting) {
      this.redirecting = true;
      this.redirect(this.signInUrl);
    }
  }
}
