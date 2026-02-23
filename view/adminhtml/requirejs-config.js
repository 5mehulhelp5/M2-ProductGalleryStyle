/**
 * Rollpix ProductGallery - Admin RequireJS Configuration
 *
 * Registers mixins to extend Magento_ProductVideo for local MP4 video uploads.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */
var config = {
    config: {
        mixins: {
            'Magento_ProductVideo/js/new-video-dialog': {
                'Rollpix_ProductGallery/js/new-video-dialog-mixin': true
            },
            'Magento_ProductVideo/js/get-video-information': {
                'Rollpix_ProductGallery/js/get-video-information-mixin': true
            }
        }
    }
};
