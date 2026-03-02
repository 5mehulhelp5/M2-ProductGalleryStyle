/**
 * Rollpix ProductGallery - Mixin for Magento_ProductVideo/js/fotorama-add-video-events
 *
 * Extends AddFotoramaVideoEvents to recognize local MP4 videos.
 * The module-level parseURL() function only matches YouTube/Vimeo,
 * so local video entries end up with empty id/provider.
 * This mixin post-processes the result to fix local video data.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */
define(['jquery'], function ($) {
    'use strict';

    return function () {
        $.widget('mage.AddFotoramaVideoEvents', $.mage.AddFotoramaVideoEvents, {

            /**
             * Override _createVideoData to detect local video entries.
             *
             * After the parent runs parseURL() (which returns false for local URLs),
             * local entries have id=undefined and provider=undefined but videoUrl set.
             * We detect these and fill in the correct values.
             */
            _createVideoData: function (inputData, isJSON) {
                var result = this._super(inputData, isJSON),
                    i, url;

                for (i = 0; i < result.length; i++) {
                    if (!result[i].id && result[i].videoUrl) {
                        url = result[i].videoUrl.toLowerCase();

                        if (url.indexOf('.mp4') !== -1) {
                            result[i].id = result[i].videoUrl;
                            result[i].provider = 'local';
                            result[i].mediaType = this.VID;
                        }
                    }
                }

                return result;
            }
        });

        return $.mage.AddFotoramaVideoEvents;
    };
});
