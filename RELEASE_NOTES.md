## What's New in 1.8.0

### New — Swatch → Gallery Image Switch (Light Mode) for Configurable Products

On a configurable product PDP, selecting a different swatch option (e.g. color) now replaces the Rollpix gallery images with the photos assigned to the selected child SKU. The standard `Magento_Swatches/js/swatch-renderer` targets Fotorama, which this module removes — the new `swatch-gallery-bridge.js` mixin closes that gap using `jsonConfig.images[productId]` emitted by Magento's block.

**How to enable**: `Stores → Configuration → Rollpix → Product Gallery → Configurable Products → Swatch Gallery Image Switch (Light Mode) = Yes`. Default is `No` — this feature is strictly opt-in because of the limitations below.

#### What it does
- Mixes into `Magento_Swatches/js/swatch-renderer` (`_OnClick` / `_OnChange`) and rebuilds `.rp-gallery-images` when a full attribute combination is selected.
- Constructs new `<a><img>` items via the DOM API (not string concatenation) so malicious image URLs from a compromised admin cannot inject HTML.
- Every `<img>` ships with `loading="lazy"` and — when the original gallery was wrapped by MageFan's `<picture class="mfwebp">` — clones the same `<picture>` shell around each variant image so surrounding CSS selectors keep matching.
- Fires a `rollpix:gallery:dom_replaced` jQuery event on the gallery wrapper after each DOM swap. `gallery-effects.js::initShimmer` listens for this event and re-runs shimmer detection on the new items, so the shimmer placeholder does not get stuck over loaded variant images.
- Restores the parent gallery when the swatch selection is cleared or becomes partial.
- **Soft-dep**: when `Rollpix_ConfigurableGallery` (the larger, full-feature sibling module) is installed, the bridge detects it via `class_exists()` and automatically deactivates itself so both modules don't race on the same DOM.

#### Known limitations (intentional — this is "light mode")
- **Zoom widgets are not re-initialized.** The hover/click zoom widget binds listeners to the original `<img>` nodes at page init; after a swatch change those listeners point at removed DOM. Recommended setup for configurable PDPs: `Zoom Type = Lightbox` / `Modal Zoom` / `Disabled`, or install `Rollpix_ConfigurableGallery` which handles full widget teardown.
- **Slider / carousel / thumbnail / sticky widgets are not re-initialized** either. Light mode is designed for the stack layouts (`Vertical`, `Grid`, `Fashion`). Using it with `Slider` layout will still swap the images but the slider state won't track the new item set.
- **Videos are skipped on variants.** Only still images are carried across swatch changes.
- **WebP regeneration is best-effort.** Under MageFan `mfwebp` or Yireo WebP2, variant images may be served as the non-WebP originals — the `<picture>` shell is cloned but no `<source srcset>` is regenerated because the variant WebP URL is not available at JS runtime. Lighthouse may flag a small performance regression on variants for WebP-enabled sites.

For full support with destroy-aware widgets, WebP regeneration, and video variants, install the companion module `Rollpix_ConfigurableGallery` (out of scope for this repo).

#### Files
- `view/frontend/web/js/swatch-gallery-bridge.js` — new mixin
- `view/frontend/web/js/gallery-effects.js` — `initShimmer()` now re-runs on the `rollpix:gallery:dom_replaced` event
- `view/frontend/requirejs-config.js` — mixin registration (global, gated on `window.rpSwatchGallerySwitchEnabled`)
- `view/frontend/templates/product/view/gallery-vertical.phtml` — emits the opt-in flag inline for configurable PDPs when the admin setting is on
- `etc/adminhtml/system.xml` — new group `configurable` with the `swatch_gallery_switch_enabled` field and an explicit limitations comment
- `etc/config.xml` — default `0`
- `Model/Config.php` — `isSwatchGallerySwitchEnabled()`
- `ViewModel/GalleryConfig.php` — `isSwatchGallerySwitchEnabled()` (with `Rollpix_ConfigurableGallery` soft-dep check)

---

## What's New in 1.7.8

