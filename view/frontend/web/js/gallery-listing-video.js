/**
 * Rollpix ProductGallery - Listing Page Video Component
 *
 * Handles autoplay/pause of videos on category listing pages
 * using IntersectionObserver for performance.
 *
 * Self-initializing: scans for .rp-listing-video elements on DOM ready.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */
define([
    'jquery',
    'domReady!'
], function ($) {
    'use strict';

    var $videos = $('.rp-listing-video');

    if (!$videos.length) {
        return;
    }

    if (!('IntersectionObserver' in window)) {
        return;
    }

    var prefersReducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        // Pause all listing videos if user prefers reduced motion
        $videos.each(function () {
            this.pause();
        });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            var video = entry.target;

            if (entry.isIntersecting) {
                video.play().catch(function () {});
            } else {
                if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, {
        threshold: 0.25
    });

    $videos.each(function () {
        observer.observe(this);
    });
});
