/**
 * Rollpix ProductGallery - Listing Page Effects Component
 *
 * Handles shimmer loading effects for product images on category listing pages
 * and product widgets. Marks items as loaded when their images/videos finish loading.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */
define([
    'jquery',
    'domReady!'
], function ($) {
    'use strict';

    var $shimmerItems = $('.rp-listing-shimmer');

    if (!$shimmerItems.length) {
        return;
    }

    var FALLBACK_TIMEOUT = 4000;

    $shimmerItems.each(function () {
        var $item = $(this);

        initShimmerItem($item);
    });

    function initShimmerItem($item) {
        var img = $item.find('img')[0];
        var video = $item.find('video')[0];
        var iframe = $item.find('iframe')[0];

        if (img) {
            if (img.complete && img.naturalWidth > 0) {
                markLoaded($item);
                return;
            }
            $(img).on('load.rpshimmer', function () {
                markLoaded($item);
            }).on('error.rpshimmer', function () {
                markLoaded($item);
            });
        } else if (video) {
            if (video.readyState >= 2) {
                markLoaded($item);
                return;
            }
            $(video).on('loadeddata.rpshimmer canplay.rpshimmer', function () {
                markLoaded($item);
            }).on('error.rpshimmer', function () {
                markLoaded($item);
            });
        } else if (iframe) {
            $(iframe).on('load.rpshimmer', function () {
                markLoaded($item);
            });
        }

        // Fallback: mark as loaded after timeout
        setTimeout(function () {
            markLoaded($item);
        }, FALLBACK_TIMEOUT);
    }

    function markLoaded($item) {
        if (!$item.hasClass('rp-loaded')) {
            $item.addClass('rp-loaded');
        }
    }

    // Also observe for dynamically added shimmer items (AJAX-loaded listings)
    if ('MutationObserver' in window) {
        var bodyObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes.length) {
                    $(mutation.addedNodes).find('.rp-listing-shimmer').addBack('.rp-listing-shimmer').each(function () {
                        var $item = $(this);

                        if (!$item.hasClass('rp-loaded')) {
                            initShimmerItem($item);
                        }
                    });
                }
            });
        });

        bodyObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
});
