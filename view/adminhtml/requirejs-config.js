/**
 * Rollpix ProductGallery - Admin RequireJS Configuration
 *
 * Registers mixins to allow MP4 video uploads in the product media gallery.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */
var config = {
    config: {
        mixins: {
            'Magento_Backend/js/media-uploader': {
                'Rollpix_ProductGallery/js/media-uploader-mixin': true
            },
            'MagestyApps_WebImages/js/media-uploader': {
                'Rollpix_ProductGallery/js/media-uploader-mixin': true
            },
            'Magento_Ui/js/form/element/image-uploader': {
                'Rollpix_ProductGallery/js/image-uploader-mixin': true
            }
        }
    }
};
