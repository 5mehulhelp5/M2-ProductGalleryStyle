/**
 * Rollpix ProductGallery - Listing Page Video Component
 *
 * Handles autoplay/pause of videos on category listing pages
 * using IntersectionObserver for performance.
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

    var $localVideos = $('.rp-listing-video');
    var $externalWrappers = $('.rp-listing-video-external');

    if (!$localVideos.length && !$externalWrappers.length) {
        return;
    }

    if (!('IntersectionObserver' in window)) {
        return;
    }

    var prefersReducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        $localVideos.each(function () {
            this.pause();
        });
        return;
    }

    /* ── IntersectionObserver for local videos ──────── */

    if ($localVideos.length) {
        var localObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var video = entry.target;

                if (entry.isIntersecting) {
                    video.play().catch(function () {});
                    updatePlayStopState($(video).closest('.rp-listing-video-wrapper'), true);
                } else {
                    if (!video.paused) {
                        video.pause();
                        updatePlayStopState($(video).closest('.rp-listing-video-wrapper'), false);
                    }
                }
            });
        }, {
            threshold: 0.25
        });

        $localVideos.each(function () {
            localObserver.observe(this);
        });
    }

    /* ── IntersectionObserver for external videos ──── */

    if ($externalWrappers.length) {
        var externalObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var $wrapper = $(entry.target);
                var $facade = $wrapper.find('.rp-listing-video-facade');
                var $iframe = $wrapper.find('iframe');

                if (entry.isIntersecting) {
                    if ($facade.length && $wrapper.data('embed-url')) {
                        activateExternalFacade($wrapper);
                    }
                    if ($iframe.length) {
                        postMessagePlay($iframe[0], $wrapper.data('video-provider'));
                        updatePlayStopState($wrapper, true);
                    }
                } else {
                    if ($iframe.length) {
                        postMessagePause($iframe[0], $wrapper.data('video-provider'));
                        updatePlayStopState($wrapper, false);
                    }
                }
            });
        }, {
            threshold: 0.25
        });

        $externalWrappers.each(function () {
            externalObserver.observe(this);
        });
    }

    /* ── Facade click handling ────────────────────── */

    $(document).on('click', '.rp-listing-video-facade, .rp-listing-play-btn', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $wrapper = $(this).closest('.rp-listing-video-wrapper');

        activateExternalFacade($wrapper);
    });

    function activateExternalFacade($wrapper) {
        var $facade = $wrapper.find('.rp-listing-video-facade');

        if (!$facade.length) {
            return;
        }

        var embedUrl = $wrapper.data('embed-url');

        if (!embedUrl) {
            return;
        }

        // Add enablejsapi with proper origin for YouTube postMessage control
        var provider = $wrapper.data('video-provider') || '';

        if (provider === 'youtube') {
            var sep = embedUrl.indexOf('?') !== -1 ? '&' : '?';

            embedUrl += sep + 'enablejsapi=1&origin=' + encodeURIComponent(window.location.origin);
        }

        var $iframe = $('<iframe/>', {
            src: embedUrl,
            'class': 'rp-listing-video-iframe',
            frameborder: '0',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowfullscreen: true
        });

        $facade.replaceWith($iframe);
        $wrapper.addClass('rp-listing-video-active');
        updatePlayStopState($wrapper, true);
    }

    /* ── Play/Stop button ─────────────────────────── */

    $(document).on('click', '.rp-listing-playstop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $wrapper = $(this).closest('.rp-listing-video-wrapper');
        var provider = $wrapper.data('video-provider') || 'local';

        if (provider === 'local') {
            var video = $wrapper.find('.rp-listing-video')[0];

            if (video) {
                if (video.paused) {
                    video.play().catch(function () {});
                    updatePlayStopState($wrapper, true);
                } else {
                    video.pause();
                    updatePlayStopState($wrapper, false);
                }
            }
        } else {
            var iframe = $wrapper.find('iframe')[0];

            if (iframe) {
                var isPlaying = $wrapper.hasClass('rp-listing-video-playing');

                if (isPlaying) {
                    postMessagePause(iframe, provider);
                    updatePlayStopState($wrapper, false);
                } else {
                    postMessagePlay(iframe, provider);
                    updatePlayStopState($wrapper, true);
                }
            }
        }
    });

    function updatePlayStopState($wrapper, isPlaying) {
        if (isPlaying) {
            $wrapper.addClass('rp-listing-video-playing');
            $wrapper.find('.rp-playstop-play').hide();
            $wrapper.find('.rp-playstop-pause').show();
        } else {
            $wrapper.removeClass('rp-listing-video-playing');
            $wrapper.find('.rp-playstop-play').show();
            $wrapper.find('.rp-playstop-pause').hide();
        }
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
            // Cross-origin errors
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
            // Cross-origin errors
        }
    }
});
