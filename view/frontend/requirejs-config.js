/**
 * Rollpix ProductGallery RequireJS Configuration
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */
var config = {
    map: {
        '*': {
            'rpGalleryZoom': 'Rollpix_ProductGallery/js/gallery-zoom',
            'rpGalleryCarousel': 'Rollpix_ProductGallery/js/gallery-carousel',
            'rpStickyScroll': 'Rollpix_ProductGallery/js/gallery-sticky',
            'rpGalleryTabs': 'Rollpix_ProductGallery/js/gallery-tabs',
            'rpGalleryEffects': 'Rollpix_ProductGallery/js/gallery-effects',
            'rpGalleryThumbnails': 'Rollpix_ProductGallery/js/gallery-thumbnails',
            'rpGallerySlider': 'Rollpix_ProductGallery/js/gallery-slider',
            'rpGalleryModalZoom': 'Rollpix_ProductGallery/js/gallery-modal-zoom',
            'rpGalleryCarouselZoom': 'Rollpix_ProductGallery/js/gallery-carousel-zoom',
            'rpGalleryVideo': 'Rollpix_ProductGallery/js/gallery-video',
            'rpGalleryListingVideo': 'Rollpix_ProductGallery/js/gallery-listing-video',
            'rpGalleryListingEffects': 'Rollpix_ProductGallery/js/gallery-listing-effects'
        }
    },
    config: {
        mixins: {
            'Magento_ProductVideo/js/load-player': {
                'Rollpix_ProductGallery/js/load-player-mixin': true
            },
            'Magento_ProductVideo/js/fotorama-add-video-events': {
                'Rollpix_ProductGallery/js/fotorama-add-video-events-mixin': true
            }
        }
    }
};
