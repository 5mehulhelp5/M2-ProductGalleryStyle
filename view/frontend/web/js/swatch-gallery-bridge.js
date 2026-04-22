/**
 * Rollpix ProductGallery — Swatch Gallery Bridge (Light Mode)
 *
 * Mixin for Magento_Swatches/js/swatch-renderer.
 *
 * When a shopper picks a different swatch option on a configurable
 * product's PDP, this mixin rebuilds the Rollpix gallery images so they
 * match the selected child SKU. The stock swatch-renderer targets
 * Fotorama, which this module replaces — this bridge fills that gap
 * without depending on the larger `Rollpix_ConfigurableGallery` module.
 *
 * Matching respects Magento's per-attribute
 * "Update Product Preview Image" flag (update_product_preview_image).
 * On a configurable with e.g. color + size where only color has the
 * flag on, switching size keeps the current image. If no attribute has
 * the flag on (legacy catalogs), every attribute counts — preserving
 * v1.8.0 behaviour.
 *
 * ⚠ LIMITATIONS — see etc/adminhtml/system.xml (configurable group
 * comment) and README.md ("Configurable variant image switch") for the
 * full list. This is explicitly a *light* mode:
 *   - Only still images are switched (videos are skipped on variants).
 *   - Zoom widgets (hover/click) are not re-initialized and may behave
 *     unexpectedly after a swatch change. Recommend Lightbox / Modal
 *     Zoom / Disabled for configurable PDPs.
 *   - Slider / carousel / thumbnail / sticky widgets are not
 *     re-initialized — the light mode is designed for stack layouts
 *     (Vertical / Grid / Fashion).
 *   - Under a WebP-optimization plugin (MageFan mfwebp, Yireo WebP2),
 *     variant images may be served as the non-WebP originals.
 *
 * The mixin is only activated when the admin flag
 *   rollpix_gallery/configurable/swatch_gallery_switch_enabled
 * is "Yes". The template sets `window.rpSwatchGallerySwitchEnabled`
 * inline on configurable PDPs when that flag is on; otherwise this
 * mixin is a no-op pass-through. Rollpix_ProductGallery and
 * Rollpix_ConfigurableGallery are designed to coexist — if both
 * modules are installed, the merchant chooses which bridge is active
 * via this admin flag.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */
