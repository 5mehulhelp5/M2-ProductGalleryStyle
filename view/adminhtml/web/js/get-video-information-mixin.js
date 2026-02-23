/**
 * Rollpix ProductGallery - Mixin for Magento_ProductVideo/js/get-video-information
 *
 * Extends the videoData widget to recognize local video file URLs
 * in addition to YouTube and Vimeo URLs.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */
define(['jquery', 'mage/translate'], function ($) {
    'use strict';

    return function () {
        $.widget('mage.videoData', $.mage.videoData, {

            /**
             * Override _validateURL to recognize local video paths.
             * Local videos are identified by .mp4 extension in the URL.
             */
            _validateURL: function (href, forceVideo) {
                if (typeof href === 'string' && href.length > 4) {
                    var lower = href.toLowerCase();

                    if (lower.lastIndexOf('.mp4') === lower.length - 4 ||
                        lower.indexOf('/media/catalog/') !== -1 && lower.indexOf('.mp4') !== -1
                    ) {
                        return {
                            id: href,
                            type: 'local',
                            s: '',
                            useYoutubeNocookie: false
                        };
                    }
                }

                return this._super(href, forceVideo);
            },

            /**
             * Override _onRequestHandler to skip API calls for local videos.
             * Fires the success event immediately with minimal metadata.
             */
            _onRequestHandler: function () {
                var url = this.element.val(),
                    videoInfo;

                if (this._currentVideoUrl === url) {
                    return;
                }

                videoInfo = this._validateURL(url);

                if (videoInfo && videoInfo.type === 'local') {
                    this._currentVideoUrl = url;

                    this.element.trigger(this._REQUEST_VIDEO_INFORMATION_TRIGGER, {
                        url: url
                    });

                    var respData = {
                        duration: '',
                        channel: '',
                        channelId: '',
                        uploaded: '',
                        title: '',
                        description: '',
                        thumbnail: '',
                        videoId: url,
                        videoProvider: 'local',
                        useYoutubeNocookie: false
                    };

                    this._videoInformation = respData;
                    this.element.trigger(this._UPDATE_VIDEO_INFORMATION_TRIGGER, respData);
                    this.element.trigger(this._FINISH_UPDATE_INFORMATION_TRIGGER, true);

                    return;
                }

                this._super();
            }
        });

        return $.mage.videoData;
    };
});
