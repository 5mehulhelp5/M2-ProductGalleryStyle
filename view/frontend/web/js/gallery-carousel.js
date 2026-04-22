/**
 * Rollpix ProductGallery - Mobile Carousel Component
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */
define([
    'jquery'
], function ($) {
    'use strict';

    return function (config, element) {
        var $gallery = $(element);
        var mobileConfig = config.mobile || {};
        var mobileBehavior = mobileConfig.behavior || 'stack';
        var showDots = mobileConfig.carouselDots !== false;
        var showArrows = mobileConfig.carouselArrows !== false;
        var mobileBreakpoint = 767;
        var isCarouselInitialized = false;
        var $wrapper, $track, $items, $indicators, $prevBtn, $nextBtn;
        var currentIndex = 0;
        var startX, startY, currentX, isDragging = false;
        var threshold = 50;

        // Only initialize carousel if configured
        if (mobileBehavior !== 'carousel') {
            return;
        }

        init();

        function init() {
            checkViewport();
            $(window).on('resize', debounce(checkViewport, 250));
        }

        function checkViewport() {
            var isMobile = window.innerWidth <= mobileBreakpoint;

            if (isMobile && !isCarouselInitialized) {
                initCarousel();
            } else if (!isMobile && isCarouselInitialized) {
                destroyCarousel();
            }
        }

        function initCarousel() {
            $items = $gallery.find('.rp-gallery-item');

            if ($items.length <= 1) {
                return;
            }

            // Wrap items in carousel structure
            $gallery.find('.rp-gallery-images').addClass('rp-carousel-wrapper');
            $wrapper = $gallery.find('.rp-carousel-wrapper');

            // Unwrap items from any rp-zoom-wrapper (hover-zoom init runs
            // first on mobile and leaves an empty wrapper as a sibling of
            // the track once items are moved — that sibling sits in the
            // flex-column wrapper and pushes the track down by the gap).
            $items.each(function () {
                var $parent = $(this).parent();
                if ($parent.hasClass('rp-zoom-wrapper')) {
                    $parent.before(this);
                }
            });
            $wrapper.find('.rp-zoom-wrapper').remove();

            // Create track
            $track = $('<div class="rp-carousel-track"></div>');
            $items.appendTo($track);
            $wrapper.append($track);

            // Create indicators (dots)
            if (showDots) {
                createIndicators();
            }

            // Create arrows
            if (showArrows) {
                createArrows();
            }

            // Set initial state
            $items.addClass('rp-carousel-slide');
            updateCarousel();

            // Touch events. touchcancel is required on iOS — the OS
            // cancels a touch when a system gesture takes over (address bar
            // show/hide on scroll, edge-swipe back, incoming notification).
            // Without it, isDragging stays true and transition stays 'none',
            // so the next swipe silently fails.
            $track[0].addEventListener('touchstart', onTouchStart, { passive: true });
            $track[0].addEventListener('touchmove', onTouchMove, { passive: false });
            $track[0].addEventListener('touchend', onTouchEnd, { passive: true });
            $track[0].addEventListener('touchcancel', onTouchCancel, { passive: true });

            isCarouselInitialized = true;
            $gallery.addClass('rp-carousel-active');
        }

        function destroyCarousel() {
            if (!isCarouselInitialized) {
                return;
            }

            // Remove carousel structure
            $items.removeClass('rp-carousel-slide');
            $items.appendTo($wrapper);
            $track.remove();

            // Remove indicators and arrows
            $wrapper.find('.rp-carousel-indicators').remove();
            $wrapper.find('.rp-carousel-prev, .rp-carousel-next').remove();

            // Remove classes and reset height
            $wrapper.removeClass('rp-carousel-wrapper').css('height', '');
            $gallery.removeClass('rp-carousel-active');

            isCarouselInitialized = false;
            currentIndex = 0;
        }

        function createIndicators() {
            var $indicatorContainer = $('<div class="rp-carousel-indicators"></div>');

            $items.each(function (index) {
                var $dot = $('<button class="rp-carousel-dot" data-index="' + index + '"></button>');
                $dot.on('click', function () {
                    goToSlide(index);
                });
                $indicatorContainer.append($dot);
            });

            $wrapper.append($indicatorContainer);
            $indicators = $wrapper.find('.rp-carousel-dot');
        }

        function createArrows() {
            $prevBtn = $('<button class="rp-carousel-prev" type="button" aria-label="Previous">' +
                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
                'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<polyline points="15 18 9 12 15 6"></polyline></svg></button>');

            $nextBtn = $('<button class="rp-carousel-next" type="button" aria-label="Next">' +
                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
                'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<polyline points="9 18 15 12 9 6"></polyline></svg></button>');

            $prevBtn.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                prevSlide();
            });

            $nextBtn.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                nextSlide();
            });

            $wrapper.append($prevBtn, $nextBtn);
        }

        function updateCarousel() {
            var slideWidth = $wrapper.width();
            var translateX = -(currentIndex * slideWidth);

            // translate3d (not translateX) pairs with the will-change +
            // backface-visibility declaration on .rp-carousel-track to keep
            // the track on its own compositor layer — required for iOS
            // Safari to keep routing horizontal touchmove events to us once
            // the gallery is sticky.
            $track.css('transform', 'translate3d(' + translateX + 'px, 0, 0)');

            // Adjust wrapper height to match current slide (prevents blank space)
            var $currentSlide = $items.eq(currentIndex);
            var media = $currentSlide.find('img')[0] || $currentSlide.find('video')[0];

            if (media) {
                var setHeight = function () {
                    var h = media.offsetHeight || 0;
                    if (h > 0) {
                        $wrapper.css('height', h + 'px');
                    }
                };

                if (media.tagName === 'VIDEO') {
                    if (media.readyState >= 1) {
                        setHeight();
                    } else {
                        $(media).one('loadedmetadata', setHeight);
                    }
                } else {
                    if (media.complete && media.naturalHeight > 0) {
                        setHeight();
                    } else {
                        $(media).one('load', setHeight);
                    }
                }
            }

            // Update indicators
            if ($indicators) {
                $indicators.removeClass('active');
                $indicators.eq(currentIndex).addClass('active');
            }

            // Update arrow visibility
            if ($prevBtn) {
                $prevBtn.toggleClass('rp-carousel-arrow-hidden', currentIndex === 0);
            }
            if ($nextBtn) {
                $nextBtn.toggleClass('rp-carousel-arrow-hidden', currentIndex === $items.length - 1);
            }
        }

        function goToSlide(index) {
            var maxIndex = $items.length - 1;
            currentIndex = Math.max(0, Math.min(index, maxIndex));
            updateCarousel();
        }

        function nextSlide() {
            goToSlide(currentIndex + 1);
        }

        function prevSlide() {
            goToSlide(currentIndex - 1);
        }

        // Touch handlers
        function onTouchStart(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            // Seed currentX so a tap (no touchmove) computes diffX=0 on
            // touchend instead of reusing the previous swipe's endpoint,
            // which would otherwise trigger a spurious next/prev.
            currentX = startX;
            isDragging = true;
            $track.css('transition', 'none');
        }

        function onTouchMove(e) {
            if (!isDragging) return;

            currentX = e.touches[0].clientX;
            var currentY = e.touches[0].clientY;
            var diffX = currentX - startX;
            var diffY = currentY - startY;

            // If scrolling more vertically, don't interfere
            if (Math.abs(diffY) > Math.abs(diffX)) {
                return;
            }

            e.preventDefault();

            var slideWidth = $wrapper.width();
            var baseTranslate = -(currentIndex * slideWidth);
            $track.css('transform', 'translate3d(' + (baseTranslate + diffX) + 'px, 0, 0)');
        }

        function onTouchEnd(e) {
            if (!isDragging) return;
            isDragging = false;

            $track.css('transition', 'transform 0.3s ease');

            var diffX = currentX - startX;

            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    prevSlide();
                } else {
                    nextSlide();
                }
            } else {
                updateCarousel();
            }
        }

        function onTouchCancel(e) {
            if (!isDragging) return;
            isDragging = false;
            $track.css('transition', 'transform 0.3s ease');
            updateCarousel();
        }

        // Utility
        function debounce(func, wait) {
            var timeout;
            return function () {
                var context = this, args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    func.apply(context, args);
                }, wait);
            };
        }

        // Handle window resize for slide width recalculation
        $(window).on('resize', debounce(function () {
            if (isCarouselInitialized) {
                updateCarousel();
            }
        }, 250));
    };
});
