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
