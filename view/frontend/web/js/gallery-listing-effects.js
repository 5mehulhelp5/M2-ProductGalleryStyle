/**
 * Rollpix ProductGallery - Listing Page Effects Component
 *
 * Saca el shimmer de las cards cuya imagen/video terminó de cargar.
 *
 * IMPORTANTE: el camino principal para las imágenes del render
 * inicial NO es este módulo, sino el script inline de
 * `product/listing/shimmer-critical.phtml`, que corre desde el <head> sin
 * esperar a RequireJS. Este módulo cubre únicamente el contenido que entra
 * DESPUÉS: paginación AJAX de Amasty Shopby, cambios de swatch, widgets
 * lazy. Si se toca uno, revisar el otro — comparten la clase `rp-loaded`.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */
define([
    'jquery',
    'domReady!'
], function ($) {
    'use strict';

    var FALLBACK_TIMEOUT = 4000;
    var LOADED_CLASS = 'rp-loaded';
    // Flag en el nodo DOM (no jQuery.data) para que sobreviva a los clones
    // que hacen algunos sliders y para poder chequearlo sin envolver en $().
    var INIT_FLAG = 'rpShimmerInit';

    function markLoaded(el) {
        if (el && el.classList && !el.classList.contains(LOADED_CLASS)) {
            el.classList.add(LOADED_CLASS);
        }
    }

    /**
     * @param {HTMLElement} el contenedor `.rp-listing-shimmer`
     */
    function initShimmerItem(el) {
        // Guard de re-entrada: el MutationObserver dispara muchas veces sobre
        // el mismo nodo mientras su imagen sigue cargando. Sin esto se apilan
        // handlers `load` y un setTimeout de 4s por cada disparo — en un
        // listado con paginación AJAX eso son cientos de timers vivos.
        if (el[INIT_FLAG]) { return; }
        el[INIT_FLAG] = true;

        if (el.classList.contains(LOADED_CLASS)) { return; }

        var media = el.querySelector('img, video, iframe');

        if (!media) {
            // Sin media que esperar: no dejar la card animando para siempre.
            markLoaded(el);
            return;
        }

        if (media.tagName === 'IMG') {
            if (media.complete && media.naturalWidth > 0) {
                markLoaded(el);
                return;
            }
        } else if (media.tagName === 'VIDEO' && media.readyState >= 2) {
            markLoaded(el);
            return;
        }

        var done = function () { markLoaded(el); };

        $(media)
            .on('load.rpshimmer loadeddata.rpshimmer canplay.rpshimmer', done)
            .on('error.rpshimmer', done);

        // Red de seguridad: media que nunca dispara load (iframe bloqueado por
        // CSP, video sin poster, red caída) no puede dejar la card tapada.
        setTimeout(done, FALLBACK_TIMEOUT);
    }

    function scan(root) {
        var nodes = (root || document).querySelectorAll('.rp-listing-shimmer');

        for (var i = 0; i < nodes.length; i++) {
            initShimmerItem(nodes[i]);
        }
    }

    scan(document);

    // Contenido inyectado por AJAX. El observer se mantiene vivo porque la
    // paginación puede ocurrir en cualquier momento, pero el trabajo real está
    // detrás del guard de INIT_FLAG y de un rAF que agrupa ráfagas de
    // mutaciones en un solo scan.
    if ('MutationObserver' in window) {
        var pending = false;

        var flush = function () {
            pending = false;
            scan(document);
        };

        var observer = new MutationObserver(function (mutations) {
            if (pending) { return; }

            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].addedNodes.length) {
                    pending = true;
                    if (window.requestAnimationFrame) {
                        requestAnimationFrame(flush);
                    } else {
                        setTimeout(flush, 16);
                    }
                    return;
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
});
