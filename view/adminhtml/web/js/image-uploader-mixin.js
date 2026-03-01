/**
 * Rollpix ProductGallery - Image Uploader UI Component Mixin
 *
 * Adds MP4 to the allowed extensions in the Magento UI image uploader
 * component used in product forms.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */
define(function () {
    'use strict';

    return function (imageUploader) {
        return imageUploader.extend({
            initialize: function () {
                this._super();

                if (typeof this.allowedExtensions === 'string' &&
                    this.allowedExtensions.indexOf('mp4') === -1
                ) {
                    this.allowedExtensions += ' mp4';
                }
            }
        });
    };
});
