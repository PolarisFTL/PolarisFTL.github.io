# Tianle Fang — Academic Homepage

Source code for [Tianle Fang's academic homepage](https://polarisftl.github.io/), published with Jekyll and GitHub Pages.

The homepage presents research interests, news, education, selected publications, awards, and academic services in a responsive single-page layout. Its visual design combines a restrained academic document surface with an optional Clover-inspired background and companion.

## Main files

- `_pages/about.md` — homepage academic content
- `_config.yml` — site metadata and profile links
- `_sass/_academic-home.scss` — homepage layout and visual styling
- `assets/js/home-interactions.js` — navigation, theme, and companion interactions
- `assets/images/backgrounds/black-clover-bg.jpg` — user-supplied background
- `assets/images/pet/nero.png` — transparent companion image

## Local development

Install the dependencies declared in `Gemfile`, then run:

```bash
bundle exec jekyll serve
```

Open `http://127.0.0.1:4000/` in a browser.

## Deployment

Pushing the `main` branch to `PolarisFTL/PolarisFTL.github.io` triggers GitHub Pages deployment. The public site is available at:

https://polarisftl.github.io/

## Attribution

This site was originally developed from the open-source AcadHomepage template and its Minimal Mistakes influences. The current homepage layout, styling, responsive behavior, and Clover-inspired presentation are customized for Tianle Fang. Third-party notices and license terms are retained in `LICENSE` and the relevant source files.
