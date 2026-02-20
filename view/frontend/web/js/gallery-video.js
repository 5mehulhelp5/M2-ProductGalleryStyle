/**
 * Rollpix ProductGallery - Video Component
 *
 * Handles lazy loading, autoplay/pause via IntersectionObserver,
 * and slider integration for video gallery items.
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
        var videoConfig = config.video || {};

        if (!videoConfig.enabled) {
            return;
        }

        var $videoItems = $gallery.find('.rp-gallery-item[data-media-type="video"]');

        if (!$videoItems.length) {
            return;
        }

        var videos = [];
        $videoItems.each(function () {
            var video = $(this).find('video')[0];
            if (video) {
                videos.push(video);
            }
        });

        if (!videos.length) {
            return;
        }

        initVisibilityObserver();
        initSliderIntegration();

        /**
         * IntersectionObserver for lazy load + autoplay control
         */
        function initVisibilityObserver() {
            if (!('IntersectionObserver' in window)) {
                // Fallback: load all videos immediately
                videos.forEach(function (video) {
                    if (video.preload === 'none') {
                        video.preload = 'metadata';
                        video.load();
                    }
                });
                return;
            }

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    var video = entry.target;

                    if (entry.isIntersecting) {
                        // Lazy load: trigger load if not yet loaded
                        if (video.preload === 'none') {
                            video.preload = 'metadata';
                            video.load();
                        }

                        // Autoplay when visible
                        if (videoConfig.autoplay && !prefersReducedMotion()) {
                            video.play().catch(function () {
                                // Autoplay may be blocked by browser policy
                            });
                        }
                    } else {
                        // Pause when not visible
                        if (!video.paused) {
                            video.pause();
                        }
                    }
                });
            }, {
                threshold: 0.25
            });

            videos.forEach(function (video) {
                observer.observe(video);
            });
        }

        /**
         * Slider integration: pause/play on slide change
         */
        function initSliderIntegration() {
            var layoutType = config.layout ? config.layout.type : 'vertical';

            if (layoutType !== 'slider') {
                return;
            }

            $gallery.on('rpslider:change', function (e, currentIndex) {
                var $items = $gallery.find('.rp-gallery-item');

                // Pause all videos
                videos.forEach(function (video) {
                    video.pause();
                });

                // Play video on active slide if applicable
                var $activeItem = $items.eq(currentIndex);
                if ($activeItem.data('media-type') === 'video') {
                    var activeVideo = $activeItem.find('video')[0];
                    if (activeVideo && videoConfig.autoplay && !prefersReducedMotion()) {
                        // Ensure video is loaded
                        if (activeVideo.preload === 'none') {
                            activeVideo.preload = 'metadata';
                            activeVideo.load();
                        }
                        activeVideo.play().catch(function () {});
                    }
                }
            });
        }

        function prefersReducedMotion() {
            return window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
    };
});
