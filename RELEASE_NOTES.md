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
