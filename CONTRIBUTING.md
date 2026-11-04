# Contributing to Eco Farm Tech

Thanks for your interest in the project. This repository holds the **Eco Farm Tech
monitoring dashboard prototype** — a student venture concept for solar-powered
farm electricity.

The site is deliberately dependency-free: plain HTML, CSS and JavaScript. There
is no bundler, no framework and no build step, which keeps the project easy to
review, host and teach from.

## Ways to contribute

- **Bug reports** — layout problems, broken links, inconsistent numbers, accessibility issues.
- **Design polish** — spacing, typography, dark-mode contrast, mobile behaviour.
- **Content and correctness** — clearer explanations of the solar system, tariffs, regulations.
- **Data review** — flag any figure that contradicts the README or the review notes.

Please open an issue before starting a large change so we can agree on the approach.

## Development setup

```bash
git clone https://github.com/SHAILENDRA-REDDY/EcoFarm-Tech.git
cd EcoFarm-Tech

# serve locally (Python 3 is enough)
make serve            # → http://localhost:4173

# or with Docker
make docker-build
make docker-run       # → http://localhost:8080
```

## Project layout

```text
index.html          single-page shell: sidebar, top bar, all 11 routes
css/styles.css      design tokens, layout, components, dark theme
js/data.js          demo dataset (dashboard, owner, business, calculator)
js/app.js           routing, SVG charts, dark mode, calculator, forms
assets/             photography and sidebar illustration
scripts/            dependency-free repo checks used by CI
.github/            CI workflow, issue forms and PR template
```

## Coding conventions

- **Formatting:** 2 spaces, LF line endings, UTF-8 (enforced by `.editorconfig` and `.gitattributes`).
- **CSS:** extend the token set in `:root` / `[data-theme="dark"]` instead of adding one-off colours.
- **JavaScript:** vanilla ES2019+, no globals besides the namespaced `window.EFT_*` data objects.
- **Markup:** reuse existing components (`.card`, `.stat`, `.pill`, `.field`) before inventing new ones.
- **Accessibility:** every control needs a label, keyboard focus must stay visible, and colour must never be the only signal.
- **Data:** all values are illustrative demo data. Never present a sample figure as a verified measurement, tariff or approval.

## Before opening a pull request

```bash
make check     # required files, icon references, routes, asset paths
make lint      # JavaScript syntax + HTML structure
```

Then:

1. Keep the change focused and describe it clearly.
2. Update `CHANGELOG.md` under **Unreleased**.
3. If you change numbers, update `README.md` and `js/data.js` together.
4. Confirm the dark theme and the mobile layout still look right.

## Commit messages

Conventional-ish prefixes are appreciated:

```text
feat: add battery health card
fix: align November totals with the snapshot date
docs: clarify net-metering caveats
style: tighten card spacing on mobile
chore: bump nginx base image
```

## Code of conduct

Participation is covered by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Licence

By contributing you agree that your work is released under the [MIT Licence](LICENSE).
