# Happy PDF canonical brand artwork

The original Android Happy PDF artwork is authoritative. Web and iOS consumers
use exact raster exports from this asset pack and must not redraw the logo:

`/Users/dhananjaybhosale/AndroidStudioProjects/PDFTools/design-assets/happy-pdf-brand-exact`

## Canonical sources

| Source | Use |
|---|---|
| `exports/ui/happy-pdf-logo-exact-transparent-1024.png` | In-app web UI, launch artwork and the repository master copy. |
| `exports/ui/happy-pdf-logo-exact-transparent-1024.webp` | Lossless web delivery of the same transparent artwork. |
| `exports/play-store/happy-pdf-play-store-icon-exact-512.png` | PWA and iOS app icons. iOS receives a 1024px no-alpha resize of this exact store artwork. |
| `exports/play-store/happy-pdf-feature-graphic-exact-1024x500.png` | Open Graph and social preview. |

`happy-pdf-logo-exact.png` is a byte-for-byte copy of the canonical transparent
1024px PNG. Public delivery copies live under `public/`; Xcode-ready PNGs live
under `ios/App/App/Assets.xcassets/`.

## Rules

- Never recolour, trace, filter, rotate, outline or redraw the logo.
- Use the transparent artwork in the interface, without a CSS background,
  clipping mask, corner radius or shadow.
- Use the full-background store artwork for installed-app icons so platform
  icon masks do not clip the logo.
- Splash screens may only composite the transparent artwork over the existing
  light and dark launch backgrounds.
