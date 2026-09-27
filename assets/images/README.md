# Homepage artwork

The repository includes optimized, user-supplied artwork at the paths below. The homepage also remains complete when either custom asset is removed: the Clover theme falls back to a dark forest gradient, and the companion falls back to the repository's generic fantasy-bird SVG.

To replace the current artwork with files that you own or are licensed to publish:

- Add the background as `assets/images/backgrounds/black-clover-bg.jpg`.
- Add a transparent Nero/Secre companion as `assets/images/pet/nero.png`.

The site detects the companion image at runtime and automatically replaces the generic bird only when `nero.png` loads successfully. Missing custom files never produce a visible broken-image icon.

For performance, keep the background JPEG/WebP-equivalent source around 500 KB–1 MB and the transparent companion PNG under roughly 200 KB. Crop the background for a wide desktop composition and retain enough dark/quiet space behind the central content panel.
