# Clover homepage visitor counter

The left side of the existing Hero has a 150 × 150 px Asta visitor companion above the portrait on desktop. At narrower desktop/tablet widths the BGM stays below the Hero; on mobile the order is portrait, academic information, visitors, BGM. Academic mode and print hide the visitor artwork completely. The counter never accesses the audio element or BGM preferences.

## Enable real visits

1. Create a site at [GoatCounter](https://www.goatcounter.com/). A site such as `example.goatcounter.com` has site code `example`.
2. In `_config.yml`, set the public site code:

   ```yaml
   goatcounter:
     enabled: true
     code: "example"
   ```

3. In GoatCounter **Settings**, enable **Allow adding visitor counts on your website**. Leave session tracking enabled under **Data collection → Sessions**.
4. Build/deploy the site in production (`JEKYLL_ENV=production`). GitHub Pages supplies the production environment. If you change the public domain, update the existing `url` in `_config.yml` as well.

Only the public site code is needed. No API token, GitHub credential, or account password belongs in the site configuration or JavaScript. The code is deliberately blank in the delivered source because no GoatCounter site was provided.

## Counting behavior and limitations

- The homepage script template is inert until the existing home module verifies `JEKYLL_ENV`, HTTPS, the configured site host, and the homepage path. Other pages do not include it. `localhost`, loopback, development builds, previews on other hosts, and unconfigured sites send no tracking requests.
- The official stable `count.v5.js` is loaded once with the SHA-384 integrity value independently checked against both the official file and [the published SRI documentation](https://www.goatcounter.com/help/countjs-versions). `no_onload` prevents automatic duplicate tracking; the home module sends one manual visit to `/`. `no_session` is never enabled. GoatCounter retains its own session and bot handling.
- The custom board reads `https://SITE.goatcounter.com/counter/%2F.json`. It validates the response as a nonnegative safe integer, pads smaller numbers to six digits, and formats larger numbers with commas. The displayed count always comes from the service.
- **The public endpoint is cached for up to four hours**, according to [GoatCounter's visitor-counter documentation](https://www.goatcounter.com/help/visitor-counter). Counts may not immediately reflect this visit. No fake increment or cache-busting polling is used. The one-time `+1` is an arrival greeting after a successful count read and an unfiltered tracking attempt; it does not promise that a deduplicated visit or beacon has increased the cached total. GoatCounter's beacon does not return a per-visit confirmation.
- `sessionStorage['clover-home-visitor-seen']` controls only the greeting. A successful first session visit in Academic mode is also marked seen without animating; changing themes does not add another visit. Refreshing an already greeted session updates the real number without repeating the jump.
- Script loading and JSON reading each have a four-second timeout, no retries, and at most one warning from this module. Failure shows `------`. Blocked session storage affects only the greeting. Missing artwork falls back to a Clover mark and CSS board.

See [GoatCounter sessions](https://www.goatcounter.com/help/sessions) and [the JavaScript API](https://www.goatcounter.com/help/js) for the service's session/visit definitions and filters. This is a cumulative homepage visit count, not GitHub repository traffic or a globally deduplicated lifetime person count.

## Local preview

Run the normal Jekyll preview. The board displays `DEV` and makes no GoatCounter requests. On loopback only, `/?visitorDemo=1` displays an explicitly labelled demo value `001248` and the one-time arrival animation. The parameter has no effect on production. The animation is disabled by `prefers-reduced-motion: reduce`.

## Artwork

`assets/images/visitor/asta-chibi-counter.png` was generated with the built-in imagegen tool and optimized to a 384 × 384 RGBA PNG while preserving the transparent background and composition. There is no text or number in the image; HTML overlays the empty sign. No third-party artwork was downloaded.

Generation prompt: “One front-facing chibi Asta from Black Clover with spiky silver-white hair, green eyes, black headband and a small antique-gold Clover emblem, dark forest-green/black outfit, friendly determined smile; both hands holding a straight blank dark forest-green rectangular sign with a muted gold rim in front of the lower torso; full figure visible, true transparent background, crisp anime linework and restrained cel shading; no text, numbers, typography, watermarks, neon, or additional objects; compact square composition suitable for a 150 px homepage widget.”