### Fixed — Shimmer loading effect stuck on images wrapped by WebP plugins

The shimmer placeholder animation was persisting indefinitely over loaded product gallery images on sites using a WebP optimization plugin (MageFan `mfwebp`, Yireo WebP2, or similar) that wraps `<img>` elements in `<picture><source type="image/webp"><img></picture>` after DOM ready. The original `initShimmer()` relied on jQuery `$img.on('load', ...)` event listeners attached at page init — when the WebP plugin mutated the DOM **after** the listeners were attached, the listeners stayed bound to the orphaned original `<img>` element while the browser rendered the new one. Result: the `rp-loaded` class was never applied, shimmer animation ran forever (until the 4s safety timeout kicked in, by which point the image was clearly already loaded).

Additional contributing factors:
- `loading="lazy"` on the `<img>` deferred the actual fetch, making the event-listener race more likely.
- `<source srcset>` WebP variant caused the browser to use the source element for the actual load, while the `<img>` baseline event lifecycle could be skipped in some browser/plugin combinations.
- `img.complete` can return `true` with `naturalWidth === 0` during picture/srcset resolution edge cases.

**Fix**: rewrote `initShimmer()` to use **polling-based detection** instead of event listeners. Every 100ms (up to a 4-second cap), the script re-queries each `.rp-gallery-item` for its current `<img>`/`<video>` child, checks `img.complete && img.naturalWidth > 0` (more robust than `complete` alone), and applies `rp-loaded` when the condition is met. Because the child element is **re-queried** on every tick, DOM mutations by third-party plugins don't break detection — the poll always sees the current `<img>` in place. Cached images are detected synchronously on the initial pass (no perceived lag). Poll auto-stops as soon as all items are loaded.

No behavior change for sites without WebP plugins — the polling approach works identically fast for native `<img>` elements (immediate sync detection + event-free resolution thereafter).

---

## What's New in 1.7.2

### Video Support on Product Pages (PDP)
- Inline HTML5 `<video>` playback for local MP4 files assigned as product gallery images
- YouTube and Vimeo embedded inline with thumbnail facade, lazy-loaded iframe, and IntersectionObserver-based autoplay/pause via postMessage API
- **Player Size**: Choose between 16:9 video proportion or matching the actual product image dimensions (reads pixel dimensions from disk)
- **Object Fit**: Cover (crop to fill) or Contain (show full video with letterbox) for local MP4

### Video Support on Category Listings
- Replace product image with video (MP4, YouTube, Vimeo) on category and search result pages
- Provider auto-detected from Magento media gallery — works with YouTube/Vimeo even when the `provider` field in the DB is empty
- **Player Size**: Match Magento's image container dimensions (preserves grid layout) or standalone 16:9 proportion
- **Video Fit**: Cover or Contain inside the listing card
- Optional play/stop overlay button on listing videos
- Batch video loading via Observer: one DB query per page, not per product

### Shimmer for All Listing Images
- Animated shimmer loading placeholder for all product images on listing and search pages, not just videos
- Resolves via `load` event on images, `loadeddata` on videos, and a 4s timeout fallback

### New Files
- `Model/VideoUrlParser.php` — Parse YouTube/Vimeo URLs to embed URLs
- `Model/ProductVideoDataLoader.php` — Batch-load video data for product collections
- `Observer/AddVideoDataToCollection.php` — Pre-load video data via collection event
- `Plugin/Catalog/Block/Product/ImagePlugin.php` — Inject video HTML on listing pages
- `Plugin/Catalog/Block/Product/ImageFactoryPlugin.php` — Pass product reference to Image block
- `ViewModel/ListingVideoConfig.php` — Video config for listing templates
- `gallery-video.js` — PDP video IntersectionObserver + postMessage
- `gallery-listing-video.js` — Listing video IntersectionObserver + postMessage
- `gallery-listing-effects.js` — Shimmer resolve for listing images
- `gallery-listing.css` — Listing video and shimmer styles

**Full Changelog**: https://github.com/ROLLPIX/M2-ProductGalleryStyle/compare/v1.5.2...1.7.2
