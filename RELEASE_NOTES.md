## What's New in 1.9.0

### Fixed — Slider / thumbnails / mobile carousel / zoom broke after a variant change (and across mobile↔desktop resizes)

On a configurable PDP with the swatch → gallery bridge enabled (`rollpix_gallery/configurable/swatch_gallery_switch_enabled = Yes`) and a non-stack layout (Slider, or any layout on mobile where the Carousel takes over), selecting a swatch option left the gallery broken ([IS-6448](https://rollpix.atlassian.net/browse/IS-6448), Bordoli):

- **Desktop slider** — the variant's images rendered as a full vertical stack instead of one-at-a-time; the prev/next arrows no longer moved the gallery; the dots were stale.
- **Thumbnails** — the strip kept showing the **parent** product's thumbnails; they never followed the selected variant.
- **Mobile carousel** — only the first image showed; the 2nd photo was no longer swipeable.
- **Click / hover zoom** — after a variant change, clicking the image navigated the browser straight to the raw image file instead of zooming (same class of bug 1.8.8 fixed for modal/carousel/lightbox zoom; `gallery-zoom.js` was left out of scope then).
- **Mobile ↔ desktop resize** — the slider never (re)activated when the viewport crossed the 767px breakpoint (it only set up once at load, and bailed on mobile), so resizing back to desktop — or loading on mobile then widening — left the images as a vertical stack on desktop. This affected slider-layout sites **even without** the swatch bridge.

**Root cause**: `swatch-gallery-bridge.js` replaced `.rp-gallery-images` (via `$container.empty()` + append of fresh nodes) and fired `rollpix:gallery:dom_replaced`, but only `gallery-effects.js` (shimmer) and `gallery-carousel-zoom.js` listened for it. `gallery-slider.js`, `gallery-thumbnails.js`, `gallery-carousel.js` and `gallery-zoom.js` cached their `.rp-gallery-item` / `.rp-thumbnail-item` sets and bound their handlers **once at init**, so after the swap the new items carried no slider display state, the arrows/dots/thumbnail/zoom handlers stayed bound to the detached original nodes, the mobile `.rp-carousel-track` was wiped, and the bridge never rebuilt the thumbnail strip at all. Separately, the slider had no viewport-crossing logic (the mobile carousel did).

**Fix** (extends the v1.8.8 `collectAndBind()` re-init pattern to the remaining widgets):

1. **`gallery-slider.js`** — init wrapped in idempotent `setup()`/`teardown()`; re-runs on `rollpix:gallery:dom_replaced`. **Also** made viewport-aware (mirrors `gallery-carousel.js`): a debounced window-resize handler activates the slider when the viewport is desktop and deactivates it (clearing per-item inline styles for the carousel) when it crosses to mobile — both directions, regardless of the initial viewport. Teardown offs all `.rpslider`-namespaced handlers and empties the dots; setup re-queries items/thumbnails, resets `currentIndex`, rebuilds dots and re-applies the one-visible state.
2. **`gallery-thumbnails.js`** — same `setup()`/`teardown()` split; re-runs on the event. The `IntersectionObserver` is disconnected and the sliding `.rp-thumbnail-highlight` re-created on each swap (no duplicate highlights). Handlers namespaced `.rpthumbs`.
3. **`gallery-carousel.js`** (mobile) — listens for the event, resets its flags/classes (the bridge wiped its track) and re-runs the viewport check to rebuild a fresh track + indicators from the variant's images.
4. **`gallery-zoom.js`** — `setup()`/`teardown()` + re-init on the event for both hover (magnifier) and click (in-place) zoom; added an immediate `preventDefault` guard on each item so a click during the large-image load window can never fall through to the anchor `href` (the raw file).
5. **`swatch-gallery-bridge.js`** — now rebuilds the **thumbnail strip** (`.rp-thumbnail-item`) from the same `jsonConfig.images[pid]` set as the main images (using `img.thumb`), in DOM-node form (XSS-safe), preserving the JS-managed highlight node; snapshots the original thumbnails and restores them (alongside the images) when the selection is cleared.

Net effect: Slider, Thumbnails, the mobile Carousel and all Zoom types now keep working across variant switches, on deselect, and across mobile↔desktop resizes — no longer limited to stack layouts. The scroll-aware Sticky panel is still not explicitly re-initialized (it self-recalculates on scroll/resize via its own MutationObserver). **JS-only change** — no PHP / template / layout / CSS / admin changes; behavior with the bridge disabled (the default) is unchanged.

#### Files
- `view/frontend/web/js/gallery-slider.js` — `setup()`/`teardown()`, re-init on event + mobile↔desktop viewport crossing
- `view/frontend/web/js/gallery-thumbnails.js` — `setup()`/`teardown()`, observer/highlight re-init
- `view/frontend/web/js/gallery-carousel.js` — rebuild mobile carousel on the event
- `view/frontend/web/js/gallery-zoom.js` — re-init hover/click zoom + immediate click guard
- `view/frontend/web/js/swatch-gallery-bridge.js` — rebuild + snapshot/restore the thumbnail strip; updated header docs

---

## What's New in 1.8.8

### Fixed — Carousel/lightbox zoom opened the raw image file after a variant change

On a configurable PDP with the swatch → gallery bridge enabled (`rollpix_gallery/configurable/swatch_gallery_switch_enabled = Yes`), clicking a gallery image opened the zoom popup correctly — until a variant was selected. After picking a swatch option (e.g. a size), clicking an image navigated the browser straight to the raw image file (`/media/catalog/product/cache/…/*.jpg`) instead of opening the popup, with no way to close other than the browser Back button.

**Root cause**: `gallery-carousel-zoom.js` collected its `.rp-gallery-item` set and bound its `click.rpcarouselzoom` (`preventDefault` + open modal) handlers **once at `domReady`, directly on the original anchor nodes**. When a swatch is selected, `swatch-gallery-bridge.js` replaces the gallery anchors with fresh nodes built from `jsonConfig.images[pid]` and fires `rollpix:gallery:dom_replaced`. The carousel-zoom component never listened for that event, so the replacement anchors carried no click handler and a click fell through to the native `href` — opening the raw image. (The bridge's own header already documented this as a known light-mode limitation: "Zoom widgets are not re-initialized… may behave unexpectedly after a swatch change.")

**Fix**: `gallery-carousel-zoom.js` now encapsulates "collect media + bind triggers" in a `collectAndBind()` function called both at init **and** on `rollpix:gallery:dom_replaced`. On re-init it re-queries `.rp-gallery-item`, rebuilds the `media[]` list from the live DOM (so the popup shows the selected variant's images), and rebinds the namespaced click handler (`.off('click.rpcarouselzoom')` first; uses the live `$items.index(this)` so navigation order matches the current variant). Any cached overlay is torn down (`$overlay.remove(); $overlay = null`) so `buildModal()` re-renders the prev/next controls for the variant's image count, and `closeModal()` now guards against a null overlay. The listener is bound on the `[data-role="rp-gallery"]` element — the same node the bridge triggers the event on.

Applies to both `carousel` and `lightbox` zoom types (which share this component). Hover zoom (`gallery-zoom.js`) has the same structural pattern but is out of scope for this release.

#### Files
- `view/frontend/web/js/gallery-carousel-zoom.js` — extracted `collectAndBind()`; re-runs on `rollpix:gallery:dom_replaced`; rebuilds `media[]`, rebinds namespaced click triggers, tears down cached overlay; null-safe `closeModal()`

---

## What's New in 1.8.7

### Fixed — Amasty_Label labels did not render / positioned wrong on the PDP gallery

On stores running both this module and `Amasty_Label`, product labels rendered fine in the category grid but misbehaved on the product page: (1) they did not render at all on the PDP, (2) when forced to render they appeared at the end of the gallery block instead of overlaid on the image, and (3) the label bled on top of dropdown menus, modals and other theme overlays. Detected and reproduced on Tienda Imco ([IS-6206](https://rollpix.atlassian.net/browse/IS-6206)); all three causes live in this module / its Amasty integration, not in the site.

**Fix** (three coordinated changes):

1. **`etc/frontend/di.xml`** — register the vertical gallery block name in Amasty's plugin allowlist. `Amasty\Label\Plugin\Catalog\Product\View\Label::afterToHtml` only emits the label HTML when `getNameInLayout()` is in an internal list (`product.info.media.image`, …). This module swaps the gallery for a block named `rollpix.product.gallery.vertical`, so the plugin silently skipped it. The name is injected via `<argument name="allowedNames">` (Amasty `array_merge`s it with its hardcoded list — the supported extension path, no `vendor/` patch).
2. **`view/frontend/templates/product/view/gallery-vertical.phtml`** — add `id="amasty-main-container"` to `.rp-gallery-images`. `initLabel.js` relocates the label node into the first descendant matching `.fotorama__stage, #amasty-main-container`; the vertical gallery exposed neither, so the label stayed where the plugin injected it (end of block). The id gives Amasty a valid anchor to overlay the label on the image with no per-label config.
3. **`view/frontend/templates/product/view/gallery-vertical.phtml`** — add `style="isolation: isolate;"` on the outer `.rp-product-gallery` wrapper. Amasty hardcodes `z-index: 995` on `.amlabel-position-wrapper`; most themes use far lower z-indexes for menu/header/modals, so the label punched through them. The isolation creates a stacking context that traps Amasty's 995 inside the gallery, letting any site element with `z-index > 0` paint above it. (It lives on the outer wrapper, not on `#amasty-main-container`, because `initLabel.js` overwrites that element's inline `style` via `this.parent.css('position', 'relative')`.)

#### Files
- `etc/frontend/di.xml` — `allowedNames` entry registering `rollpix.product.gallery.vertical` on `Amasty\Label\Plugin\Catalog\Product\View\Label`
- `view/frontend/templates/product/view/gallery-vertical.phtml` — `id="amasty-main-container"` anchor + `isolation: isolate` on the wrapper

---

## What's New in 1.8.6

### Changed — Swatch gallery now swaps on the first attribute alone (legacy fallback)

In v1.8.4 the matcher was reworked to respect Magento's per-attribute `Update Product Preview Image` flag. For catalogs that explicitly opt color into preview updates and leave size off, picking a color alone already swapped the gallery — the intended behavior. But for legacy catalogs that never touched the admin flag, the matcher fell back to "every attribute counts" (v1.8.0 behavior), which on a color + talle configurable meant the gallery only swapped after *both* attributes were selected. Merchants reported that picking color should be enough to preview the variant without forcing them into per-attribute admin configuration.

**Change**: `swatch-gallery-bridge.js` legacy fallback now treats only the **first attribute by DOM/position order** as preview-relevant. On a typical color + size configurable, picking color alone resolves to the first matching child SKU and swaps the gallery; sibling attributes (size, length…) are ignored by the matcher. Multiple children share a color so the first match is safe — they share the same image set.

Behavior matrix:

| Admin config | Before (≤ 1.8.5) | After (1.8.6) |
|---|---|---|
| No attribute has the flag (legacy) | All attributes must be selected | Only first attribute (typically color) drives the swap |
| Color has the flag, size doesn't | Color alone swaps; size ignored | Unchanged — color alone swaps |
| All attributes have the flag | All must be selected | Unchanged — all must be selected |

Merchants who want to force the old "all must match" behavior can opt back in by setting `Update Product Preview Image = Yes` on every variable attribute (so the legacy fallback no longer applies and the strict path is used).

#### Files
- `view/frontend/web/js/swatch-gallery-bridge.js` — legacy fallback in `_rpMatchedProducts()` now restricts to the first iterated attribute (added `legacyFirstAttrId` tracking)

---

## What's New in 1.8.5

### Fixed — Mobile carousel got stuck on the second photo on real iOS devices

Reproducible on iPhone Safari (not in Chrome devtools "mobile mode" emulation): after the first successful left-swipe to photo 2, subsequent swipes on the sticky gallery silently failed — the user could not advance further nor return to photo 1.

Three independent problems were compounding:

1. **`touchcancel` was unhandled.** On real iOS the OS cancels in-flight touches whenever a system gesture takes over (address-bar show/hide on scroll, edge-swipe-back, notification). That cancellation fired `touchcancel` instead of `touchend`, so `isDragging` stayed `true` and the track's transition stayed `none` forever. The next swipe's `touchend` still ran, but every swipe after that one inherited broken state from whatever half-finished gesture triggered the cancel.

2. **`currentX` wasn't reset on `touchstart`.** A tap with no movement (common when a user puts their finger down to start a new swipe after the first) computed `diffX = currentX - startX` using the *previous* swipe's endpoint, occasionally firing a spurious `nextSlide()` / `prevSlide()` that the user never asked for.

3. **No compositor-layer hint on `.rp-carousel-track`.** With `position: sticky` on the gallery parent, iOS Safari stops routing horizontal `touchmove` events to a non-composited descendant once the sticky threshold is crossed — a known WebKit quirk. The track needs its own layer for touch events to keep landing on it.

**Fix** (combined):
- `gallery-carousel.js`: added `touchcancel` handler that resets `isDragging` and the track's transition without firing navigation; seed `currentX = startX` inside `onTouchStart`; switched transforms from `translateX(…)` to `translate3d(…, 0, 0)` so the composited layer is actually used.
- `gallery-vertical.css`: added `will-change: transform; backface-visibility: hidden` to `.rp-carousel-track` to promote it to its own layer on iOS.
- Also removed the `mousedown` / `mousemove` / `mouseup` handlers that were registered "for desktop testing" — they served no production purpose and could fire via iOS's synthetic mouse-event emulation, re-entering swipe state mid-touch.

Secondary bug caught during the investigation and fixed alongside:

**Zoom-hover wrappers were orphaned inside the carousel wrapper.** `gallery-zoom.js` declares `domReady!` and wraps each `.rp-gallery-item` in a `.rp-zoom-wrapper` during init. `gallery-carousel.js` has no such dependency, so when both widgets ran on a configurable / hover-zoom PDP the items were first wrapped, then moved out of those wrappers into `.rp-carousel-track` by the carousel — leaving two empty `.rp-zoom-wrapper` divs as siblings of the track inside the flex-column `.rp-carousel-wrapper`. With a `gap: 10px` between flex children, those empty siblings pushed the track ~20 px down inside its overflow-hidden wrapper, clipping the bottom of every slide. `initCarousel()` now unwraps items from any `rp-zoom-wrapper` ancestor and deletes the leftover empty wrappers before moving items into the track.

#### Files
- `view/frontend/web/js/gallery-carousel.js` — added `touchcancel` handler, seeded `currentX` on `touchstart`, switched to `translate3d`, removed unused mouse handlers, cleaned up orphan `rp-zoom-wrapper` siblings in `initCarousel()`.
- `view/frontend/web/css/gallery-vertical.css` — added `will-change` + `backface-visibility` to `.rp-carousel-track`.

---

## What's New in 1.8.4

### Fixed — Swatch gallery swapped the image on every attribute change, even when the admin flag said "No"

In v1.8.0–1.8.3 the light-mode swatch bridge reloaded the gallery images on *any* swatch interaction and required a fully-selected combination before matching. On a configurable with two or more variable attributes (e.g. `color` + `talle`) that meant switching sizes also reloaded the photo — even when the admin had left `Update Product Preview Image` (the native Magento per-attribute flag, labelled in Spanish as "Actualiza la imagen de vista previa de producto") off for the size attribute.

**Fix**: `swatch-gallery-bridge.js` now reads `update_product_preview_image` from each attribute's `additional_data` (where stock Magento's `Swatches\Helper\Data::assembleAdditionalDataEavAttribute` packs it) and only uses those attributes when resolving which child product's images to load. Sibling attributes flagged `No` — typical for size — are ignored by the matcher, so changing them keeps the currently-displayed image. A short-circuit on the last-synced child id also skips the DOM swap (and its shimmer flicker) when the resolved child is unchanged.

The fix is transparent for legacy catalogs: if no attribute opts into preview updates (flag untouched everywhere), every attribute continues to count — matching the v1.8.0 behavior. The fix only activates when at least one attribute on the configurable explicitly has the native flag set to `Yes`.

#### Files
- `view/frontend/web/js/swatch-gallery-bridge.js` — added `_rpAttrUpdatesPreview()`, reworked `_rpMatchedProducts()`, added last-synced-child cache in `_rpSyncGallery()`

---

## What's New in 1.8.2

### Fixed — Mobile carousel was clipping the bottom ~90px of every image

In v1.7.x a `margin-top: -90px` was added to `.product-info-main` in the mobile `@media (max-width: 767px)` block to close an excessive whitespace gap between the carousel image and the product title. The side effect: the product-info panel (with `z-index: 2` and white `background`) permanently overlapped the bottom 90px of whatever image was currently showing in the carousel — not as an on-scroll overlay, but as a static crop. On tall/landscape product photos this was obvious; you could see the bike frame / shoe / bottle visibly cut off below the middle even before the user touched the page.

**Fix**: the negative margin is removed (`margin-top: 0`). The sticky-scroll behavior of the gallery column still works — as the user scrolls, the info panel rises over the gallery naturally — but images are no longer pre-cropped at rest.

If after this update a small whitespace gap reappears between the carousel and the title on your theme, it means the theme is adding a `margin` on `.product-info-main` or a `padding` on the gallery wrapper that was previously being absorbed by the `-90px`. In that case, override from the theme (e.g. `@media (max-width: 767px) { .rp-product-wrapper .product-info-main { margin-top: -20px; } }`) rather than re-clipping the image globally.

---

## What's New in 1.8.1

### Fixed — `Rollpix_ConfigurableGallery` soft-dep was disabling the feature incorrectly

`ViewModel::isSwatchGallerySwitchEnabled()` was checking `class_exists('Rollpix\\ConfigurableGallery\\...')` and auto-returning `false` when the companion module was installed. That behavior was wrong: the two modules are designed to **coexist** (they can both be installed in the same Magento instance) and merchants need explicit control over which bridge handles swatch changes. Some Composer autoload configurations can also return `true` for `class_exists()` as a false positive even when the module isn't really active, which silently suppresses the light-mode bridge.

**Fix**: the soft-dep check is removed. The admin flag `rollpix_gallery/configurable/swatch_gallery_switch_enabled` is now the *only* gate. If you install both `Rollpix_ProductGallery` and `Rollpix_ConfigurableGallery`, simply leave this flag **off** so the richer module handles the swatch → gallery bridge; otherwise turn it **on** to get the light-mode bridge.

No behavior change for merchants who only have `Rollpix_ProductGallery` installed and had the flag turned on — for them, v1.8.0 was already working. This release only matters if (a) you have both modules installed, or (b) your PHP autoload happened to trip the `class_exists` false positive.

---

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
