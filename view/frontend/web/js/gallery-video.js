/**
 * Rollpix ProductGallery - Video Component
 *
 * Handles lazy loading, autoplay/pause via IntersectionObserver,
 * and slider integration for video gallery items.
 * Supports local MP4 videos and YouTube/Vimeo iframes.
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

        initVisibilityObserver();
        initSliderIntegration();
        initFacadeClicks();

        /**
         * IntersectionObserver for lazy load + autoplay control.
         * Handles both <video> elements and iframe/facade items.
         */
        function initVisibilityObserver() {
            if (!('IntersectionObserver' in window)) {
                // Fallback: load all videos immediately
                $videoItems.each(function () {
                    var video = $(this).find('video')[0];

                    if (video && video.preload === 'none') {
                        video.preload = 'metadata';
                        video.load();
                    }

                    activateFacade($(this));
                });
                return;
            }

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    var $item = $(entry.target);
                    var provider = $item.data('video-provider') || 'local';

                    if (entry.isIntersecting) {
                        if (provider === 'local') {
                            handleLocalVideoVisible($item);
                        } else {
                            handleExternalVideoVisible($item);
                        }
                    } else {
                        if (provider === 'local') {
                            handleLocalVideoHidden($item);
                        } else {
                            handleExternalVideoHidden($item);
                        }
                    }
                });
            }, {
                threshold: 0.25
            });

            $videoItems.each(function () {
                observer.observe(this);
            });
        }

        /* ── Local MP4 video handlers ─────────────────── */

        function handleLocalVideoVisible($item) {
            var video = $item.find('video')[0];

            if (!video) {
                return;
            }

            if (video.preload === 'none') {
                video.preload = 'metadata';
                video.load();
            }

            if (videoConfig.autoplay && !prefersReducedMotion()) {
                video.play().catch(function () {});
            }
        }

        function handleLocalVideoHidden($item) {
            var video = $item.find('video')[0];

            if (video && !video.paused) {
                video.pause();
            }
        }

        /* ── External video (YouTube/Vimeo) handlers ──── */

        function handleExternalVideoVisible($item) {
            var $facade = $item.find('.rp-video-facade');

            // If facade exists and autoplay is on, activate it (replace with iframe)
            if ($facade.length && videoConfig.autoplay && !prefersReducedMotion()) {
                activateFacade($item);
            }

            // If iframe already loaded, send play command
            var iframe = $item.find('iframe')[0];

            if (iframe && videoConfig.autoplay && !prefersReducedMotion()) {
                postMessagePlay(iframe, $item.data('video-provider'));
            }
        }

        function handleExternalVideoHidden($item) {
            var iframe = $item.find('iframe')[0];

            if (iframe) {
                postMessagePause(iframe, $item.data('video-provider'));
            }
        }

        /* ── Facade click handling ────────────────────── */

        function initFacadeClicks() {
            $gallery.on('click', '.rp-video-facade, .rp-video-facade-play', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var $item = $(this).closest('.rp-gallery-item');

                activateFacade($item);
            });
        }

        /**
         * Replace facade (thumbnail + play button) with actual iframe.
         */
        function activateFacade($item) {
            var $facade = $item.find('.rp-video-facade');

            if (!$facade.length) {
                return;
            }

            var embedUrl = $item.data('video-embed-url');

            if (!embedUrl) {
                return;
            }

            // Add enablejsapi with proper origin for YouTube postMessage control
            var provider = $item.data('video-provider') || '';

            if (provider === 'youtube') {
                var sep = embedUrl.indexOf('?') !== -1 ? '&' : '?';

                embedUrl += sep + 'enablejsapi=1&origin=' + encodeURIComponent(window.location.origin);
            }

            var $iframe = $('<iframe/>', {
                src: embedUrl,
                'class': 'rp-video-iframe',
                frameborder: '0',
                allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
                referrerpolicy: 'strict-origin-when-cross-origin',
                allowfullscreen: true
            });

            $facade.replaceWith($iframe);
            $item.addClass('rp-video-active');
        }

        /* ── PostMessage API for iframe control ───────── */

        function postMessagePlay(iframe, provider) {
            try {
                if (provider === 'youtube') {
                    iframe.contentWindow.postMessage(
                        JSON.stringify({event: 'command', func: 'playVideo', args: ''}),
                        '*'
                    );
                } else if (provider === 'vimeo') {
                    iframe.contentWindow.postMessage(
                        JSON.stringify({method: 'play'}),
                        '*'
                    );
                }
            } catch (e) {
                // Cross-origin errors are expected in some configurations
            }
        }

        function postMessagePause(iframe, provider) {
            try {
                if (provider === 'youtube') {
                    iframe.contentWindow.postMessage(
                        JSON.stringify({event: 'command', func: 'pauseVideo', args: ''}),
                        '*'
                    );
                } else if (provider === 'vimeo') {
                    iframe.contentWindow.postMessage(
                        JSON.stringify({method: 'pause'}),
                        '*'
                    );
                }
            } catch (e) {
                // Cross-origin errors are expected in some configurations
            }
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
                $items.each(function () {
                    var $item = $(this);
                    var provider = $item.data('video-provider') || '';
                    var video = $item.find('video')[0];
                    var iframe = $item.find('iframe')[0];

                    if (video) {
                        video.pause();
                    }
                    if (iframe && provider) {
                        postMessagePause(iframe, provider);
                    }
                });

                // Play video on active slide if applicable
                var $activeItem = $items.eq(currentIndex);

                if ($activeItem.data('media-type') === 'video' && videoConfig.autoplay && !prefersReducedMotion()) {
                    var activeProvider = $activeItem.data('video-provider') || 'local';

                    if (activeProvider === 'local') {
                        var activeVideo = $activeItem.find('video')[0];

                        if (activeVideo) {
                            if (activeVideo.preload === 'none') {
                                activeVideo.preload = 'metadata';
                                activeVideo.load();
                            }
                            activeVideo.play().catch(function () {});
                        }
                    } else {
                        // Activate facade if present, or play existing iframe
                        activateFacade($activeItem);
                        var activeIframe = $activeItem.find('iframe')[0];

                        if (activeIframe) {
                            postMessagePlay(activeIframe, activeProvider);
                        }
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
