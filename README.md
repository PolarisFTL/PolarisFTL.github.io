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

### Clover background music

The Hero includes an optional player for **消えない理由 — WANIMA**, visible only in Clover mode. Its markup and consent dialog live in `_includes/clover-music-player.html` and `_includes/clover-music-consent.html`.

- Audio: `assets/audio/kienai-riyuu.mp3` (user-supplied MP3, looped at 35% volume).
- Cover: `assets/images/music/kienai-riyuu-cover.jpg` (user-supplied artwork, resized to 480 × 480).
- Consent: `clover-bgm-consent` stores `allow` or `deny`; mute uses `clover-bgm-muted`.
- First Clover visit asks permission after 450 ms. Escape continues silently. A returning allowed visit attempts playback once; browser autoplay restrictions leave it paused.
- Switching to Academic pauses playback and hides the player. Switching back never resumes it automatically. The Play button can override an earlier denial.
- Missing audio shows `BGM UNAVAILABLE`; the Official Video link remains available. JavaScript failure leaves academic content and the video link usable.

Install the dependencies declared in `Gemfile`, then run:

```bash
bundle exec jekyll serve
```

Open `http://127.0.0.1:4000/` in a browser.

## Deployment

### Clover visitor counter

The Hero's Asta companion reads a real cumulative homepage visit count from GoatCounter and is visible only in Clover mode. Set `goatcounter.code` in `_config.yml` and enable **Allow adding visitor counts on your website** in GoatCounter Settings. No account or token is embedded; the delivered code leaves the site code blank. Local previews never send visits; `/?visitorDemo=1` demonstrates the one-time greeting. Public counts may be cached for up to four hours. See [configuration and behavior](docs/clover-visitor-counter.md).

Pushing the `main` branch to `PolarisFTL/PolarisFTL.github.io` triggers GitHub Pages deployment. The public site is available at:

https://polarisftl.github.io/

## Attribution

This site was originally developed from the open-source AcadHomepage template and its Minimal Mistakes influences. The current homepage layout, styling, responsive behavior, and Clover-inspired presentation are customized for Tianle Fang. Third-party notices and license terms are retained in `LICENSE` and the relevant source files.
