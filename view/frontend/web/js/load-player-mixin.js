/**
 * Rollpix ProductGallery - Mixin for Magento_ProductVideo/js/load-player
 *
 * Adds a 'local' video player type to the productVideoLoader dispatcher.
 * When data-type="local", renders a native HTML5 <video> element
 * instead of a YouTube or Vimeo iframe.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */
define(['jquery'], function ($) {
    'use strict';

    return function () {

        /* ── videoLocal widget ──────────────────────────── */

        $.widget('mage.videoLocal', $.mage.productVideoLoader, {

            /**
             * Create a native HTML5 video player.
             * data-code contains the video URL (path to the MP4 file).
             */
            _create: function () {
                this._initialize();

                var videoUrl = this._code,
                    $video = $('<video/>', {
                        'controls': true,
                        'playsinline': '',
                        'preload': 'metadata',
                        'class': 'product-video-local',
                        'css': {
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                        }
                    });

                if (this._autoplay) {
                    $video.attr({'autoplay': '', 'muted': ''});
                }
                if (this._loop) {
                    $video.attr('loop', '');
                }

                $video.append($('<source/>', {
                    src: videoUrl,
                    type: 'video/mp4'
                }));

                this.element.empty().append($video);

                this.element.closest('.fotorama__stage__frame')
                    .addClass('fotorama__product-video--loaded');
            },

            play: function () {
                var video = this.element.find('video')[0];

                if (video) {
                    video.play();
                }
            },

            pause: function () {
                var video = this.element.find('video')[0];

                if (video) {
                    video.pause();
                }
            },

            stop: function () {
                var video = this.element.find('video')[0];

                if (video) {
                    video.pause();
                    video.currentTime = 0;
                }
            },

            playing: function () {
                var video = this.element.find('video')[0];

                return video ? !video.paused : false;
            }
        });

        /* ── extend productVideoLoader dispatcher ──────── */

        $.widget('mage.productVideoLoader', $.mage.productVideoLoader, {
            _create: function () {
                if (this.element.data('type') === 'local') {
                    this.element.videoLocal();
                    this._player = this.element.data('mageVideoLocal');
                } else {
                    this._super();
                }
            }
        });

        return $.mage.productVideoLoader;
    };
});