define(['jquery'], function ($) {
    'use strict';

    return function (SwatchRenderer) {

        // Global opt-in flag, emitted inline by gallery-vertical.phtml.
        // Soft-dep check also sits on the PHP side — if
        // Rollpix_ConfigurableGallery is installed the ViewModel getter
        // returns false and the template never emits the flag.
        if (typeof window === 'undefined' || !window.rpSwatchGallerySwitchEnabled) {
            return SwatchRenderer;
        }

        $.widget('mage.SwatchRenderer', SwatchRenderer, {

            /** Original gallery HTML, saved on first swatch interaction. */
            _rpOriginalItemsHtml: null,

            /** Last child product id whose images were pushed into the gallery. */
            _rpLastSyncedProductId: null,

            // ----------------------------------------------------------
            // Hooks: swatch click / change → sync gallery
            // ----------------------------------------------------------
            _OnClick: function ($this, $widget) {
                this._super($this, $widget);
                this._rpSyncGallery();
            },

            _OnChange: function ($this, $widget) {
                this._super($this, $widget);
                this._rpSyncGallery();
            },

            // ----------------------------------------------------------
            // Core: determine selected child → rebuild the gallery
            // ----------------------------------------------------------
            _rpSyncGallery: function () {
                var $gallery = $('[data-role="rp-gallery"]').first();
                if (!$gallery.length) {
                    return;
                }

                var $container = $gallery.find('.rp-gallery-images');
                if (!$container.length) {
                    return;
                }

                // Snapshot original parent gallery on first interaction so
                // we can restore it when the selection is cleared.
                if (this._rpOriginalItemsHtml === null) {
                    this._rpOriginalItemsHtml = $container.html();
                }

                var productIds = this._rpMatchedProducts();

                if (!productIds) {
                    // No full selection yet → restore parent gallery.
                    if (this._rpLastSyncedProductId !== null) {
                        $container.html(this._rpOriginalItemsHtml);
                        this._rpLastSyncedProductId = null;
                        this._rpFireDomReplaced($gallery);
                    }
                    return;
                }

                var pid = productIds[0];

                // Short-circuit when the resolved child hasn't changed.
                // Matters when a non-preview-relevant attribute (e.g. size
                // on a color+size configurable where only color has
                // `update_product_preview_image` = Yes) is flipped —
                // matcher returns the same child, so the DOM swap and its
                // shimmer flicker are skipped.
                if (this._rpLastSyncedProductId === pid) {
                    return;
                }

                var jsonConfig = this.options && this.options.jsonConfig;
                if (!jsonConfig || !jsonConfig.images) {
                    return;
                }

                var images = jsonConfig.images[pid];
                if (!images || !images.length) {
                    return;
                }

                this._rpLastSyncedProductId = pid;
                this._rpRebuildGallery($gallery, $container, images);
            },

            // ----------------------------------------------------------
            // Walk the swatch UI and determine which child product(s)
            // match every currently-selected *preview-relevant* attribute.
            //
            // "Preview-relevant" = attributes whose admin flag
            // `update_product_preview_image` is set to Yes. On a
            // configurable with e.g. color + size where only color opts
            // into preview updates, picking a different size is expected
            // to keep the current image — so size is ignored when
            // computing the match.
            //
            // Backward-compat fallback: if NO attribute opts in (legacy
            // catalogs where the merchant never touched the flag), every
            // attribute counts — same as v1.8.0 behaviour.
            //
            // Returns null if no option is selected or if the current
            // selection of preview-relevant attributes is partial.
            // ----------------------------------------------------------
            _rpMatchedProducts: function () {
                var widget = this;
                var jsonConfig = (this.options && this.options.jsonConfig) || {};
                var jsonAttrs = jsonConfig.attributes || {};

                var hasOptIn = false;
                $.each(jsonAttrs, function (_, meta) {
                    if (widget._rpAttrUpdatesPreview(meta)) {
                        hasOptIn = true;
                        return false;
                    }
                });

                var selected = {};
                var relevantCount = 0;
                var selectedCount = 0;

                this.element
                    .find('.' + this.options.classes.attributeClass)
                    .each(function () {
                        var $attr = $(this);
                        var attrId = $attr.data('attribute-id');
                        var attrMeta = jsonAttrs[attrId] || {};

                        if (hasOptIn && !widget._rpAttrUpdatesPreview(attrMeta)) {
                            return;
                        }

                        relevantCount++;
                        var $opt = $attr.find(
                            '.' + widget.options.classes.optionClass + '.selected'
                        );
                        if ($opt.length) {
                            selected[attrId] = String($opt.data('option-id'));
                            selectedCount++;
                        }
                    });

                if (!relevantCount || selectedCount < relevantCount) {
                    return null;
                }

                var index = jsonConfig.index || {};
                var matches = [];

                $.each(index, function (pid, attrs) {
                    var ok = true;
                    $.each(selected, function (aid, oid) {
                        if (String(attrs[aid]) !== oid) {
                            ok = false;
                            return false;
                        }
                    });
                    if (ok) {
                        matches.push(pid);
                    }
                });

                return matches.length ? matches : null;
            },

            // ----------------------------------------------------------
            // Read Magento's admin flag `update_product_preview_image`
            // from the swatch jsonConfig.
            //
            // Stock Magento's Swatches helper packs the flag into the
            // serialized `additional_data` field on save
            // (Swatches\Helper\Data::assembleAdditionalDataEavAttribute)
            // and never unpacks it back to a top-level key on load — so
            // in jsonConfig.attributes[id] we usually find the flag only
            // inside a JSON string at `additional_data`. We read the
            // top-level key first as a defensive fallback (third-party
            // customisations sometimes flatten it) and then parse
            // `additional_data`.
            //
            // In Magento admin the checkbox is stored as "1" when on and
            // is omitted entirely when off, so treat a missing key as No.
            // ----------------------------------------------------------
            _rpAttrUpdatesPreview: function (meta) {
                if (!meta) {
                    return false;
                }

                var direct = meta.update_product_preview_image;
                if (direct === 1 || direct === '1' || direct === true) {
                    return true;
                }
                if (direct === 0 || direct === '0' || direct === false) {
                    return false;
                }

                var addl = meta.additional_data;
                if (typeof addl === 'string' && addl.length) {
                    try {
                        var parsed = JSON.parse(addl);
                        var flag = parsed && parsed.update_product_preview_image;
                        return flag === 1 || flag === '1' || flag === true;
                    } catch (e) {
                        /* malformed — treat as no opt-in */
                    }
                }

                return false;
            },

            // ----------------------------------------------------------
            // Replace the .rp-gallery-images children with new <a><img>
            // nodes built from jsonConfig.images[pid]. Uses DOM nodes
            // (not string concat) to avoid XSS on malicious image URLs
            // from a compromised admin.
            // ----------------------------------------------------------
            _rpRebuildGallery: function ($gallery, $container, images) {
                var altBase = $container.find('img').first().attr('alt') || '';

                // Detect whether the parent gallery is wrapping each img
                // in a <picture class="mfwebp">…</picture> (MageFan WebP
                // plugin). When present, we wrap the new variant images
                // in the same picture shell as a defensive measure — the
                // browser will fall back to the <img> src (non-WebP) if
                // it can't derive a WebP URL for the variant. This keeps
                // layout stable and avoids a visible "missing picture"
                // regression on WebP-enabled sites. Full WebP support for
                // variants is out of scope for light mode.
                var hasMfWebp = $container.find('picture.mfwebp').length > 0;

                // Tear down any leftover zoom wrappers added by the
                // gallery-zoom widget on the original DOM. We don't
                // re-init the zoom widget — that's a known limitation —
                // but we do remove its mutations so the new items aren't
                // rendered inside an orphan zoom lens.
                $container.find('.rp-zoom-wrapper').each(function () {
                    $(this).find('.rp-gallery-item').unwrap();
                });
                $container.find('.rp-zoom-lens, .rp-zoom-result-inside').remove();
                $('.rp-zoom-result-fixed').remove();

                var frag = document.createDocumentFragment();
                var appended = 0;

                $.each(images, function (i, img) {
                    // Videos cannot be reliably reconstructed from
                    // jsonConfig.images — skip them for variants.
                    if (img && img.type === 'video') {
                        return;
                    }
                    if (!img || !img.img) {
                        return;
                    }

                    var anchor = document.createElement('a');
                    anchor.className = 'rp-gallery-item';
                    anchor.setAttribute('data-media-type', 'image');
                    anchor.setAttribute('data-gallery', 'product-gallery');
                    anchor.href = img.full || img.img;

                    var imgEl = document.createElement('img');
                    imgEl.src = img.img;
                    imgEl.alt = altBase;
                    imgEl.loading = 'lazy';

                    if (hasMfWebp) {
                        // Defensive clone: wrap in <picture class="mfwebp">
                        // so the surrounding CSS targeting that selector
                        // still matches. No <source> — the plugin is the
                        // source of truth for WebP variants; browsers fall
                        // back to <img> src cleanly when no source matches.
                        var picture = document.createElement('picture');
                        picture.className = 'mfwebp';
                        picture.appendChild(imgEl);
                        anchor.appendChild(picture);
                    } else {
                        anchor.appendChild(imgEl);
                    }

                    frag.appendChild(anchor);
                    appended++;
                });

                if (!appended) {
                    return;
                }

                $container.empty();
                $container[0].appendChild(frag);

                this._rpFireDomReplaced($gallery);
            },

            // ----------------------------------------------------------
            // Notify other components (e.g. gallery-effects shimmer)
            // that the .rp-gallery-item set was replaced. Components
            // that hold stale references should re-query the DOM.
            // ----------------------------------------------------------
            _rpFireDomReplaced: function ($gallery) {
                try {
                    $gallery.trigger('rollpix:gallery:dom_replaced');
                } catch (e) { /* no-op */ }
            }
        });

        return $.mage.SwatchRenderer;
    };
});
