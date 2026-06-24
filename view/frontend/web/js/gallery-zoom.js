/**
 * Rollpix ProductGallery - Zoom Component
 *
 * Supports: hover (magnifier), click (in-place), disabled
 *
 * Re-initializes on `rollpix:gallery:dom_replaced` so zoom keeps working
 * after the swatch → gallery bridge swaps the images for a different
 * variant on a configurable PDP. Without this the rebuilt
 * `.rp-gallery-item` anchors carried no zoom handler and a click fell
 * through to the anchor's `href` — opening the raw image file (IS-6448).
 * Mirrors the v1.8.8 fix in gallery-carousel-zoom.js for the modal/
 * carousel/lightbox zoom types.
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
        var zoomType = config.zoom ? config.zoom.type : 'hover';
        var zoomLevel = config.zoom ? config.zoom.level : 3;
        var zoomPosition = config.zoom ? config.zoom.position : 'right';

        if (zoomType === 'disabled' || zoomType === 'modal' || zoomType === 'carousel' || zoomType === 'lightbox') {
            return;
        }

        setup();

        // Re-run when the swatch → gallery bridge replaces the images for
        // a different variant.
        $gallery.on('rollpix:gallery:dom_replaced.rpzoomreinit', function () {
            setup();
        });

        /**
         * (Re)bind zoom against the current images. Idempotent: clears any
         * prior zoom DOM/handlers first so it can run on every swap.
         */
        function setup() {
            teardown();
            if (zoomType === 'click') {
                initClickZoom();
            } else {
                initHoverZoom();
            }
        }

        function teardown() {
            $gallery.find('.rp-gallery-item').off('.rpzoom')
                .removeClass('rp-click-zoom-item rp-click-zoomed');
            // Undo hover-zoom wrappers + lenses and click-zoom overlays.
            $gallery.find('.rp-zoom-wrapper').each(function () {
                $(this).find('.rp-gallery-item').unwrap();
            });
            $gallery.find('.rp-zoom-lens, .rp-zoom-result-inside, .rp-click-zoom-overlay').remove();
            // Shared hover result panel lives on <body> — drop it so swaps
            // don't stack multiple copies.
            $('.rp-zoom-result-fixed').remove();
        }

        /* ===========================================================
           HOVER ZOOM - Magnifier lens + result panel
           =========================================================== */
        function initHoverZoom() {
            var $items = $gallery.find('.rp-gallery-item[data-media-type="image"]');

            // For "right" position: create a single shared fixed result panel
            var $fixedResult = null;
            if (zoomPosition === 'right') {
                $fixedResult = $('<div class="rp-zoom-result rp-zoom-result-fixed"></div>');
                $('body').append($fixedResult);
            }

            $items.each(function () {
                var $item = $(this);
                var $img = $item.find('img');
                var largeImageUrl = $item.attr('href');

                // Immediate guard: never let a click on the gallery image
                // navigate to the raw file, even before the large image
                // below has loaded and the behaviour handlers are bound.
                $item.on('click.rpzoom', function (e) {
                    e.preventDefault();
                });

                // Wrapper for positioning
                var $zoomWrapper = $('<div class="rp-zoom-wrapper"></div>');
                $item.wrap($zoomWrapper);
                $zoomWrapper = $item.parent();

                var $zoomLens = $('<div class="rp-zoom-lens"></div>');
                $item.append($zoomLens);

                // For "inside" position: result is inside each item
                var $zoomResult;
                if (zoomPosition === 'inside') {
                    $zoomResult = $('<div class="rp-zoom-result rp-zoom-result-inside"></div>');
                    $item.append($zoomResult);
                } else {
                    $zoomResult = $fixedResult;
                }

                var largeImage = new Image();

                largeImage.onload = function () {
                    $item.on('mouseenter.rpzoom', function () {
                        var imgWidth = $img.width();
                        var imgHeight = $img.height();

                        var lensWidth = imgWidth / zoomLevel;
                        var lensHeight = imgHeight / zoomLevel;

                        $zoomLens.css({
                            width: lensWidth + 'px',
                            height: lensHeight + 'px'
                        });

                        $zoomResult.css('background-image', 'url("' + largeImageUrl + '")');

                        if (zoomPosition === 'right') {
                            // Fixed square size regardless of image proportions
                            var resultSize = 300;

                            $zoomResult.css({
                                width: resultSize + 'px',
                                height: resultSize + 'px',
                                backgroundSize: largeImage.width + 'px ' + largeImage.height + 'px'
                            });
                        } else {
                            $zoomResult.css({
                                width: '100%',
                                height: '100%',
                                backgroundSize: (imgWidth * zoomLevel) + 'px ' + (imgHeight * zoomLevel) + 'px'
                            });
                        }

                        $zoomLens.addClass('active');
                        $zoomResult.addClass('active');
                    });

                    $item.on('mouseleave.rpzoom', function () {
                        $zoomLens.removeClass('active');
                        $zoomResult.removeClass('active');
                    });

                    $item.on('mousemove.rpzoom', function (e) {
                        var offset = $img.offset();
                        var imgWidth = $img.width();
                        var imgHeight = $img.height();
                        var lensWidth = $zoomLens.outerWidth();
                        var lensHeight = $zoomLens.outerHeight();

                        var x = e.pageX - offset.left;
                        var y = e.pageY - offset.top;

                        var lensX = Math.max(0, Math.min(x - lensWidth / 2, imgWidth - lensWidth));
                        var lensY = Math.max(0, Math.min(y - lensHeight / 2, imgHeight - lensHeight));

                        $zoomLens.css({ left: lensX + 'px', top: lensY + 'px' });

                        var ratioX = largeImage.width / imgWidth;
                        var ratioY = largeImage.height / imgHeight;

                        $zoomResult.css('background-position',
                            -(lensX * ratioX) + 'px ' + -(lensY * ratioY) + 'px'
                        );

                        // Position fixed result relative to viewport
                        if (zoomPosition === 'right') {
                            var imgRect = $img[0].getBoundingClientRect();
                            var resultW = $zoomResult.outerWidth();
                            var resultH = $zoomResult.outerHeight();

                            // Place to the right of the image, vertically centered on cursor
                            var fixedLeft = imgRect.right + 15;
                            var fixedTop = e.clientY - resultH / 2;

                            // Keep within viewport bounds
                            var viewportW = window.innerWidth;
                            var viewportH = window.innerHeight;

                            // If it overflows right, place to the left of the image
                            if (fixedLeft + resultW > viewportW - 10) {
                                fixedLeft = imgRect.left - resultW - 15;
                            }

                            // Clamp vertical position
                            fixedTop = Math.max(10, Math.min(fixedTop, viewportH - resultH - 10));

                            $zoomResult.css({
                                left: fixedLeft + 'px',
                                top: fixedTop + 'px'
                            });
                        }
                    });
                };

                largeImage.src = largeImageUrl;
            });
        }

        /* ===========================================================
           CLICK ZOOM - Click to toggle zoom inside the image
           =========================================================== */
        function initClickZoom() {
            var $items = $gallery.find('.rp-gallery-item[data-media-type="image"]');

            $items.each(function () {
                var $item = $(this);
                var $img = $item.find('img');
                var largeImageUrl = $item.attr('href');
                var isZoomed = false;

                // Immediate guard: never let a click navigate to the raw
                // file, even before the large image loads below.
                $item.on('click.rpzoom', function (e) {
                    e.preventDefault();
                });

                // Create overlay for zoomed view
                var $zoomOverlay = $('<div class="rp-click-zoom-overlay"></div>');
                $item.append($zoomOverlay);
                $item.addClass('rp-click-zoom-item');

                var largeImage = new Image();

                largeImage.onload = function () {
                    $zoomOverlay.css('background-image', 'url("' + largeImageUrl + '")');

                    // Click to toggle zoom
                    $item.on('click.rpzoom', function (e) {
                        e.preventDefault();

                        if (!isZoomed) {
                            // Activate zoom
                            isZoomed = true;
                            $item.addClass('rp-click-zoomed');

                            var imgWidth = $img.width();
                            var imgHeight = $img.height();

                            $zoomOverlay.css({
                                backgroundSize: (imgWidth * zoomLevel) + 'px ' + (imgHeight * zoomLevel) + 'px'
                            });

                            // Position zoom at click point
                            positionZoom(e);
                            $zoomOverlay.addClass('active');
                        } else {
                            // Deactivate zoom
                            isZoomed = false;
                            $item.removeClass('rp-click-zoomed');
                            $zoomOverlay.removeClass('active');
                        }
                    });

                    // Move zoom while active
                    $item.on('mousemove.rpzoom', function (e) {
                        if (!isZoomed) return;
                        positionZoom(e);
                    });

                    // Exit zoom when leaving the image
                    $item.on('mouseleave.rpzoom', function () {
                        if (isZoomed) {
                            isZoomed = false;
                            $item.removeClass('rp-click-zoomed');
                            $zoomOverlay.removeClass('active');
                        }
                    });

                    function positionZoom(e) {
                        var offset = $img.offset();
                        var imgWidth = $img.width();
                        var imgHeight = $img.height();

                        // Mouse position as percentage
                        var pctX = (e.pageX - offset.left) / imgWidth;
                        var pctY = (e.pageY - offset.top) / imgHeight;

                        // Clamp to 0-1
                        pctX = Math.max(0, Math.min(1, pctX));
                        pctY = Math.max(0, Math.min(1, pctY));

                        // Background position
                        var bgWidth = imgWidth * zoomLevel;
                        var bgHeight = imgHeight * zoomLevel;

                        var bgX = -(pctX * (bgWidth - imgWidth));
                        var bgY = -(pctY * (bgHeight - imgHeight));

                        $zoomOverlay.css('background-position', bgX + 'px ' + bgY + 'px');
                    }
                };

                largeImage.src = largeImageUrl;
            });
        }

    };
});
