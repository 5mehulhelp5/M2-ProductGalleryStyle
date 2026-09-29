/**
 * Rollpix ProductGallery - Sticky Scroll Component
 *
 * Scroll-direction-aware sticky for the column chosen in
 * Sticky Element (info panel or image gallery). The panel starts
 * fixed at the top offset. When it is taller than the viewport,
 * scrolling down gradually reveals its lower part and scrolling up
 * brings the top back, so no part of it is ever unreachable.
 *
 * The `position: sticky` itself comes from CSS; this only adjusts `top`.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */
define([
    'jquery',
    'domReady!'
], function ($) {
    'use strict';

    var TARGET_GALLERY = 'gallery',
        DESKTOP_QUERY = '(min-width: 768px)',
        DEFAULT_OFFSET = 20,
        BOTTOM_MARGIN = 20;

    return function (config, element) {
        var sticky = config.sticky || {},
            stickyOffset = typeof sticky.offset === 'number' ? sticky.offset : DEFAULT_OFFSET,
            $element = $(element),
            $wrapper = $element.closest('.rp-product-wrapper'),
            $panel,
            desktop = window.matchMedia(DESKTOP_QUERY),
            lastScrollTop = window.pageYOffset,
            currentTop = stickyOffset,
            ticking = false;

        if (!$wrapper.length) {
            $wrapper = $element;
        }

        $panel = sticky.target === TARGET_GALLERY
            ? $element
            : $wrapper.find('.product-info-main');

        if (!$panel.length) {
            return;
        }

        function setTop(value) {
            $panel.css('top', Math.round(value) + 'px');
        }

        function handleScroll() {
            var scrollTop = window.pageYOffset,
                panelHeight,
                viewportHeight,
                scrollDelta;

            if (!desktop.matches) {
                $panel.css('top', '');
                lastScrollTop = scrollTop;
                return;
            }

            panelHeight = $panel.outerHeight();
            viewportHeight = window.innerHeight;

            // Panel fits in viewport - simple sticky at top
            if (panelHeight <= viewportHeight - stickyOffset) {
                currentTop = stickyOffset;
                setTop(currentTop);
                lastScrollTop = scrollTop;
                return;
            }

            // Not sticky yet - keep at top
            if ($wrapper[0].getBoundingClientRect().top >= stickyOffset) {
                currentTop = stickyOffset;
                setTop(currentTop);
                lastScrollTop = scrollTop;
                return;
            }

            scrollDelta = scrollTop - lastScrollTop;
            currentTop = Math.max(
                viewportHeight - panelHeight - BOTTOM_MARGIN,
                Math.min(stickyOffset, currentTop - scrollDelta)
            );

            setTop(currentTop);
            lastScrollTop = scrollTop;
        }

        function schedule() {
            if (!ticking) {
                requestAnimationFrame(function () {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', schedule, { passive: true });

        $(window).on('resize.rpsticky', function () {
            currentTop = stickyOffset;
            schedule();
        });

        // Height changes (images loading, tabs opening, swatch switches).
        // ResizeObserver avoids reacting to the slider's constant
        // transform/attribute mutations.
        if (typeof window.ResizeObserver === 'function') {
            new window.ResizeObserver(schedule).observe($panel[0]);
        } else {
            new MutationObserver(schedule).observe($panel[0], {
                childList: true,
                subtree: true
            });
        }

        handleScroll();
    };
});
