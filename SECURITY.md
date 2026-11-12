# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Never paste secrets, tokens, session cookies, connection
strings or personal planning data into issues, pull requests or discussions.

Report privately through GitHub's private vulnerability reporting on this repository (**Security → Report a
vulnerability**). If that option is not available, contact the repository owner [@hsnrzv](https://github.com/hsnrzv)
directly through GitHub and ask for a private channel. Include the affected file, route or build, the impact and
reproduction steps.

You will get an acknowledgement as soon as the owner can respond. This is a personal project without a formal
response-time commitment.

## If a secret was committed

1. Treat it as compromised: **rotate it first**, then remove it.
2. Removing it from the latest commit is not enough, because it remains in Git history. Coordinate a history rewrite
   only if it is still needed after rotation.

## Frontend security practices

- The browser bundle contains **no secrets**. Runtime configuration is public by definition.
- Authentication will use the backend-for-frontend session pattern for the web (an HttpOnly, Secure, SameSite cookie).
  Access tokens, refresh tokens and passwords are **never** stored in `localStorage`/`sessionStorage`. Capacitor uses
  the system browser with PKCE and platform secure storage. See `atlas-microservices` ADR-0005 (proposed).
- The container serves a strict Content Security Policy (`nginx/security-headers.conf`): `script-src 'self'`, no inline
  scripts and `frame-ancestors 'none'`. It also sends `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
  and COOP. Relaxing the CSP requires an ADR.
- The image runs as a non-root user (`nginx-unprivileged`, uid 101) on port 8080.
- Dependencies come only from the public npm registry (`npm run lockfile:check`). They are pinned by
  `package-lock.json`, updated by Dependabot and checked by `dependency-review` on pull requests (fails on high severity).
- Recommended GitHub settings: secret scanning with push protection, private vulnerability reporting, Dependabot alerts,
  and branch protection on `main` requiring the CI checks and a CODEOWNERS review.
