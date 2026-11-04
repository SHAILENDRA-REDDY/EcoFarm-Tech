# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Dark mode** toggle in the top-right of the header, with a saved preference
  (`localStorage`), theme-aware charts and a chart palette driven by CSS variables.
- **Savings & Impact** page: interactive solar savings calculator (capacity,
  panels, daily consumption, electricity price) plus an environmental impact
  panel (CO₂ avoided, trees equivalent, coal avoided, clean-energy share).
- **Pricing & Revenue** page: Basic / Standard / Premium packages, an explanation
  of pay-per-use billing, a monthly operating model with a 1-farm / 3-farm
  switch, revenue-vs-expense chart and a break-even projection.
- **Farmer Registration** page with an enquiry form, validation, success state and
  a four-step onboarding explainer.
- **About** page: problem, solution, system flow, audience, benefits, risks,
  contact details and future scope.
- Repository scaffolding: `LICENSE` (MIT), `.gitignore`, `.gitattributes`,
  `.dockerignore`, `.editorconfig`, `Dockerfile`, `nginx.conf`, `nginx-main.conf`,
  `docker-compose.yml`, `Makefile`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`,
  `SECURITY.md`, this changelog, GitHub issue forms, a pull-request template and
  a CI workflow with dependency-free repository checks.

### Changed
- System capacity corrected to **9.9 kWp** (18 × 550 Wp) throughout the dashboard,
  owner profile and settings.
- November reporting figures now show **month-to-date values for four generation
  days** instead of a full-month total, and the related savings figures follow.
- The header clock is a **fixed demo snapshot (04 Nov 2026, 12:30 PM)** so the
  current output, the 12:15 PM peak and the activity log stay consistent.
- Owner profile no longer publishes phone numbers, email addresses, street
  addresses, coordinates, consumer numbers or emergency contacts; sample data is
  labelled as fictional throughout.
- Added explicit caveats for net metering, grid export credits and tariffs.

### Fixed
- **Container smoke test failed in CI.** nginx exited before serving because the
  server block bound IPv6 (`listen [::]:8080`) — unsupported on runtimes with IPv6
  disabled — and the pid file lived in root-owned `/var/run`. The server now listens
  on IPv4 only, keeps its pid under `/var/cache/nginx`, starts without the stock
  entrypoint scripts, and the image runs `nginx -t` at build time so a broken
  configuration fails the build instead of the deployment.
- CI smoke test now waits for `/healthz`, checks every static asset and its MIME
  type, and reports container state/logs as annotations when it fails.
- Duplicate `DATA`/`PAGES` scope issue that could stop the dashboard booting if
  a script failed to load.
- Leaf badge and centred highlighted title survive route changes.
- Chart colours now follow the active theme instead of being hard-coded.

## [1.0.0] — 2026-11-04

### Added
- Initial monitoring dashboard: Dashboard, Owner Profile, Solar Power,
  Farm Monitoring, Irrigation Control, Reports and Settings.
- Hand-built SVG charts (generation curve, usage donut, weekly bars), CSV export,
  print stylesheet, responsive sidebar and a green/white design system.
- Project README documenting the venture concept and demo data.

[Unreleased]: https://github.com/SHAILENDRA-REDDY/EcoFarm-Tech/compare/main...HEAD
[1.0.0]: https://github.com/SHAILENDRA-REDDY/EcoFarm-Tech/releases/tag/v1.0.0
