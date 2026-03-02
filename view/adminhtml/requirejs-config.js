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
            },
            'Magento_Backend/js/media-uploader': {
                'Rollpix_ProductGallery/js/media-uploader-mixin': true
            },
            'Magento_Ui/js/form/element/image-uploader': {
                'Rollpix_ProductGallery/js/image-uploader-mixin': true
            }
        }
    }
};
