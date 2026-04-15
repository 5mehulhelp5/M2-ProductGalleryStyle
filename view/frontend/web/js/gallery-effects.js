/**
 * Rollpix ProductGallery - Effects Component
 *
 * Handles: shimmer loading, fade-in on scroll, scroll focus, image counter
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */
define([
    'jquery',
    'domReady!'
], function ($) {
    'use strict';

    return function (config, element) {
        var $gallery = $(element);
        var effects = config.effects || {};
        var layoutType = config.layout ? config.layout.type : 'vertical';

        // Safety: shimmer and fade-in are mutually exclusive; shimmer takes priority.
        if (effects.shimmerEnabled && effects.fadeInEnabled) {
            effects.fadeInEnabled = false;
        }

        // =========================================
        // SHIMMER LOADING
        // =========================================
        if (effects.shimmerEnabled) {
            initShimmer();

            // Re-run shimmer detection when another component (e.g. the
            // swatch-gallery-bridge on configurable PDPs) replaces the
            // gallery images with a different variant's photos. The new
            // items are injected without the `rp-loaded` class, so without
            // re-running the poll they would inherit the CSS shimmer
            // animation forever.
            $gallery.on('rollpix:gallery:dom_replaced.rpshimmer', function () {
                initShimmer();
            });
        }

        function initShimmer() {
            var $items = $gallery.find('.rp-gallery-item');

            function markLoaded($item) {
                if (!$item.hasClass('rp-loaded')) {
                    $item.addClass('rp-loaded');
                }
            }

            /**
             * Detecta si un item esta "ready" (cargado, listo para mostrar).
             * Re-queries los child elements en cada call — asi sobrevive
             * mutations del DOM hechas por plugins WebP (MageFan mfwebp,
             * Yireo WebP2) que reemplazan `<img>` por `<picture><source><img>`
             * DESPUES de DOMContentLoaded. Si el plugin reemplaza el img
             * ya con el listener attachado, el listener queda huerfano
             * pero el poll siguiente encuentra el NUEVO img y verifica
             * `img.complete && naturalWidth > 0` directamente.
             *
             * Uses `naturalWidth > 0` as primary check because `complete`
             * can return true with 0x0 dimensions in edge cases (pending
             * fetch, broken src, race conditions con picture/srcset).
             */
            function isItemReady($item) {
                var $video = $item.find('video').first();
                if ($video.length) {
                    return $video[0].readyState >= 2;
                }
                var $facade = $item.find('.rp-video-facade');
                if ($facade.length) {
                    return true; // facade loads instantly (CSS background)
                }
                var $img = $item.find('img').first();
                if ($img.length) {
                    var img = $img[0];
                    return img.complete && img.naturalWidth > 0;
                }
                return true; // nothing to wait for
            }

            // Immediate pass: cached content marca rp-loaded sincrono.
            $items.each(function () {
                var $item = $(this);
                if (isItemReady($item)) {
                    markLoaded($item);
                }
            });

            // Polling fallback — checkea cada 100ms hasta 4s. No dependemos
            // del `load` event porque bajo ciertas condiciones (picture +
            // source webp + lazy loading + plugin DOM mutation) el event
            // puede perderse o no dispararse. Polling via `img.complete`
            // es el single source of truth del browser sobre el estado
            // real del resource.
            var startTime = Date.now();
            var pollInterval = setInterval(function () {
                var $pending = $items.filter(':not(.rp-loaded)');

                $pending.each(function () {
                    var $item = $(this);
                    if (isItemReady($item)) {
                        markLoaded($item);
                    }
                });

                // Stop si todos loaded O timeout 4s.
                var elapsed = Date.now() - startTime;
                if ($pending.length === 0 || elapsed >= 4000) {
                    clearInterval(pollInterval);
                    // Safety final: forzar todos a loaded pase lo que pase.
                    // El class check en markLoaded() previene re-trigger.
                    $items.each(function () {
                        markLoaded($(this));
                    });
                }
            }, 100);
        }

        // =========================================
        // FADE-IN ON SCROLL
        // =========================================
        if (effects.fadeInEnabled) {
            initFadeIn();
        }

        function initFadeIn() {
            var $items = $gallery.find('.rp-gallery-item');

            if (!('IntersectionObserver' in window)) {
                $items.addClass('rp-visible');
                return;
            }

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('rp-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            $items.each(function () {
                observer.observe(this);
            });
        }

        // =========================================
        // SCROLL FOCUS (stack layouts only)
        // =========================================
        var focusStyle = effects.focusStyle || 'disabled';
        if (focusStyle !== 'disabled' && layoutType !== 'slider') {
            initFocus();
        }

        function initFocus() {
            var $items = $gallery.find('.rp-gallery-item');
            if ($items.length <= 1) {
                return;
            }

            var useFade = focusStyle === 'fade' || focusStyle === 'both';
            var useBlur = focusStyle === 'blur' || focusStyle === 'both';
            var ticking = false;

            function updateFocus() {
                var vpCenter = window.innerHeight / 2;
                var deadZone = window.innerHeight * 0.25;
                var maxDist = window.innerHeight * 0.65;

                $items.each(function () {
                    var rect = this.getBoundingClientRect();
                    var factor;

                    // If viewport center is inside this image, it's fully in focus
                    // (handles tall images that span the entire viewport)
                    if (rect.top <= vpCenter && rect.bottom >= vpCenter) {
                        factor = 1;
                    } else {
                        // Distance from nearest edge to viewport center
                        var distance = rect.bottom < vpCenter
                            ? vpCenter - rect.bottom
                            : rect.top - vpCenter;

                        if (distance <= deadZone) {
                            factor = 1;
                        } else {
                            factor = Math.max(0, 1 - (distance - deadZone) / (maxDist - deadZone));
                        }
                    }

                    if (useFade) {
                        this.style.opacity = (0.25 + factor * 0.75).toFixed(3);
                    }
                    if (useBlur) {
                        var blur = ((1 - factor) * 3).toFixed(1);
                        this.style.filter = blur > 0.1 ? 'blur(' + blur + 'px)' : 'none';
                    }
                });
            }

            window.addEventListener('scroll', function () {
                if (!ticking) {
                    requestAnimationFrame(function () {
                        updateFocus();
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });

            // Initial call
            updateFocus();
        }

        // =========================================
        // IMAGE COUNTER (slider layout only)
        // =========================================
        if (effects.counterEnabled && layoutType === 'slider') {
            initCounter();
        }

        function initCounter() {
            var $items = $gallery.find('.rp-gallery-item');
            var totalImages = $items.length;

            if (totalImages <= 1 || window.innerWidth <= 767) {
                return;
            }

            var $counter = $('<div class="rp-counter-display"></div>');
            $('body').append($counter);

            var hideTimeout;

            // Show initial state briefly so user knows counter exists
            $counter.text('1 / ' + totalImages);
            $counter.addClass('rp-counter-visible');
            hideTimeout = setTimeout(function () {
                $counter.removeClass('rp-counter-visible');
            }, 3000);

            // Listen for slider change events
            $gallery.on('rpslider:change', function (e, currentIndex, total) {
                $counter.text((currentIndex + 1) + ' / ' + total);
                $counter.addClass('rp-counter-visible');

                clearTimeout(hideTimeout);
                hideTimeout = setTimeout(function () {
                    $counter.removeClass('rp-counter-visible');
                }, 2000);
            });
        }
    };
});
