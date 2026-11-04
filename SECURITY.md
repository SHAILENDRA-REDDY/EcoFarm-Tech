# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅        |

## Scope

This repository contains a **static front-end prototype**. It has:

- no backend, database or authentication,
- no analytics or third-party tracking scripts,
- no runtime dependencies (no npm packages are loaded by the site),
- no form submission — the farmer enquiry form validates locally and never transmits data.

The only outbound request is to Google Fonts for the Inter and Sora typefaces.
If you deploy in an environment where that is undesirable, self-host the fonts
and remove the `<link>` tags in `index.html`.

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Instead:

1. Use GitHub's private [security advisory](https://github.com/SHAILENDRA-REDDY/EcoFarm-Tech/security/advisories/new) flow, or
2. Contact the maintainers through the repository owner profile.

Please include:

- a description of the issue and its impact,
- steps to reproduce (URL, browser, viewport),
- any suggested fix.

We aim to acknowledge reports within 5 working days. Because this is a student
prototype maintained on a best-effort basis, please allow reasonable time for a fix.

## Hardening notes for deployments

- The provided `Dockerfile` serves the site from nginx as a non-root user with a read-only filesystem.
- `nginx.conf` sends `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy` and `Cross-Origin-Opener-Policy` headers.
- No inline event handlers (`onclick=`) are used; scripts are same-origin files.
- If you add forms or a backend, add CSRF protection, rate limiting and server-side validation.

## Out of scope

- The illustrative numbers shown in the dashboard (they are demo data, not a data breach).
- Reports about missing DNS or hosting configuration for third-party forks.
