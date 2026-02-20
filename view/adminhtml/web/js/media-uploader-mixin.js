/**
 * Rollpix ProductGallery - Media Uploader Mixin
 *
 * Extends the admin media uploader widget to allow MP4 video uploads.
 *
 * Strategy 1 (preferred): Proxy on window.Uppy to intercept the constructor
 *   and bypass the onBeforeFileAdded extension check for video files.
 *
 * Strategy 2 (fallback): If window.Uppy is frozen/non-writable, permanently
 *   patch $.inArray so that 'mp4' passes the allowedExt check. The Compressor
 *   plugin will attempt to process the video but fail gracefully, and the
 *   original file is uploaded as-is.
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

                    // ── Strategy 1: Proxy on window.Uppy namespace ──
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
                        // window.Uppy is frozen or non-writable — fall through
                    }

                    // ── Strategy 2: Patch $.inArray as fallback ──
                    if (!proxyApplied && !$.inArray._rpVideoPatched) {
                        var origInArray = $.inArray;

                        $.inArray = function (elem, arr, fromIndex) {
                            // Allow mp4 through the allowedExt check (arrays that contain 'jpg')
                            if (typeof elem === 'string' &&
                                elem.toLowerCase() === 'mp4' &&
                                Array.isArray(arr) &&
                                origInArray.call($, 'jpg', arr) !== -1
                            ) {
                                return 0;
                            }

                            return origInArray.apply($, arguments);
                        };

                        $.inArray._rpVideoPatched = true;
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
