# Totone Studio (`v5.3.0`)

[![Live App](https://img.shields.io/badge/Live-totone.averybeuth.xyz-091534?style=for-the-badge)](https://totone.averybeuth.xyz/)
[![Zero Build](https://img.shields.io/badge/Build-Zero%20Build%20Static%20HTML%2FJS-16254d?style=for-the-badge)](#architecture)
[![PWA Ready](https://img.shields.io/badge/App-Installable%20PWA%20%2B%20Offline-0f766e?style=for-the-badge)](#install-as-an-app-pwa)
[![Buy Me a Coffee](https://img.shields.io/badge/Support-Buy%20Me%20a%20Coffee-fbbf24?style=for-the-badge&logo=buy-me-a-coffee&logoColor=050c1f)](https://buymeacoffee.com/averyuwubaka)

> **A free, zero-build browser photo editor, Lightroom-style color grader, AI studio, and Canva design tool** — runs 100% locally on your device with zero uploads, zero accounts, and full offline PWA app support.

---

## Complete Feature Catalog

### 1. On-Device AI Studio (`AI` Tab — Zero Server Uploads)
- **AI Neural Background Remover (`RMBG-1.4` & `MODNet`)** — On-device WebGPU/WASM neural cutouts (inspired by `withoutbg` / `rembg`) outputting non-destructive editable Layer Masks with live download/inference progress bars and edge halo decontamination.
- **Instant Offline Background Remover Modes** — Border + Pockets flood cutout, Center Subject isolation, and White / Solid Color Key fallback when offline.
- **Live Cutout Touch-Up Brush (`Erase` / `Restore` / `Soft Edge`)** — Paint directly on the canvas with color-coded live rings, `X` to flip Erase ↔ Restore, `[` / `]` brush resize, softness slider, `Undo stroke`, `− Edge` / `+ Edge` 1px morphological choke/grow, `Invert` cutout, and high-contrast inspection backdrops (*Green Screen, Red, Pitch Black, Pure White*).
- **Instant Background Swapper Studio** — 1-click backdrop placement directly behind cutouts: 6 studio solid colors, 6 studio gradients, **1-Click Blurred Original (Bokeh)**, or custom uploaded photo backdrop.
- **AI Image Upscaler (`2×` / `3×` / `4×` ESRGAN)** — Upscayl-style split-screen before/after comparison using TensorFlow.js / UpscalerJS (`ESRGAN Medium`, `ESRGAN Slim`, `ESRGAN Photo GAN 4×`) plus instant offline Crisp Detail upscaling, post-sharpen, and denoise.
- **AI Depth Map & DSLR Portrait Bokeh (`Depth Anything V2`)** — On-device monocular neural depth estimation for realistic background blur with adjustable Blur Amount & Focus Depth, or save directly as a Layer Depth Mask.
- **3D Photo Relighting** — Drag 2 virtual colored studio lights (Key + Rim) directly over your photo to physically relight surfaces using 3D surface normals, Lambert diffuse + Blinn-Phong specular reflection, ambient dimming, and relief depth.
- **Movie-Grade Color Transfer ("Steal Any Color Grade")** — Upload any movie still, album cover, or reference photo to transfer its exact color palette & tonal mood using **Reinhard `lαβ` Statistical Color Transfer** with Intensity and Preserve Brightness controls.
- **Frequency-Separation Portrait Retouch** — Non-destructive portrait brushes: **Smooth Skin** (edge-preserving so pores/texture stay natural), **Brighten Eyes**, **Whiten Teeth**, and **Soft Glow** with brush size, strength, and stroke undo.
- **OCR Grab Text (`Tesseract.js`)** — Extract text locally from any screenshot, scan, or poster, copy to clipboard, or turn directly into an editable text layer.
- **Smart AI Auto-Crop (`smartcrop.js`)** — Content-aware saliency and face/focal-point auto-cropping for `1:1`, `4:5`, `16:9`, `9:16`, and `3:2`.
- **CLAHE Adaptive Contrast & Gray-World Auto White Balance** — Computer-vision photo restoration (Zuiderveld 1994 CLAHE + Buchsbaum Gray-World) that fixes hazy, foggy, underwater, or heavily color-cast photos in 1 click.
- **1-Click Smart Auto Enhance** — Instant balanced tonal & contrast boost.

### 2. Lightroom-Style Color Grading (`Color` → `Grade`, `Presets`, `Light`, `Palette`, `Film`)
- **Basic Light & Tone** — Auto, B&W, HDR toggles; White Balance presets (*As Shot, Daylight, Cloudy, Shade, Tungsten, Fluorescent, Concert Red Fix*) + live canvas **Pick WB** eyedropper; 13 sliders (*Temp, Tint, Exposure in EV stops, Contrast, Highlights, Shadows, Whites, Blacks, Texture, Clarity, Dehaze, Vibrance, Saturation*).
- **24 Calibrated Cinema Grade Presets** — Visual gradient-swatch cards driving Basic Light & Tone + all 3 Shadows/Midtones/Highlights Color Grading Wheels simultaneously, with category filter chips (*Night & Neon, Nature, Cinema, Portrait, B&W*) and live `0–150%` **Look Intensity** slider:
  - *Night & Neon*: Neon City, Tokyo Rain, Cyberpunk 2099, Midnight Drive, Vaporwave Dusk
  - *Nature*: Warm Forest, Emerald Moody, Golden Coast, Autumn Woods, Nordic Frost, Desert Sunset, Oceanic Deep
  - *Cinema*: Teal & Orange, Dune / Blade Amber, A24 Indie Film, Kodak Portra 400, Fuji Velvia Lush, Vintage 1978
  - *Portrait*: Natural Pop, Dreamy Pastel, Parisian Matte, Concert Red Fix
  - *B&W*: Silver Noir, Warm Sepia Film
- **Shareable Color Grade Links (`Copy Look Link`)** — Encodes your exact Basic sliders + 3-Way Color Wheels into a compact `?look=...` URL that auto-loads for anyone who opens it.
- **`.CUBE` 3D LUT Importer & Exporter** — Load any Adobe Premiere, DaVinci Resolve, or Lightroom `.cube` 3D LUT with live trilinear interpolation and strength slider, or export your current Totone grade as a `17×17×17` `.cube` LUT file.
- **Point Color (Stage Light & Skin Tone Recovery)** — Multi-swatch selective color remapper designed to rescue photos under harsh red/blue concert lighting back to natural skin tones (*Fair, Warm, Tan, Deep, White* presets + Hue Shift, Saturation, Luminance, Variance/Unify, Range, and **Visualize Range** mask preview).
- **8-Dot Visual Color Mixer (HSL)** — 8 color-band rings (*Red, Orange, Yellow, Green, Aqua, Blue, Purple, Magenta*) with Hue, Saturation, Luminance, Target Hue, Hue Range, and canvas color picker.
- **3-Up Color Grading Wheels** — Simultaneous Shadows, Midtones, and Highlights wheels (plus Single-Wheel mode) with individual Luminance sliders, Balance, Blending, and quick presets.
- **Tone Curves & Local Grading Masks** — Master RGB, Red, Green, Blue spline curves with S-curve/Matte/Negative presets, Linear & Radial gradient grading masks, and Reference Photo Match.
- **Live Scopes** — RGB Histogram, Luminance Histogram, Luma Waveform, plus a draggable floating **Live RGB Histogram HUD** on the canvas stage.
- **Tone Presets & Gradient Maps** — Searchable Mono/Duo/Trio/Multi/Film tone presets, interactive multi-stop gradient ramp editor (RGB, Smooth, Linear, Hard Steps, OKLab interpolation), Duo/Trio from image, and Color Harmony generator.
- **Light & Finish Adjustments** — Brightness, Contrast, Saturation, Hue Shift, Warmth, Vignette, Grain, Posterize, Levels (Black/White/Gamma + Auto Levels), Split Toning, Retro Dither, Soft Glow, and Invert.
- **Palette & Selective Color Edits** — Quantized image palette extractor (`2–16` colors), Reduce-to-Palette mode, and per-color tolerance replacement.
- **Film Stocks & Double Exposure** — Authentic film stock presets, grain & halation finish, saved film looks, batch photo grading, and multi-photo Double Exposure blending.

### 3. Photoshop-Class Editing, Layers, Masks, Draw & Warp (`Edit` Tab)
- **Full Multi-Layer Stack** — Drag-and-drop reorder, blend modes (**scroll mouse wheel over Blend dropdown for live preview!**), opacity, visibility, solo (`Alt+Click` eye), lock, duplicate (`Ctrl+J`), merge down, flatten, flip, rotate 90°, and custom crop insets.
- **Layer Search & Color-Coded Layer Tags** — Instant filter-by-name search bar and 5 color tag accents (*Red, Amber, Green, Cyan, Violet*) right in the Layers panel.
- **Figma/Canva Layer Align & Fit Bar** — 1-click *Align Left, Center H, Right, Top, Center V, Bottom, Fit Canvas, Fill Canvas*.
- **Figma-Style Smart Alignment Snap Guides** — Live magenta snap lines while dragging layers to canvas center or other layers' centers (hold `Alt` to bypass).
- **Photoshop `.PSD` Multi-Layer Import & Export All Layers `.ZIP`** — Import real Adobe Photoshop `.psd` files with editable layers intact (`ag-psd`), or export every layer as separate numbered transparent PNGs in one `.zip`.
- **Non-Destructive Layer Masks & Vector Masks** — White/Black/Selection/Luminance-Range/Depth-Map masks, Feather, Density, Clipping Mask, Hide/Reveal/Edge-Smooth/Hair-Refine mask brushes, and editable Rectangle/Ellipse/Path vector masks.
- **Layer Effects Stack & Die-Cut Sticker FX** — Non-destructive Tone Curve/Film/Grain/Halation layer effects + **Sticker & Layer FX** studio (*Die-Cut White/Colored Sticker Outline, Drop Shadow, Cyber Neon Outer Glow* with 1-click presets).
- **Retouching Brushes** — Spot Healing, Healing Brush, Clone Stamp, Patch Selection, Red Eye, Dodge, Burn, Sponge (Desaturate), Soften, and Sharpen.
- **Cutout & Selection Suite** — Magic Wand, Color Range, Object Select, Selection Paint, Freehand Lasso, Polygon Lasso, Rectangle, Ellipse, Replace/Add/Subtract modes, Shadows/Midtones/Highlights luminosity select, Auto Subject, Feather/Grow/Shrink/Smooth edges, and Saved Reusable Masks.
- **Crop & Transform** — Interactive crop box with aspect ratio presets, straighten/rotate, and **1-Click Auto-Trim Transparency**.
- **8-Tool Draw & Paint Studio** — Brush (8 tips: *Hard Round, Soft Airbrush, Neon Glow Pen, Chisel Marker, Calligraphy Pen, Charcoal/Chalk, Ink Splatter, Pixel Art Pen*), Eraser, Flood Fill Bucket (tolerance + contiguous), Linear/Radial Gradient, Line/Arrow, Rectangle, Circle, and Eyedropper (`Alt+Click` quick pick, `X` swap colors, Mirror Symmetry, dedicated Paint Layers).
- **Warp Brushes & Interactive Liquify Sculpt** — On-canvas Push, Swirl, Bloat, Pucker, Pixel/Color/Texture brushes (with pressure & mirror support) + dedicated **Liquify Sculpt Studio** with bilinear resampling, stroke undo, and full-res apply.
- **Offline Magic Object Eraser** — Paint over unwanted objects, wires, blemishes, or text for instant offline multi-pass diffusion inpainting.
- **Privacy Redact Tool** — Drag boxes over sensitive info (emails, cards, faces, screenshots) to apply **Pixelate**, **Heavy Blur**, **Black Bar**, or **Smart Color Fill** (auto-matches surrounding background).
- **Pro Bezier Pen Tool** — Click-and-drag cubic Bezier curves with tangent handles to create razor-sharp **Vector Cutouts**, **Filled Shapes**, or **Stroked Paths**.

### 4. Canva-Style Design Studio, Multi-Page Decks, Typography & Overlays (`Design` Tab)
- **Canva-Style Multi-Page Designs** — Add unlimited pages (`+ Page`), live page thumbnail strip, instant page switching preserving all layers/masks/grades, duplicate, reorder (`◀ / ▶`), delete, and **automatic new page** whenever you apply a Template, New Design, Collage, or Mockup so nothing is ever overwritten.
- **New Design & Magic Resize** — Social/print canvas presets (*Instagram Post/Story, TikTok, YouTube Thumbnail, Poster, Album Cover, X Banner, A4*) + custom dimensions & Magic Resize keeping all layers.
- **12 Multi-Layer Editable Templates** — Magazine covers, Y2K posters, Frutiger Aero layouts, concert flyers, album art, and social cards with ambient glow layers.
- **16 Editable Warpable Shapes + 8-Point Freeform Mesh** — Parametric warps (*Arc, Wave, Bulge, Twist, 3D Perspective, Squeeze, Skew*) + interactive 8-point Coons-patch Freeform Mesh directly on canvas, Base Photo Fill, and 4 surface finishes (*Flat, Frutiger Aero Gloss, Y2K Liquid Chrome, Cyber Neon Glow*).
- **Graphics & Stickers Pack** — 20 one-click vector/procedural graphics (*Polaroid Frame, Tape Strip, Promo Burst, 35mm Film Strip, Minimal Tag, Soft Aura Glow, Glossy Glass Orbs, Chrome Stars, Retro OS Windows, Energy Flares, Wireframe Globes, Barcodes*).
- **Web Elements Search** — Search CORS-safe cutouts, photos, stickers, and icons via Wikimedia Commons & Iconify, plus Pinterest/Google quick bridge, URL import with high-visibility blocked-site copy/paste popup, and auto white-background removal.
- **12 Photo Frames & Photo Collage Grids** — Clip photos into shapes (*Circle, Arch, Heart, Star, Blob, Polaroid, etc.*) with optional border, or build instant `2-Up Side`, `2-Up Stack`, `3-Panel Triptych`, and `2×2` collages.
- **Creative QR Studio (8 Scannable Modes)** — *Rounded Dots, Classic Crisp, Liquid Squircle, Y2K Cyber Matrix, Frutiger Aero Glass, Gradient Spectrum, Starlight Sparkles, and Sticker Card ("SCAN ME")* with 2-color ink gradients, center text/initials or custom logo image upload (High Error Correction `H`), live preview, add as layer, or download 1024px PNG.
- **Pro Typography & Custom Local Fonts** — 40+ Google Fonts + **Upload Custom Fonts (`.ttf`, `.otf`, `.woff`, `.woff2` persisted in IndexedDB)**, font pairings, text-on-path (*Arc, Circle, Drawn Path*), custom multi-point warped lettering, 3D extrusion, stretch bands, photo-filled letters, gradient fills, stroke, text background pills, and copy/paste text styles.
- **30+ Procedural HD Studio Overlays & Optical Highlight Glints** — Categorized live-preview overlays (*Light Leaks, Bokeh & Sparkles, Film & Grunge Textures, Weather & Atmosphere, Frames & Viewfinders*) with Blend Mode, Opacity, Hue Tint, Flip, and Randomize Seed — plus customizable 4/6/8/10-point optical star glints & film halation.

### 5. Filters, Retro/Pixel & Pro Lab (`FX` Tab)
- **38 Live-Preview FX Filters** — Searchable & categorized (including Y2K, Frutiger Aero, Cybercore, Glitch, Chromatic Aberration, Halftone, Oil Paint, Thermal, CRT, Sketch, Emboss, Motion Blur, Bloom, Duotone) with **Apply to Everything (New FX Layer / Flatten)**, selected layer, or base photo + **Perspective & Skew**.
- **Optical Camera Lens Lab** — **Tilt-Shift Miniature Blur**, **Cinestill 800T Red Halation**, **Radial Zoom Blur**, **Fisheye / Barrel Distortion**, and **Fluted Glass Refraction**.
- **Interactive 3D Card & Foil Rotator** — Drag in 3D space (`Rotate X / Y`), dynamic holographic foil sheen, corner radius, soft 3D shadow, and transparent PNG download.
- **Screenshot Beautifier *(Shots.so / Ray.so style)*** — Wrap screenshots in *macOS Dark, macOS Light, Frosted Glass, Minimal Browser, or Clean Rounded* frames with 8 mesh-gradient wallpapers, padding, radius, and soft drop shadow.
- **Multi-Page Slideshow / Reels Video Exporter (`.webm` / `.mp4`)** — Turn your Pages or canvas into a 720p/1080p video with *Crossfade, Slide Left, Ken Burns Zoom, or Cyber Glitch* motion.
- **Animated GIF Maker (`gifenc`)** — Export looping `.gif` animations (*VHS Glitch, RGB Pulse, Holo-Scan, Ken Burns Zoom, 360° Spin, Layer Flipbook*).
- **SVG Image Vectorizer (`imagetracerjs`)** — Illustrator-style raster-to-SVG tracing (*Posterized, Detailed, Sharp Logo, Artistic, Monochrome*) with color count slider.
- **Device & Physical Media Mockups** — *iPhone Pro, MacBook Pro, Y2K CD Jewel Case, Vinyl Record & Sleeve, Framed Gallery Print*.
- **10 Open-Source Pro Lab Tools** — *Smart AI Auto-Crop, Low-Poly Delaunay Vector/SVG Art, Kim Asendorf Pixel Sorting Glitch, Retro Dithering & CMYK Halftone (Atkinson / Floyd-Steinberg / Bayer 8×8 / Game Boy), Color Blindness Simulator & WCAG Contrast Checker, Kaleidoscope / Mandala Symmetry, 4-Corner Perspective Document Scanner, Circular Avatar / PFP Studio (512px), Meme & Social Caption Wrapper, and CLAHE Auto Restore*.
- **Creative Extras** — **ASCII & Matrix Art Converter** (layer or text copy), **Seamless 2×2 Mirror & Photoshop Offset Tile**, **Instagram Carousel & 3×3 Grid Slicer (`.ZIP`)**, **Before / After Split Comparison PNG**, **Dominant 6-Color Palette Extractor + Pantone Swatch Strip**, **Saved Custom Looks Manager**, **Tiled Copyright Watermark**, and **Camera EXIF Metadata Inspector** (`exifr`).
- **Live Camera & Webcam Photo Booth** — Snap photos directly from your webcam or phone camera (front/back switch, mirror toggle, 3-second self-timer, 6 live filters) onto a new page or as a layer.
- **Print & Merch Studio** — **CMYK Soft-Proofing**, **Out-of-Gamut Neon Warning**, **Die-Cut Sticker Sheet Packager** (`2×3`, `3×4`, `4×5`), and **300 DPI Print PDF with Crop Marks & Bleed**.
- **Full Favicon & App-Icon Pack Builder (`.ZIP`)** — Generates `favicon.ico`, `16–512px` PNGs, `apple-touch-icon.png`, `site.webmanifest`, and copy-paste `head-tags.html` in one `.zip`.

### 6. Export Studio, Sessions, Settings, PWA & Workflow QoL
- **Pro Export Studio (`Ctrl+S` / `Ctrl+E`)** — Export to **PNG, JPEG, WebP, AVIF, ICO (256×256), SVG, or Print-Ready PDF** with scale presets (`25%–400%`), **Custom `Width × Height`** with aspect lock, **Exact Target Max File Size (`MB` / `KB`)** auto-optimizer (Discord `10 MB`, `2 MB`, `500 KB`, `150 KB` presets + live estimated byte size), and **All Pages / Custom Page Ranges (`1, 3-5`)** multi-page PDF or `.ZIP` export.
- **Batch Image Converter & Compressor (`.ZIP`)** — Bulk convert, resize, and compress entire folders of images locally into WebP/JPEG/PNG inside one `.zip`.
- **Previous Sessions Gallery (IndexedDB)** — Gzip-compressed automatic & manual browser saves preserving all layers, masks, text, and Develop sliders, with visual thumbnails, search, pin (`★`), rename, download `.totone`, and instant restore.
- **Settings & Theme Customizer (`Ctrl+,`)** — 8 preset themes (*Totone Navy, Midnight OLED, Cybercore Lime, Frutiger Aero, Sakura Dusk, Studio Neutral, Warm Film, Paper Light*), custom Accent/Background/Panel/Text pickers, corner radius, UI density, interface font, Left/Right sidebar, sidebar width, translucent glass popups, Pixel Art nearest-neighbor rendering, stage backdrop, transparency grid, Social Safe-Zone overlays (*Rule of Thirds, Golden Ratio, Crosshair, TikTok/Reels, YouTube Thumbnail, 1:1 Crop*), Export/Import Settings JSON, and searchable Shortcuts tab.
- **Workspace Productivity** — Spotlight Command Palette (`Ctrl+K` / `/`), 26-tool Left Quick-Tool Dock with instant hover tooltips, Floating Layer Context Bar, Right-Click Canvas Context Menu, Canvas Rulers & Snap Grid (`Ctrl+'`), Visual History Timeline, Side-by-Side Version Comparison, Draggable On-Canvas Split Wipe, Auto-Showing Zoom Navigator Minimap, Middle-Click Pan, Scroll-Wheel Zoom, Multi-Image Drag-and-Drop, `Ctrl+V` Clipboard Paste, `Ctrl+Shift+C` Copy Canvas PNG, and Plain-Text **Patch Notes** (`⋯ → Patch Notes`).
- **Native-Style Mobile UI & Installable PWA** — Single-row `46px` mobile header, draggable 3-snap native bottom sheet, `20px` touch-friendly sliders, full-bleed bottom-sheet modals, safe-area inset support, offline Service Worker, and standalone **Install Totone App** support on Windows, Mac, iOS, and Android.

---

## Install as an App (PWA)

1. Open **[averywsc.github.io/totone](https://averywsc.github.io/totone/)**.
2. **Desktop (Chrome / Edge)**: Click the Install icon in the address bar or open `⋯ → Install Totone App`.
3. **iPhone / iPad (Safari)**: Tap **Share → Add to Home Screen**.
4. **Android (Chrome)**: Tap **Install App**.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+K` or `/` | Spotlight Command Palette |
| `Ctrl+,` | Settings & Theme Customizer |
| `Ctrl+S` / `Ctrl+E` | Export Studio |
| `Ctrl+Z` / `Ctrl+Y` | Undo / Redo |
| `Ctrl+J` | Duplicate active layer (Layer via Copy) |
| `Ctrl+V` | Paste image from clipboard as layer |
| `Ctrl+Shift+C` | Copy full rendered canvas PNG to clipboard |
| `Ctrl+'` | Toggle Canvas Rulers & Snap Grid |
| `V / W / B / U / T / C / G / Q` | Move · Select · Draw · Design · Type · Crop · Grade · Warp |
| `[` / `]` | Decrease / Increase active brush size |
| `X` | Swap Draw colors / Flip Erase ↔ Restore cutout brush |
| `Hold \` | Compare original before/after |
| `Middle-Click Drag` / `Wheel` | Pan canvas / Zoom canvas |
| `Double-click slider` | Reset any slider to default |
| `Right-click canvas` | Quick layer & AI context menu |

---

## Architecture

Totone is a zero-build static web app — open `index.html` via any static server or deploy directly to GitHub Pages:

```text
totone/
├── index.html               # App shell, 5-category sidebar, left dock, pages bar & studio modals
├── manifest.json            # PWA web app manifest (standalone installable app)
├── sw.js                    # Offline Service Worker (stale-while-revalidate asset cache)
├── css/
│   ├── core.css             # Core Totone layout, typography & base controls
│   └── studio.css           # Themes, single-row header, mobile bottom sheet & all studio UI
└── js/
    ├── core.js              # Core canvas renderer, layers, masks, retouch, film, text & .totone I/O
    ├── studio-canva.js      # Templates, 16 warpable shapes + 8-pt mesh, graphics, frames & collages
    ├── studio-ps.js         # 8-tool Draw engine, offline BG remover, 38 live filters & skew
    ├── studio-ux.js         # Left tool dock, floating context bar, rulers/grid, history & status bar
    ├── studio-lightroom.js  # Basic Light & Tone, Point Color, 8-dot HSL & 3-up grading wheels
    ├── studio-ai.js         # Transformers.js RMBG-1.4/MODNet, Depth Anything V2 bokeh & 8-mode Creative QR
    ├── studio-pro.js        # .CUBE 3D LUTs, SVG vectorizer, GIF maker, device mockups, OCR & EXIF
    ├── studio-settings.js   # Theme engine, Settings studio, safe zones, RGB Histogram HUD & Ctrl+K Palette
    ├── studio-magic.js      # Liquify sculpt, Magic Eraser, Palette/Looks, jsPDF & JSZip Batch Converter
    ├── studio-power.js      # Pro Export Studio (7 formats + MB/KB cap), Sticker FX, Redact, Trim, ASCII, Tile & Slicer
    ├── studio-overlays.js   # 30+ HD procedural studio overlays & Elements blocked-URL popup
    ├── studio-lab10.js      # 10 Open-Source Pro Lab tools (SmartCrop, Low-Poly, Pixel Sort, Dither, CVD, Scanner, PFP, Meme, CLAHE)
    ├── studio-polish.js     # 5-category navigation, instant dock tooltips, blend scroll & mobile bottom sheet
    ├── studio-cutout-pro.js # Cutout Erase/Restore/Soft-Edge brush, Backdrop Swapper, 24 Grade Presets, Align, Split Wipe & Minimap
    ├── studio-sessions.js   # IndexedDB Previous Sessions gallery with gzip autosave & thumbnails
    ├── studio-pages.js      # Multi-page engine, auto-new-page hooks & All/Custom Page PDF/ZIP export
    ├── studio-ultimate.js   # PWA installer, Screenshot Beautifier, Font Uploader, Smart Snap, Slideshow Video, Portrait Retouch, Annotations & PSD/Layer ZIP
    ├── studio-nextgen.js    # Patch Notes, 3D Relighting, Movie Color Transfer, Optical Lens Lab, 3D Card/Foil, Bezier Pen & Print/Merch
    └── studio-wave6.js      # Shareable Color Grade Links (?look=), Live Camera Booth, Favicon Pack Builder & Layer Search/Color Tags
```

### Running Locally

```bash
git clone https://github.com/averywsc/totone.git
cd totone
python -m http.server 8765
# Open http://127.0.0.1:8765/
```

---

## Open-Source Repositories, Algorithms & APIs Credited

Totone builds on and adapts algorithms from incredible free, open-source projects (loaded cleanly on demand from CDN or implemented directly in vanilla JS with attribution):

- [**huggingface/transformers.js**](https://github.com/huggingface/transformers.js) (Apache-2.0) — On-device WebGPU/WASM AI inference (`briaai/RMBG-1.4`, `Xenova/modnet`, `onnx-community/depth-anything-v2-small`)
- [**withoutbg/withoutbg-python**](https://github.com/withoutbg/withoutbg-python) — Inspiration for Totone's open-weights AI cutout & edge-decontamination workflow
- [**thekevinscott/UpscalerJS**](https://github.com/thekevinscott/UpscalerJS) & [**tensorflow/tfjs**](https://github.com/tensorflow/tfjs) (MIT / Apache-2.0) — Browser-native ESRGAN 2× / 4× AI super-resolution upscaling
- [**upscayl/upscayl**](https://github.com/upscayl/upscayl) — Inspiration for Totone's split-screen AI Upscaler preview UX
- [**Agamnentzar/ag-psd**](https://github.com/Agamnentzar/ag-psd) (MIT) — Adobe Photoshop `.PSD` multi-layer file importer
- [**jwagner/smartcrop.js**](https://github.com/jwagner/smartcrop.js) (MIT) — Content-aware saliency & focal-point automatic image cropping
- [**mapbox/delaunator**](https://github.com/mapbox/delaunator) (ISC) — Fast Delaunay triangulation powering Low-Poly vector/SVG art generation
- [**jankovicsandras/imagetracerjs**](https://github.com/jankovicsandras/imagetracerjs) (Public Domain / Unlicense) — Raster-to-SVG vector image tracing
- [**mattdesl/gifenc**](https://github.com/mattdesl/gifenc) (MIT) — Fast client-side animated GIF encoding
- [**naptha/tesseract.js**](https://github.com/naptha/tesseract.js) (Apache-2.0) — Local in-browser OCR text extraction
- [**Stuk/jszip**](https://github.com/Stuk/jszip) (MIT / GPLv3) — Client-side `.zip` archives for Multi-Page Export, Batch Converter, Layer Export, IG Slicer & Favicon Packs
- [**parallax/jsPDF**](https://github.com/parallax/jsPDF) (MIT) — Client-side multi-page & 300 DPI crop-mark `.pdf` export
- [**MikeKovarik/exifr**](https://github.com/MikeKovarik/exifr) (MIT) — Camera EXIF, lens, exposure & GPS metadata reader
- [**kazuhikoarase/qrcode-generator**](https://github.com/kazuhikoarase/qrcode-generator) (MIT) — Client-side QR code matrix synthesis
- [**kimasendorf/ASDFPixelSort**](https://github.com/kimasendorf/ASDFPixelSort) (MIT) — Interval-based brightness/hue/saturation pixel sorting algorithm
- [**danielepiccone/ditherjs**](https://github.com/danielepiccone/ditherjs) (MIT) & **Bill Atkinson (1984)** — Atkinson 1-bit, Floyd-Steinberg, Ordered Bayer 8×8, and CMYK halftone dithering algorithms
- [**skratchdot/color-blind**](https://github.com/skratchdot/color-blind) (MIT) & **Viénot / Machado CVD Matrices** — Color-vision deficiency simulation matrices + WCAG 2.1 contrast checker
- **Erik Reinhard et al. (2001, IEEE CG&A)** — `lαβ` Statistical Color Transfer between images
- **Karel Zuiderveld (1994, Graphics Gems IV)** & **G. Buchsbaum (1980)** — Tiled bilinear CLAHE Adaptive Histogram Equalization & Gray-World Auto White Balance
- [**Wikimedia Commons API**](https://commons.wikimedia.org/) & [**Iconify API**](https://iconify.design/) — CORS-safe cutout, photo, sticker, and icon search

---

## Support

If Totone saves you time or helps you make cool art, consider supporting development:
**[buymeacoffee.com/averyuwubaka](https://buymeacoffee.com/averyuwubaka)**
