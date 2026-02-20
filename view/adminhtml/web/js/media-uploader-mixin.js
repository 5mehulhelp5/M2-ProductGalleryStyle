/**
 * Rollpix ProductGallery - Media Uploader Mixin
 *
 * Extends the admin media uploader widget to allow MP4 video uploads.
 * Uses a Proxy on window.Uppy to intercept the Uppy constructor
 * (which is a read-only getter) and bypass the file extension check
 * for video files while keeping allowedResize=false so the Compressor
 * plugin skips them.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

/*global byteConvert*/
define([
    'jquery',
    'mage/template',
    'mage/translate'
], function ($, mageTemplate) {
    'use strict';

    var videoExtensions = ['mp4'];

    return function (widget) {
        $.widget('mage.mediaUploader', widget, {

            _create: function () {
                var widgetElement = this.element,
                    origUppyNamespace = window.Uppy,
                    proxyApplied = false;

                if (origUppyNamespace && origUppyNamespace.Uppy) {
                    var origUppyClass = origUppyNamespace.Uppy,
                        progressTmpl = mageTemplate('[data-template="uploader"]');

                    try {
                        window.Uppy = new Proxy(origUppyNamespace, {
                            get: function (target, prop) {
                                if (prop === 'Uppy') {
                                    var wrapper = function (opts) {
                                        if (opts && typeof opts.onBeforeFileAdded === 'function') {
                                            var origCallback = opts.onBeforeFileAdded;

                                            opts.onBeforeFileAdded = function (currentFile) {
                                                var ext = currentFile.extension
                                                    ? currentFile.extension.toLowerCase()
                                                    : '';

                                                if (videoExtensions.indexOf(ext) !== -1) {
                                                    var fileSize = typeof currentFile.size === 'undefined'
                                                        ? $.mage.__('We could not detect a size.')
                                                        : byteConvert(currentFile.size);

                                                    var fileId = Math.random().toString(33).substr(2, 18);

                                                    var tmpl = progressTmpl({
                                                        data: {
                                                            name: currentFile.name,
                                                            size: fileSize,
                                                            id: fileId
                                                        }
                                                    });

                                                    var modifiedFile = Object.assign({}, currentFile, {
                                                        id: currentFile.id + '-' + fileId,
                                                        tempFileId: fileId
                                                    });

                                                    $(tmpl).appendTo(widgetElement);

                                                    return modifiedFile;
                                                }

                                                return origCallback(currentFile);
                                            };
                                        }

                                        return new origUppyClass(opts);
                                    };

                                    wrapper.prototype = origUppyClass.prototype;

                                    return wrapper;
                                }

                                return target[prop];
                            }
                        });

                        proxyApplied = true;
                    } catch (e) {
                        // Proxy not available or window.Uppy not writable
                    }
                }

                this._super();

                if (proxyApplied) {
                    window.Uppy = origUppyNamespace;
                }
            }
        });

        return $.mage.mediaUploader;
    };
});
