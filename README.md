# Totone

**An all-in-one, browser-native photo editor, color grading suite, and graphic design studio — combining Photoshop, Lightroom, Canva, Illustrator Image Trace, and on-device AI tools with zero backend, zero sign-up, and 100% local privacy.**

[![Live App](https://img.shields.io/badge/Launch-Totone-091534?style=for-the-badge)](https://averywsc.github.io/totone/)
[![Support](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/averyuwubaka)
[![Static Zero-Build](https://img.shields.io/badge/Zero--Build-HTML%20%2F%20CSS%20%2F%20JS-38bdf8?style=for-the-badge)](#architecture)

---

## Highlights

- **100% Client-Side & Private** — Your photos never leave your device. Even the AI models (Background Removal, ESRGAN Upscaling, Depth Bokeh, and OCR) download once, cache locally in your browser, and run offline on WebGPU / WebGL / WebAssembly.
- **Photoshop + Lightroom + Canva in One Tab** — Non-destructive layers, masks, retouching, curves, Point Color stage-light skin recovery, 3-up color wheels, 38 live-preview filters, 16 warpable vector shapes with an interactive 8-point freeform mesh, templates, mockups, and `.totone` editable project files.
- **Zero Build Step** — Pure static HTML, CSS, and modular JavaScript ready for GitHub Pages or any static host.

---

## Feature Breakdown

### On-Device Neural AI Studio
- **AI Background Removal (`RMBG-1.4` & `MODNet`)** — Studio-grade neural cutouts via Transformers.js with live progress, edge halo decontamination, non-destructive Layer Masks, and instant post-cutout quick actions (*Refine hair*, *+ Sticker outline*, *+ Drop shadow*, *Swap background*, *Photo frame*), plus fast offline fallback modes.
- **AI Image Upscaler (Upscayl-style ESRGAN)** — 2× and 4× super-resolution via TensorFlow.js & UpscalerJS (`ESRGAN Medium`, `ESRGAN Slim`, `ESRGAN Photo GAN`) plus an instant offline **Crisp Detail** engine, interactive before/after split zoom preview, alpha preservation, and Whole Photo or Selected Layer targeting.
- **AI Depth Map & DSLR Portrait Bokeh (`Depth Anything V2`)** — Generates a neural depth map for realistic variable-depth background blur or feeds straight into Totone's Layer Depth Mask controls.
- **AI OCR Magic Grab Text (`Tesseract.js`)** — Extracts text locally from screenshots, scans, or posters and converts it straight into editable canvas text layers.

### Lightroom-Style Color Grading & Develop
- **Basic Develop Panel** — `Auto`, `B&W`, `HDR`, White Balance presets + `Pick WB` eyedropper, and all 13 non-destructive sliders (*Temp, Tint, Exposure, Contrast, Highlights, Shadows, Whites, Blacks, Texture, Clarity, Dehaze, Vibrance, Saturation*) with colored tracks.
- **Point Color & Stage-Light Skin Recovery** — Sample any harsh light cast on a photo (e.g., red or purple concert lighting on skin) and remap it cleanly into realistic skin tones (*Fair, Warm, Tan, Deep, White*, or any custom target colour) with Hue/Sat/Lum Shift, Color Unify/Variance, Range, and Lightroom-style **Visualize Range** mask preview.
- **8-Dot Visual Color Mixer (HSL)** — Dedicated Red–Magenta colour rings synced with per-band Hue, Saturation, Lightness, and Hue Range controls.
- **3-Up Color Grading Wheels** — Simultaneous draggable **Midtones**, **Shadows**, and **Highlights** wheels with individual luminance sliders, Balance, and Blending.
- **`.CUBE` 3D LUT Import & Export** — Load any DaVinci Resolve, Premiere, or Lightroom `.cube` 3D LUT with live strength control, or export your current Totone grade as a `17×17×17` `.cube` file.
- **Live Scopes, Curves & Reference Match** — RGB/Luma histograms, waveform monitor, Master/R/G/B tone curves, local linear/radial/saved grading masks, and reference-photo colour matching with skin protection.

### Photoshop Editing, Drawing & 38 Live-Preview Filters
- **Layers & Non-Destructive Masks** — 17 blend modes, drag-reorder, solo/lock, clip-to-below, bitmap/luminance/depth/vector masks, Smooth Edge & Refine Fine Detail hair brushes, Saved Masks bank, and reorderable Layer Effects Stacks.
- **Draw & Paint Studio** — 8 tools (*Brush, Eraser, Paint Bucket Flood Fill, Interactive Gradient Fill, Line/Arrow, Rect, Circle, Live Eyedropper*) and 8 brush tips (*Hard Round, Soft Airbrush, Neon Glow Pen, Chisel Marker, Calligraphy, Chalk, Splatter, Pixel Art*), mirror symmetry, pen pressure, and `Alt+Click` quick colour sampling.
- **Retouch & Liquify Warp** — Spot Healing, Healing Brush, Clone Stamp, Patch Selection, Red Eye, Dodge, Burn, Sponge, Blur/Sharpen, plus full Liquify Warp / Swirl / Bloat / Combine brushes.
- **38 Live-Preview Filters (Apply to Everything or Single Layer)** — Apply across the entire composition as a non-destructive top FX layer or flattened bake, with search & category chips:
  - *Cyber / Y2K*: Holo-Scan, Liquid Chrome, Energy Streaks, Liquid Marble, Pixel Sort, Matrix Rain, Cyber Neon Edges
  - *Retro / Glitch*: Blue Dither, CRT Phosphor, VHS Glitch, 3D Anaglyph, RGB Split, Night Vision CCTV, Cross-Process 90s
  - *Glow / Aero*: Aero Glass Gloss, Aqua Caustics, Dreamy Orton Glow, Sunburst Rays, Lens Bokeh Blur, Thermal FLIR
  - *Art / Print*: Infrared Aerochrome, Solarize Darkroom, Riso Print Offset, Comic Cel-Shade, Watercolor Wash, Halftone Pop, Oil Paint, Kaleidoscope, Emboss Relief, Find Edges
  - *Blur / Lens*: Gaussian Blur, Motion Blur, Radial Zoom Blur, Tilt-Shift Focus, Lens Fisheye, Vortex Swirl, Frosted Glass, High-Pass Sharpen
- **Film Lab, Glints & Pixel Art** — Cinematic film stocks, organic grain, highlight star filters/anamorphic streaks, double exposure, batch ZIP look export, and 64 pixel/ASCII/dither styles.

### Canva-Style Graphic Design Studio
- **New Design & Magic Resize** — One-click social & print canvas presets (*Instagram Post, Story/TikTok, YouTube Thumbnail, Poster 4:5, Album Cover, X Banner, Presentation, A4*) plus non-destructive **Magic Resize**.
- **12 Studio-Crafted Multi-Layer Templates** — *Cyberworld 2000, Xbox 2001 Energy, Frutiger Aero 06, Cybercore Holo, Magazine Cover, YouTube Thumb, Streetwear Poster, Album Cover, Minimal Quote, Story/Reel Promo, Y2K Cyber Flyer,* and *Product Launch*.
- **16 Editable Warpable Shapes** — Live solid/gradient/**photo fills**, strokes, corner radius, drop shadow, **Surface Finishes** (*Flat, Frutiger Aero Gloss, Y2K Liquid Chrome, Cyber Neon Glow*), **7 parametric warps** (*Arc, Wave, Bulge, Twist, Perspective, Squeeze, Skew*), and an **interactive 8-point Freeform Coons-Patch Mesh Warp** right on the canvas.
- **Y2K · Frutiger Aero · Cybercore Graphic Pack** — 14 procedural high-res layers (*Wireframe 3D Globe, Orbit Star Ring, Win98 OS Window, Cyber Barcode, R·Restricted Stamp, Holographic CD, Aero Glass Orb, Aero Gel Pill, Water Droplets, Energy Arc Flare, Holo Sparkles, HUD Tech Grid, Chrome Swirl, Aero Aurora Wave*).
- **Photo Frames, Collage Grids, Font Pairings, QR Codes & Brand Kit** — 12 mask frames, 2-Up/Triptych/2×2 photo collages, 50+ Google Fonts with text-on-path & 3D extrusion, custom rounded QR code generator, and persistent Brand Swatches.
- **Web Elements Search** — Built-in CORS-safe search across Wikimedia Commons (*Cutouts/PNGs & Photos*) and Iconify (*200,000+ Stickers & Recolorable Icons*) with optional white-background removal, plus quick-launch links and instant `Ctrl+V` paste workflow for Pinterest & Google Images.

### Pro Output & Utilities
- **SVG Image Vectorizer (`imagetracerjs`)** — Illustrator-style Image Trace to downloadable `.svg` or crisp vector layer.
- **Animated GIF Maker (`gifenc`)** — Export looping *VHS Glitch, RGB Pulse, Holo-Scan, Ken Burns Zoom, 360° Spin,* or *Layer Flipbook* animations as `.gif`.
- **Studio Device & Media Mockups** — Wrap your design into an *iPhone Frame, MacBook Pro, Y2K CD Jewel Case, Vinyl Record & Sleeve,* or *Framed Gallery Print*.
- **Tiled Watermark & EXIF Inspector (`exifr`)** — Inspect camera/lens/ISO/shutter/GPS metadata (exports automatically strip private EXIF/GPS).
- **Editable `.totone` Projects, Versions & Recovery** — Gzipped `.totone` project bundles, 4-up linked-zoom version comparison, Visual History Timeline, and automatic IndexedDB crash recovery.

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `/` or `Ctrl+K` | Open instant Tool Finder |
| `V` / `W` / `B` / `U` / `T` / `C` / `G` / `Q` | Layers · Select · Draw · Design · Text · Crop · Grade · Warp |
| `Ctrl+J` | Layer via copy (selected region or duplicate active layer) |
| `Ctrl+'` | Toggle canvas rulers & snap grid |
| `Ctrl+Z` / `Ctrl+Y` | Undo / Redo |
| `[` and `]` | Decrease / increase active brush size |
| `X` (in Draw) | Swap foreground & secondary colour |
| `Alt + Click` (in Draw) | Quick eyedropper colour picker |
| `Hold \` | Compare original |
| `Space + Drag` / `Ctrl + Wheel` | Pan / zoom canvas at pointer |
| `Double-click slider` | Reset any slider to its default value |
| `Right-click canvas` | Quick layer & export context menu |
| `Ctrl+V` / `Ctrl+S` | Paste image as layer / Export Studio |
| `Ctrl+K` / `Ctrl+,` | Spotlight Command Palette / Settings & Theme Customizer |
| `Ctrl+Shift+C` | Copy full rendered canvas PNG to clipboard |

### Studio Overlays, Export Studio, Settings & Pro Lab (10 Open-Source Tools)
- **30+ Procedural HD Studio Overlays** — Light Leaks (35mm Kodak Burn, Anamorphic Cyan, Prism Rainbow), Bokeh & Sparkles (Warm, Cyber, 4-Point Stars, Hearts), Film & Grunge Textures (Dust & Scratches, Folded Paper, Plastic Wrap, Wet Glass, CRT Scanlines, VHS Tracking), Weather (Volumetric Fog, Snow, Rain, God Rays, Smoke, Aurora), and Frames (1999 Camcorder REC, DSLR HUD, Cinema 2.39:1) with Blend Mode, Hue Tint, Flip & Randomize Seed.
- **Pro Export Studio** — Export to **PNG, JPEG, WebP, AVIF, ICO (256×256 Favicon), SVG, or Print-Ready PDF** with custom `Width × Height` px, aspect-ratio lock, and an **Exact Target Max File Size (`MB` / `KB`)** auto-optimizer (binary-searches quality & progressive scale with Discord `10 MB`, `2 MB`, `500 KB`, `150 KB` presets + live estimated byte size).
- **Settings & Theme Customizer (`Ctrl+,`)** — 8 preset themes (*Totone Navy, Midnight OLED, Cybercore Lime, Frutiger Aero, Sakura Dusk, Studio Neutral, Warm Film, Paper Light*), custom color pickers, corner radius, density, font, left/right sidebar, Pixel Art nearest-neighbor mode, Social Safe-Zone overlays (Rule of Thirds, Golden Ratio, TikTok/Reels, YouTube Thumbnail), draggable **Live RGB Histogram HUD**, and JSON settings export/import.
- **Magic & Power Tools** — Interactive **Liquify Sculpt** (Push, Bloat, Pucker, Twirl, Reconstruct), offline **Magic Object Eraser**, **Die-Cut Sticker & Layer FX** (white outline, drop shadow, neon glow), **Privacy Redact** (Pixelate, Blur, Black Bar, Smart Background-Match Fill), **Auto-Trim Transparency**, **Color Palette Extractor & Saved Looks**, **Batch Image Converter (.ZIP)**, **Before / After Comparison PNG**, **ASCII & Matrix Art**, **Seamless Texture Tile**, and **Instagram Carousel / 3×3 Grid Slicer**.
- **Pro Lab (10 Open-Source Tools)** — Smart AI Auto-Crop (`smartcrop.js`), Low-Poly Delaunay Vector Art (`Delaunator`), Kim Asendorf Pixel Sorting (`ASDFPixelSort`), Retro Dithering & CMYK Halftone (Atkinson, Floyd-Steinberg, Bayer 8×8, Game Boy), Color Blindness Simulator & WCAG Contrast Checker, Kaleidoscope / Mandala Mirror Art, 4-Corner Perspective Document Scanner, Circular Avatar / PFP Studio, Meme & Social Caption Wrapper, and CLAHE Adaptive Contrast + Gray-World Auto White Balance Restoration.

---

## Architecture

Totone is a static multi-file web app with no bundler or server required:

```text
totone/
├── index.html              # App shell, 3-row categorized 15-tab workspace, left tool dock & modals
├── css/
│   ├── core.css            # Core Totone dark-navy theme & responsive layout
│   └── studio.css          # Theme variables, single-row header, dock, Export Studio, Overlays & Pro Lab UI
└── js/
    ├── core.js             # Core canvas renderer, layers, masks, retouch, film, text & .totone I/O
    ├── studio-canva.js     # Templates, 16 warpable shapes + 8-pt mesh, graphics, frames & collages
    ├── studio-ps.js        # 8-tool Draw engine, offline BG remover, 38 live-preview filters & skew
    ├── studio-ux.js        # Left tool dock, floating context bar, rulers/grid, history, status bar & menus
    ├── studio-lightroom.js # Basic Develop, Point Color skin/stage-light recovery, 8-dot HSL & 3-up wheels
    ├── studio-ai.js        # Transformers.js RMBG-1.4/MODNet cutouts, Depth Anything V2 bokeh & QR codes
    ├── studio-pro.js       # .CUBE 3D LUTs, SVG vectorizer, GIF maker, device mockups, OCR & EXIF
    ├── studio-settings.js  # Theme engine, Settings studio, Safe-Zone overlays, RGB Histogram HUD & Ctrl+K Palette
    ├── studio-magic.js     # Interactive Liquify, Offline Magic Eraser, Palette/Looks, jsPDF & JSZip Batch Converter
    ├── studio-power.js     # Pro Export Studio (7 formats + exact MB/KB cap), Sticker/Layer FX, Redact, Trim, ASCII, Tile & Slicer
    ├── studio-overlays.js  # 30+ HD procedural studio overlays, main Remove BG buttons & Elements CORS popup
    └── studio-lab10.js     # 10 Open-Source Pro Lab tools (SmartCrop, Low-Poly, Pixel Sort, Dither, CVD, Scanner, PFP, Meme, CLAHE)
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

- [**huggingface/transformers.js**](https://github.com/huggingface/transformers.js) (Apache-2.0) — On-device WebGPU/WASM AI inference powering `briaai/RMBG-1.4`, `Xenova/modnet`, and `onnx-community/depth-anything-v2-small`
- [**withoutbg/withoutbg-python**](https://github.com/withoutbg/withoutbg-python) — Inspiration for Totone's open-weights AI cutout & edge-decontamination workflow
- [**thekevinscott/UpscalerJS**](https://github.com/thekevinscott/UpscalerJS) & [**tensorflow/tfjs**](https://github.com/tensorflow/tfjs) (MIT / Apache-2.0) — Browser-native ESRGAN 2× / 4× AI super-resolution upscaling
- [**upscayl/upscayl**](https://github.com/upscayl/upscayl) — Inspiration for Totone's split-screen AI Upscaler preview UX
- [**jwagner/smartcrop.js**](https://github.com/jwagner/smartcrop.js) (MIT) — Content-aware saliency & focal-point automatic image cropping
- [**mapbox/delaunator**](https://github.com/mapbox/delaunator) (ISC) — Fast Delaunay triangulation powering Low-Poly vector/SVG art generation
- [**jankovicsandras/imagetracerjs**](https://github.com/jankovicsandras/imagetracerjs) (Public Domain / Unlicense) — Raster-to-SVG vector image tracing
- [**mattdesl/gifenc**](https://github.com/mattdesl/gifenc) (MIT) — Fast client-side animated GIF encoding
- [**naptha/tesseract.js**](https://github.com/naptha/tesseract.js) (Apache-2.0) — Local in-browser OCR text extraction
- [**Stuk/jszip**](https://github.com/Stuk/jszip) (MIT / GPLv3) — Client-side `.zip` generation for Batch Image Converter & Instagram Carousel Slicer
- [**parallax/jsPDF**](https://github.com/parallax/jsPDF) (MIT) — Client-side print-ready `.pdf` export
- [**MikeKovarik/exifr**](https://github.com/MikeKovarik/exifr) (MIT) — Camera EXIF, lens, exposure & GPS metadata reader
- [**kazuhikoarase/qrcode-generator**](https://github.com/kazuhikoarase/qrcode-generator) (MIT) — Client-side custom QR code generator
- [**kimasendorf/ASDFPixelSort**](https://github.com/kimasendorf/ASDFPixelSort) (MIT) — Interval-based brightness/hue/saturation pixel sorting algorithm adapted for the Pixel Sort tool
- [**danielepiccone/ditherjs**](https://github.com/danielepiccone/ditherjs) (MIT) & **Bill Atkinson (1984)** — Classic Atkinson 1-bit, Floyd-Steinberg, Ordered Bayer 8×8, and CMYK halftone dithering algorithms
- [**skratchdot/color-blind**](https://github.com/skratchdot/color-blind) (MIT) & **Viénot / Machado CVD Matrices** — Color-vision deficiency simulation matrices + WCAG 2.1 contrast ratio checker
- **Karel Zuiderveld (1994, Graphics Gems IV)** & **G. Buchsbaum (1980)** — Tiled bilinear CLAHE Adaptive Histogram Equalization & Gray-World Auto White Balance algorithms
- [**Wikimedia Commons API**](https://commons.wikimedia.org/) & [**Iconify API**](https://iconify.design/) — CORS-safe cutout, photo, sticker, and icon search

---

## Support

If Totone saves you time or helps you make cool art, consider supporting development:
**[buymeacoffee.com/averyuwubaka](https://buymeacoffee.com/averyuwubaka)**
