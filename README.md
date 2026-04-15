# Rollpix Product Gallery for Magento 2

[Version en espanol](README_ES.md)

SPONSOR: [ROLLPIX](https://www.rollpix.com)

A modern, editorial-style product gallery module for Magento 2 that replaces the default Fotorama gallery. Features four layout modes (vertical, grid, fashion, slider), five zoom types (hover, click, lightbox, modal, disabled), thumbnail navigation with sliding highlight and overlay option, scroll focus effects, inline accordion tabs, shimmer loading, fade-in animations, mobile-first carousel experience, and full video support (MP4, YouTube, Vimeo) on both product pages and category listings.

![Magento 2](https://img.shields.io/badge/Magento-2.4.7--2.4.8-orange.svg)
![PHP](https://img.shields.io/badge/PHP-8.1--8.4-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## Features

### Layout Modes
- **Vertical**: Images stacked in a single column, product info on the side
- **Grid**: Multi-column image grid (2 or 3 columns) with product info sidebar
- **Fashion**: Alternating 1-2 image pattern (1 full-width, 2 half-width, repeat)
- **Slider**: Single image at a time with configurable transitions, arrows, dots, keyboard, and mousewheel navigation
- **Configurable Position**: Gallery on left or right side
- **Flexible Column Ratios**: 20/80 through 80/20 in 5% increments (13 options)
- **Adjustable Image Gap**: Configure spacing between images (0-40px)

### Slider Options
- **Transition Effects**: Fade (cross-fade), Slide (directional), Zoom-fade (zoom out + fade)
- **Slide Direction**: Horizontal or Vertical
- **Navigation Arrows**: Prev/next buttons with Luma-compatible styling
- **Dot Indicators**: Clickable dot navigation below the slider
- **Mousewheel Navigation**: Scroll wheel to switch slides (configurable)
- **Keyboard Support**: Arrow keys to navigate

### Thumbnail Navigation (Slider Layout)
- **Positions**: Left, Right, or Below the slider image
- **Display Styles**: Outside (alongside image) or Overlay (floating inside image with blur background)
- **Thumbnail Shape**: Square (cropped) or Preserve aspect ratio
- **Sliding Highlight**: Animated border indicator that slides between thumbnails on change (Fotorama-style)
- **Overlay Arrow Fix**: Slider arrows automatically shift inward when overlay thumbnails are active

### Zoom Options
- **Hover Magnifier**: Zoom on mouse hover with lens indicator and magnified view (right side or inside image)
- **Click Zoom**: Click to zoom into the image in-place, click again to reset
- **Lightbox**: Full-screen image viewing with GLightbox navigation, touch, and keyboard support
- **Modal Zoom**: Full-screen overlay with all product images stacked vertically; clicking image N scrolls to that image. Includes a bouncing scroll indicator that auto-hides after 3 seconds or on scroll. Close via X button, overlay click, or Escape key
- **Configurable Zoom Level**: 2x to 10x magnification (hover and click modes)
- **Disabled Option**: Turn off zoom entirely

### Inline Accordion Tabs
- Move product detail tabs (Description, Additional Info, Reviews) inside the product info column as collapsible accordion sections
- Description truncation with gradient fade and "Read more" link (configurable max height)
- Desktop only: on mobile, original Magento tabs are restored

### Effects & Animations
- **Shimmer Loading**: Animated shimmer placeholder while images load, with smooth fade-in on completion. Includes JS timeout fallback (4s) and CSS animation fallback (5s)
- **Fade-in on Scroll**: Subtle opacity + slide-up animation when images enter the viewport (alternative to shimmer)
- **Scroll Focus**: Highlights the image closest to the viewport center while fading and/or blurring images that scroll away. Options: Fade, Blur, Both, or Disabled. Only for stack layouts (Vertical, Grid, Fashion). Handles tall/portrait images that span the entire viewport
- **Image Counter**: Fixed position indicator showing current/total image count (slider layout)

### Sticky Panel
- **Two Sticky Modes**:
  - **Frame Mode**: Info panel scrolls inside a fixed-height container
  - **Natural Scroll Mode**: Info panel stays fixed at the top while images scroll
- **Configurable Offset**: Adjust top offset for sites with fixed headers
- **Toggle On/Off**: Enable or disable sticky behavior

### Mobile Experience
- **Swipeable Carousel**: Touch-friendly image carousel with overlay dot indicators
- **Sticky Carousel**: Image stays fixed at top while product info scrolls over it
- **Dynamic Slide Height**: Wrapper adapts to each slide's image height (no blank space)
- **Vertical Stack Option**: Alternative stack layout for mobile

### Video Support (Product Page)
- **MP4 Local Videos**: HTML5 `<video>` playback for locally hosted MP4 files assigned as product images
- **YouTube & Vimeo**: Embedded inline iframes with facade thumbnail + play button (lazy-loaded)
- **Player Size**: Choose between 16:9 video proportion or matching the product image dimensions
- **Object Fit**: Cover (crop to fill) or Contain (show full video with letterbox)
- **Autoplay / Loop / Muted / Controls**: All configurable separately
- **IntersectionObserver**: Videos autoplay when visible, pause when scrolled out of view
- **postMessage API**: Clean play/pause control for YouTube and Vimeo iframes

### Video Support (Category Listing)
- **Video on Listing Cards**: Replace product image with video on category and search results pages
- **MP4, YouTube & Vimeo**: All providers supported, auto-detected from Magento media gallery
- **Player Size**: Match image dimensions (uses Magento's container) or standalone 16:9 proportion
- **Video Fit**: Cover or Contain inside the listing card
- **Play/Stop Button**: Optional overlay control button on listing videos
- **Shimmer for All Images**: Animated shimmer loading placeholder for all listing images (not just videos)
- **Batch Loading**: Video data loaded per-collection (one query per page, not per product)

### Configurable Variant Image Switch (Light Mode, Opt-In)
- **Swatch → Gallery bridge**: on a configurable product PDP, selecting a swatch option (e.g. color) replaces the gallery images with the photos assigned to the matching child SKU. Implemented as a mixin over `Magento_Swatches/js/swatch-renderer` reading `jsonConfig.images[productId]`.
- **Opt-in**: disabled by default. Enable under `Stores → Configuration → Rollpix → Product Gallery → Configurable Products → Swatch Gallery Image Switch (Light Mode)`.
- **Shimmer-aware**: fires a `rollpix:gallery:dom_replaced` event so the shimmer effect re-detects the new items and does not get stuck.
- **XSS-safe**: new items are built with the DOM API, not string concatenation.
- **WebP-defensive**: preserves the `<picture class="mfwebp">` wrapper when present.
- **Coexists with `Rollpix_ConfigurableGallery`**: both modules can be installed together. The light-mode bridge is gated entirely by the admin flag, so if the full-feature companion module is installed, simply leave this flag off and its richer bridge handles swatch changes instead.
- **Known limitations**: Zoom / Slider / Thumbnail / Sticky widgets are NOT re-initialized on the new variant images. Videos are skipped on variants. Light mode is designed for stack layouts (Vertical / Grid / Fashion) with Zoom set to Lightbox / Modal Zoom / Disabled. For full support, install `Rollpix_ConfigurableGallery`.

### Performance
- **Lazy Loading**: Native lazy loading for images; IntersectionObserver for videos
- **Lightweight**: No heavy dependencies, GLightbox is only ~2KB gzipped
- **CSS Variables**: Dynamic styling without page reload
- **requestAnimationFrame**: Smooth scroll-based interactions

## Requirements

| Requirement | Version |
|-------------|---------|
| Magento | 2.4.7 - 2.4.8 |
| PHP | 8.1 - 8.4 |
| Theme | Luma or Luma-based themes |

## Installation

### Via Composer (Recommended)

```bash
composer require rollpix/module-product-gallery
bin/magento module:enable Rollpix_ProductGallery
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento setup:static-content:deploy -f
bin/magento cache:flush
```

### Manual Installation

1. Create the directory structure:
```bash
mkdir -p app/code/Rollpix/ProductGallery
```

2. Download and extract the module files to `app/code/Rollpix/ProductGallery/`

3. Enable the module:
```bash
bin/magento module:enable Rollpix_ProductGallery
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento setup:static-content:deploy -f
bin/magento cache:flush
```

## Configuration

Navigate to **Stores > Configuration > Rollpix > Product Gallery**

### Layout Settings

| Option | Description | Default |
|--------|-------------|---------|
| Layout Type | Vertical, Grid, Fashion, or Slider | Vertical |
| Gallery Position | Left or Right | Left |
| Column Ratio | 40/60, 50/50, or 60/40 (vertical mode) | 50/50 |
| Grid Ratio | 20/80 through 80/20 in 5% increments (grid/fashion/slider) | 70/30 |
| Image Columns in Grid | 2 or 3 columns (grid mode) | 2 |
| Gap Between Images | Spacing in pixels (0-40) | 20px |
| Slider Direction | Horizontal or Vertical (slider mode) | Horizontal |
| Slider Transition | Fade, Slide, or Zoom-fade (slider mode) | Fade |
| Navigation Arrows | Show prev/next buttons (slider mode) | Yes |
| Dot Indicators | Show dot navigation (slider mode) | Yes |
| Mousewheel Navigation | Scroll to switch slides (slider mode) | Yes |
| Thumbnail Navigation | Left, Right, Bottom, or Disabled (slider mode) | Disabled |
| Thumbnail Display Style | Outside or Overlay (slider mode) | Outside |
| Thumbnail Shape | Square (cropped) or Preserve aspect ratio (slider mode) | Square |

### Zoom Settings

| Option | Description | Default |
|--------|-------------|---------|
| Zoom Type | Hover Magnifier, Click Zoom, Lightbox, Modal Zoom, or Disabled | Hover |
| Zoom Level | Magnification level 2x-10x (hover and click modes) | 3x |
| Zoom Window Position | Right Side or Inside Image (hover mode) | Right |

### Effects & Animations

| Option | Description | Default |
|--------|-------------|---------|
| Shimmer Loading | Animated placeholder while images load | No |
| Fade-in on Scroll | Opacity + slide-up animation on viewport entry (requires shimmer off) | No |
| Scroll Focus Effect | Fade, Blur, Both, or Disabled. Highlights centered image (stack layouts only) | Disabled |
| Image Counter | Position indicator for slider layout | No |

### Product Tabs

| Option | Description | Default |
|--------|-------------|---------|
| Inline Accordion Tabs | Move tabs inside product info as collapsible accordion | No |
| Description Max Height | Max height before "Read more" link (0 to disable) | 0 |

### Sticky Panel Settings

| Option | Description | Default |
|--------|-------------|---------|
| Enable Sticky | Keep product info fixed while scrolling | Yes |
| Sticky Mode | Frame (scrollable panel) or Natural Scroll (fixed at top) | Natural Scroll |
| Top Offset | Distance from top in pixels | 20px |

### Video Settings (Product Page)

| Option | Description | Default |
|--------|-------------|---------|
| Enable Video | Enable video playback on product pages | Yes |
| Autoplay | Autoplay video when page loads | Yes |
| Loop | Loop video continuously | Yes |
| Muted | Mute video by default | Yes |
| Show Controls | Show native video controls | No |
| Player Size | Video proportion (16:9) or Match image dimensions | Video (16:9) |
| Object Fit | Cover (crop to fill) or Contain (show full video) | Cover |
| Lazy Load | Load video only when visible | Yes |

### Video Settings (Category Listing)

| Option | Description | Default |
|--------|-------------|---------|
| Enable Listing Video | Show videos on category/search listing pages | Yes |
| Listing Autoplay | Autoplay videos in listing cards | Yes |
| Show Play/Stop Button | Overlay play/stop control button | Yes |
| Player Size | Match image dimensions or Video proportion (16:9) | Match image |
| Video Fit | Cover (crop to fill) or Contain (show full video) | Cover |

### Mobile Settings

| Option | Description | Default |
|--------|-------------|---------|
| Mobile Behavior | Vertical Stack or Swipeable Carousel | Carousel |

## Screenshots

### Desktop - Vertical Layout (50/50)
```
+---------------------------------------------+
|  +-------------+    +---------------------+ |
|  |             |    | Product Title       | |
|  |   Image 1   |    | $99.00              | |
|  |             |    |                     | |
|  +-------------+    | [Add to Cart]       | |
|                     |                     | |
|  +-------------+    | Description...      | |
|  |             |    |                     | |
|  |   Image 2   |    |  (Sticky Panel)     | |
|  |             |    |                     | |
|  +-------------+    +---------------------+ |
|                                             |
|  +-------------+                            |
|  |   Image 3   |                            |
|  +-------------+                            |
+---------------------------------------------+
```

### Desktop - Grid Layout (70/30, 2 columns)
```
+----------------------------------+--------------+
|  +----------+  +----------+     |              |
|  |  Img 1   |  |  Img 2   |     |  Product     |
|  +----------+  +----------+     |  $99.00      |
|  +----------+  +----------+     |              |
|  |  Img 3   |  |  Img 4   |     |  [Add to     |
|  +----------+  +----------+     |   Cart]      |
|  +----------+                   |              |
|  |  Img 5   |                   |  (Sticky)    |
|  +----------+                   |              |
|         70%                     |     30%      |
+----------------------------------+--------------+
```

### Desktop - Fashion Layout
```
+----------------------------------+--------------+
|  +---------------------------+  |              |
|  |        Image 1 (full)     |  |  Product     |
|  +---------------------------+  |  $99.00      |
|  +------------+ +------------+  |              |
|  |   Img 2    | |   Img 3    |  |  [Add to     |
|  +------------+ +------------+  |   Cart]      |
|  +---------------------------+  |              |
|  |        Image 4 (full)     |  |  (Sticky)    |
|  +---------------------------+  |              |
+----------------------------------+--------------+
```

### Desktop - Slider Layout with Thumbnails
```
+----------------------------------+--------------+
|  +--+ +----------------------+  |              |
|  |T1| |                      |  |  Product     |
|  +--+ |    < Image 2 >       |  |  $99.00      |
|  |T2| |                      |  |              |
|  +--+ |                      |  |  [Add to     |
|  |T3| +----------------------+  |   Cart]      |
|  +--+      o  *  o  o  o       |              |
+----------------------------------+--------------+
```

### Modal Zoom (full-screen stack)
```
+---------------------------------------------+
|                                         [X] |
|                                             |
|         +-------------------------+         |
|         |       Image 1           |         |
|         +-------------------------+         |
|         +-------------------------+         |
|         |       Image 2           |         |
|         +-------------------------+         |
|         +-------------------------+         |
|         |       Image 3           |         |
|         +-------------------------+         |
|                                             |
|               v Scroll para ver mas         |
+---------------------------------------------+
```

### Mobile Carousel (Sticky)
```
+---------------+
|               |  <- Image stays fixed
|   Image 1     |    at top while
|               |    scrolling down
|   * o o o o   |  <- Overlay indicators
+---------------+
| Product Title |  <- Scrolls over
| $99.00        |    the image
| [Add to Cart] |
+---------------+
```

## File Structure

```
app/code/Rollpix/ProductGallery/
+-- registration.php
+-- composer.json
+-- README.md
+-- README_ES.md
+-- LICENSE
+-- etc/
|   +-- module.xml
|   +-- config.xml
|   +-- acl.xml
|   +-- di.xml
|   +-- frontend/
|   |   +-- di.xml
|   |   +-- events.xml
|   +-- adminhtml/
|       +-- system.xml
+-- Block/
|   +-- Adminhtml/System/Config/
|       +-- ModuleInfo.php
+-- Model/
|   +-- Config.php
|   +-- VideoUrlParser.php
|   +-- ProductVideoDataLoader.php
|   +-- Config/Source/
|       +-- LayoutType.php
|       +-- ColumnRatio.php
|       +-- GridRatio.php
|       +-- GridImageColumns.php
|       +-- GalleryPosition.php
|       +-- ImageGap.php
|       +-- ZoomType.php
|       +-- ZoomLevel.php
|       +-- ZoomPosition.php
|       +-- StickyMode.php
|       +-- MobileBehavior.php
|       +-- SliderDirection.php
|       +-- SliderTransition.php
|       +-- ThumbnailPosition.php
|       +-- ThumbnailStyle.php
|       +-- ThumbnailShape.php
|       +-- FocusStyle.php
|       +-- VideoObjectFit.php
|       +-- ListingPlayerSize.php
+-- Observer/
|   +-- AddVideoDataToCollection.php
+-- Plugin/Catalog/Block/Product/
|   +-- ImagePlugin.php
|   +-- ImageFactoryPlugin.php
+-- ViewModel/
|   +-- GalleryConfig.php
|   +-- ListingVideoConfig.php
+-- view/
    +-- frontend/
        +-- layout/
        |   +-- catalog_product_view.xml
        |   +-- catalog_category_view.xml
        |   +-- catalogsearch_result_index.xml
        |   +-- default.xml
        +-- templates/
        |   +-- product/view/
        |   |   +-- gallery-vertical.phtml
        |   +-- product/listing/
        |       +-- video-init.phtml
        |       +-- effects-init.phtml
        +-- requirejs-config.js
        +-- web/
            +-- css/
            |   +-- gallery-vertical.css
            |   +-- gallery-listing.css
            +-- js/
                +-- gallery-zoom.js
                +-- gallery-carousel.js
                +-- gallery-sticky.js
                +-- gallery-slider.js
                +-- gallery-tabs.js
                +-- gallery-effects.js
                +-- gallery-thumbnails.js
                +-- gallery-modal-zoom.js
                +-- gallery-video.js
                +-- gallery-listing-video.js
                +-- gallery-listing-effects.js
```

## Customization

### CSS Variables

The module uses CSS custom properties that can be overridden:

```css
.rp-product-wrapper {
    --rp-col-1: 1fr;           /* First column width */
    --rp-col-2: 1fr;           /* Second column width */
    --rp-gallery-order: 1;     /* Gallery order (1 or 2) */
    --rp-info-order: 2;        /* Info panel order (1 or 2) */
    --rp-sticky-offset: 20px;  /* Sticky top offset */
    --rp-image-gap: 20px;      /* Gap between images */
    --rp-grid-cols: 2;         /* Grid layout: image columns */
}
```

### Theme Compatibility

If your theme uses different selectors, you may need to adjust the CSS. The module targets:

- `.catalog-product-view` - Product page body class
- `.column.main` - Main content area
- `.product-info-main` - Product info container

### Extending the Module

To add custom functionality, you can:

1. **Override the template**: Copy `gallery-vertical.phtml` to your theme
2. **Add custom CSS**: Create a `_extend.less` file in your theme
3. **Modify JS behavior**: Create a mixin for the JS components

## Troubleshooting

### Zoom not working

1. Open browser DevTools (F12) and check Console for errors
2. Verify the module is outputting: "Rollpix Gallery Zoom initialized"
3. Clear all caches:
```bash
rm -rf pub/static/frontend/*
rm -rf var/view_preprocessed/*
bin/magento setup:static-content:deploy -f
bin/magento cache:flush
```

### Layout issues with custom theme

1. Verify your theme extends Luma
2. Check if your theme overrides `catalog_product_view.xml`
3. Ensure `.product-info-main` container exists

### Sticky not working

1. Verify the parent container has sufficient height
2. Check if another CSS rule overrides `position: sticky`
3. Ensure no `overflow: hidden` on parent elements

### Images not loading

1. Check if product has images assigned
2. Verify image URLs are accessible
3. Check browser console for 404 errors

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS 12+)
- Chrome for Android

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow [Magento 2 Coding Standards](https://developer.adobe.com/commerce/php/coding-standards/)
- Use PSR-12 for PHP code
- Document all public methods

## Roadmap

- [ ] Admin configuration for enable/disable per category
- [ ] Integration with PageBuilder

## Changelog

### 1.8.1 (2026-04-14)
- **Fix: remove `Rollpix_ConfigurableGallery` `class_exists` soft-dep** from `ViewModel::isSwatchGallerySwitchEnabled()`. The auto-deactivation was incorrect — the two modules are designed to coexist, and the admin flag is now the only gate. Merchants who install both modules should leave this flag off so only one bridge runs, but the choice is explicit.

### 1.8.0 (2026-04-14)
- **Swatch → Gallery image switch (light mode)** for configurable products: new opt-in admin flag `Configurable Products → Swatch Gallery Image Switch (Light Mode)` that hooks into `Magento_Swatches/js/swatch-renderer` via mixin and rebuilds `.rp-gallery-images` with the selected child SKU's photos from `jsonConfig.images`. Fires a `rollpix:gallery:dom_replaced` jQuery event so `gallery-effects.js::initShimmer` can re-run on the new items. DOM is built with the native API (not string concat) to avoid XSS on untrusted image URLs; `loading="lazy"` applied; `<picture class="mfwebp">` wrapper preserved for MageFan WebP sites. **Known limitations**: Zoom / Slider / Thumbnail / Sticky widgets are not re-initialized on the new DOM; videos are skipped on variants; variant images may serve non-WebP under MageFan/Yireo WebP plugins. For full support, install `Rollpix_ConfigurableGallery`.
- New files: `view/frontend/web/js/swatch-gallery-bridge.js`
- Modified files: `view/frontend/web/js/gallery-effects.js`, `view/frontend/requirejs-config.js`, `view/frontend/templates/product/view/gallery-vertical.phtml`, `etc/adminhtml/system.xml`, `etc/config.xml`, `Model/Config.php`, `ViewModel/GalleryConfig.php`

### 1.7.8 (2026-03-06)
- **Shimmer loading effect stuck on images wrapped by WebP plugins**: rewrote `initShimmer()` to use polling-based detection (`img.complete && naturalWidth > 0`) instead of jQuery `load` event listeners, so DOM mutations by MageFan `mfwebp` / Yireo WebP2 no longer leave orphaned listeners and stuck shimmer placeholders. Cached images resolve synchronously; polling auto-stops when all items load or after 4s. See `RELEASE_NOTES.md` for the full diagnosis.

### 1.7.2 (2026-03-02)
- **Video support on product pages (PDP)**: Inline HTML5 `<video>` for local MP4 files; embedded YouTube and Vimeo with thumbnail facade, lazy-loaded iframe, and IntersectionObserver play/pause via postMessage
- **Video support on category listings**: Replace product image with MP4, YouTube, or Vimeo video on category and search results pages. Provider auto-detected from Magento media gallery
- **Player Size config (PDP)**: Choose between 16:9 video proportion or matching product image dimensions (reads actual pixel size from disk)
- **Player Size config (Listing)**: Match Magento image container dimensions (preserves layout) or standalone 16:9 proportion
- **Video Fit config**: Cover (crop to fill) or Contain (letterbox) for both PDP and listing
- **Play/Stop button**: Optional overlay play/pause control for listing videos
- **Shimmer for all listing images**: Animated shimmer loading placeholder for all product images on listing/search pages (not just videos)
- **Batch video loading**: Observer pre-loads video data for the entire product collection in one DB query per page
- New files: `Model/VideoUrlParser.php`, `Model/ProductVideoDataLoader.php`, `Observer/AddVideoDataToCollection.php`, `Plugin/.../ImagePlugin.php`, `Plugin/.../ImageFactoryPlugin.php`, `ViewModel/ListingVideoConfig.php`, `gallery-video.js`, `gallery-listing-video.js`, `gallery-listing-effects.js`, `gallery-listing.css`

### 1.5.0 (2026-02-15)
- **Modal Zoom**: New zoom type that opens a full-screen overlay with all product images stacked vertically; clicking image N scrolls the modal to that image. Scroll indicator with bounce animation, auto-hides after 3 seconds or on first scroll. Close via X button, overlay click, or Escape key
- **Scroll Focus effect**: New effect for stack layouts (Vertical, Grid, Fashion) that highlights the image closest to the viewport center while fading and/or blurring images scrolling away. Options: Fade, Blur, Both, or Disabled. Includes dead zone for the centered image and smart handling of tall/portrait images that span the entire viewport
- **Sliding thumbnail highlight**: Animated border indicator that slides between thumbnails on change (Fotorama-style transition)
- **Thumbnail shape option**: New admin setting to preserve image aspect ratio in thumbnails instead of forcing square crop
- **Conditional slider arrows/dots**: Arrows and dots are no longer rendered in HTML when disabled in admin (fixes CSS !important override issue)
- Fix shimmer + fade-in conflict: mutually exclusive in both template and JS (shimmer takes priority)
- Fix shimmer not resolving: robust image load detection with JS timeout fallback (4s) and CSS animation fallback (5s)
- Increase shimmer animation contrast for better visibility
- Fix overlay thumbnail strips overlapping slider navigation arrows
- Fashion layout: last orphan image no longer forced to full width

### 1.4.0 (2026-02-14)
- **Slider layout**: New single-image-at-a-time layout with configurable transitions (fade, slide, zoom-fade), direction (horizontal, vertical), navigation arrows, dot indicators, keyboard, and mousewheel support
- **Thumbnail navigation** (slider layout): Thumbnail strip in left, right, or bottom position with active state highlighting
- **Thumbnail overlay mode**: Thumbnails and dots float inside the image with blur background instead of taking up space alongside it
- **Shimmer loading effect**: Animated placeholder while images load, smooth fade-in on completion
- **Fade-in on scroll**: Subtle opacity + slide-up animation when images enter the viewport
- **Image counter**: Fixed position indicator showing current/total count (slider layout)
- Comprehensive Luma button resets on slider arrows, dots, and thumbnail buttons
- Replaced masonry layout with slider layout
- Conditional shimmer/fade-in: fade-in disabled when shimmer is active
- Accordion "Read more" button hover/focus style resets

### 1.3.1 (2026-02-13)
- Expanded grid/fashion ratio options: 20/80 through 80/20 (13 options in 5% increments)
- Dynamic ratio parsing in ViewModel (supports any ratio value)
- Module info panel in admin config: ROLLPIX branding, GitHub repo link, dynamic version from composer.json
- Fix ModuleInfo block: use `Template\Context` instead of `Block\Context`
- Fix registration.php: use `ComponentRegistrar::MODULE` constant
- Fix accordion button styles: comprehensive Luma/Hyva reset for all states
- Hide accordion on mobile, restore original Magento tabs
- Fix mobile layout collapse: remove extra hover/focus effects
- Fix mobile carousel spacing: reduce gap between image and product info

### 1.3.0 (2026-02-13)
- Inline accordion tabs: move product detail tabs (Description, Additional Info, Reviews) inside the product info column as collapsible accordion sections (configurable)
- Description truncation with gradient fade and "Read more" link (configurable max height)
- Fashion layout: new alternating 1-2 image pattern (1 full-width, 2 half-width, repeat) with orphan image handling

### 1.2.4 (2026-02-07)
- Fix Hyva: force inner product-info `<section>` to single column layout (Hyva wraps product info in a Tailwind grid section)

### 1.2.3 (2026-02-07)
- Force 1column page layout on product page for Hyva compatibility
- Force grid display and full-width on all direct children of wrapper
- Hyva/Tailwind width overrides with !important on wrapper children

### 1.2.2 (2026-02-07)
- Fix Hyva theme compatibility: product info column now fills full grid width
- Reset Tailwind/Hyva width restrictions on product-info-main and gallery columns

### 1.2.1 (2026-02-06)
- Add PHP 8.4 support

### 1.2.0 (2026-02-06)
- Mobile carousel: sticky image at top while scrolling (info scrolls over)
- Mobile carousel: overlay dot indicators on image
- Mobile carousel: dynamic wrapper height per slide (eliminates blank space)
- Mobile: overflow fixes for all Magento wrapper ancestors to support sticky
- Mobile: `-webkit-sticky` prefix for iOS Safari support

### 1.1.0 (2026-02-05)
- Grid layout: multi-column image grid with info sidebar
- Grid configurable ratios: 70/30, 75/25, 80/20
- Grid configurable image columns: 2 or 3
- Click zoom mode: click to zoom in-place, click again to reset
- Sticky panel modes: Frame (scrollable) and Natural Scroll (fixed at top)
- Zoom level extended to 10x
- Zoom result uses fixed viewport positioning (follows cursor)
- Admin config groups reordered: Layout, Zoom, Sticky, Mobile

### 1.0.0 (2026-01-26)
- Initial release
- Vertical gallery layout
- Hover zoom functionality
- Lightbox support (GLightbox)
- Mobile carousel
- Sticky product info panel
- Full admin configuration

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- [GLightbox](https://biati-digital.github.io/glightbox/) - Lightweight lightbox library
- Inspired by editorial product pages from leading fashion e-commerce sites

## Support

- **Issues**: [GitHub Issues](https://github.com/rollpix/magento2-product-gallery/issues)
- **Documentation**: [Wiki](https://github.com/rollpix/magento2-product-gallery/wiki)

---

Made with ❤️ by [Rollpix](https://rollpix.com)
