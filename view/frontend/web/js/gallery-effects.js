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
        }

        function initShimmer() {
            var $items = $gallery.find('.rp-gallery-item');

            function markLoaded($item) {
                if (!$item.hasClass('rp-loaded')) {
                    $item.addClass('rp-loaded');
                }
            }

            $items.each(function () {
                var $item = $(this);
                var $img = $item.find('img');

                if (!$img.length) {
                    markLoaded($item);
                    return;
                }

                var img = $img[0];

                // Listen for load/error regardless (handles lazy-loaded images)
                $img.on('load.rpshimmer error.rpshimmer', function () {
                    markLoaded($item);
                });

                // Already loaded (from cache or fast load)
                if (img.complete) {
                    markLoaded($item);
                }
            });

            // Safety fallback: reveal all after 4 seconds no matter what
            setTimeout(function () {
                $items.each(function () {
                    markLoaded($(this));
                });
            }, 4000);
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
