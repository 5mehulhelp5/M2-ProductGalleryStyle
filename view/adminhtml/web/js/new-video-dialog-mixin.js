/**
 * Rollpix ProductGallery - Mixin for Magento_ProductVideo/js/new-video-dialog
 *
 * Extends the newVideoDialog widget to support local MP4 video uploads.
 * Adds a toggle between "URL" (YouTube/Vimeo) and "Upload Local" modes.
 * Local videos are stored with media_type='external-video' and provider='local'.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */
define(['jquery', 'mage/translate'], function ($) {
    'use strict';

    return function (originalWidget) {
        $.widget('mage.newVideoDialog', $.mage.newVideoDialog, {

            /* ── state ─────────────────────────────────────── */
            _isLocalVideoMode: false,
            _localVideoUploadResult: null,

            /* ── selectors ─────────────────────────────────── */
            _localVideoFieldSelector: '.rp-local-video-field',
            _localVideoFileSelector: '#rp_video_file',
            _localVideoStatusSelector: '.rp-video-upload-status',

            /* ── lifecycle ─────────────────────────────────── */

            _create: function () {
                this._super();
                this._initLocalVideoUI();
            },

            /**
             * Build the toggle buttons and file input, insert them into the dialog form.
             */
            _initLocalVideoUI: function () {
                var urlField = this.element.find(this._videoUrlSelector).closest('.admin__field'),
                    self = this;

                if (!urlField.length) {
                    urlField = this.element.find('[name="video_url"]').closest('.field');
                }

                /* Source toggle ------------------------------------------------ */
                var toggleHtml =
                    '<div class="rp-video-source-toggle admin__field">' +
                        '<label class="admin__field-label"><span>' +
                            $.mage.__('Video Source') +
                        '</span></label>' +
                        '<div class="admin__field-control">' +
                            '<button type="button" class="rp-toggle-url action-default _active" ' +
                                'data-mode="url">' + $.mage.__('URL') + '</button> ' +
                            '<button type="button" class="rp-toggle-local action-default" ' +
                                'data-mode="local">' + $.mage.__('Upload Local') + '</button>' +
                        '</div>' +
                    '</div>';

                /* File input -------------------------------------------------- */
                var fileFieldHtml =
                    '<div class="rp-local-video-field admin__field" style="display:none;">' +
                        '<label class="admin__field-label"><span>' +
                            $.mage.__('Video File (MP4)') +
                        '</span></label>' +
                        '<div class="admin__field-control">' +
                            '<input type="file" id="rp_video_file" ' +
                                'accept="video/mp4" class="admin__control-file"/>' +
                            '<div class="rp-video-upload-status"></div>' +
                        '</div>' +
                    '</div>';

                /* Hidden provider field --------------------------------------- */
                var providerHtml =
                    '<input type="hidden" name="video_provider" value=""/>';

                urlField.before(toggleHtml + fileFieldHtml + providerHtml);

                /* Bind events ------------------------------------------------- */
                this.element.find('.rp-toggle-url, .rp-toggle-local').on('click', function () {
                    self._switchVideoMode($(this).data('mode'));
                });

                this.element.find(this._localVideoFileSelector)
                    .on('change', $.proxy(this._onLocalFileSelected, this));
            },

            /* ── mode switching ─────────────────────────────── */

            /**
             * Switch between URL and Local upload modes.
             * @param {String} mode - 'url' or 'local'
             */
            _switchVideoMode: function (mode) {
                var urlField = this.element.find(this._videoUrlSelector).closest('.admin__field, .field'),
                    getInfoBtn = this.element.find(this._videoInformationBtnSelector).closest('.admin__field, .field'),
                    localField = this.element.find(this._localVideoFieldSelector);

                this.element.find('.rp-toggle-url, .rp-toggle-local').removeClass('_active');
                this.element.find('.rp-toggle-' + mode).addClass('_active');

                if (mode === 'local') {
                    this._isLocalVideoMode = true;
                    urlField.hide();
                    getInfoBtn.hide();
                    localField.show();

                    // Remove required validation from URL field
                    this.element.find(this._videoUrlSelector)
                        .removeClass('required-entry _required')
                        .removeAttr('data-validate');

                    this.element.find('[name="video_provider"]').val('local');
                } else {
                    this._isLocalVideoMode = false;
                    urlField.show();
                    getInfoBtn.show();
                    localField.hide();

                    this.element.find(this._videoUrlSelector)
                        .addClass('required-entry _required');

                    this.element.find('[name="video_provider"]').val('');
                }
            },

            /* ── local file handling ────────────────────────── */

            /**
             * Handle file selection - upload the MP4 to the server.
             */
            _onLocalFileSelected: function () {
                var fileInput = this.element.find(this._localVideoFileSelector)[0],
                    statusEl = this.element.find(this._localVideoStatusSelector),
                    self = this,
                    file, formData, uploadUrl;

                if (!fileInput.files || !fileInput.files.length) {
                    return;
                }

                file = fileInput.files[0];

                if (file.type !== 'video/mp4') {
                    statusEl.html(
                        '<span class="message message-error">' +
                        $.mage.__('Only MP4 video files are allowed.') +
                        '</span>'
                    );
                    return;
                }

                statusEl.html(
                    '<span class="message message-notice">' +
                    $.mage.__('Uploading…') +
                    '</span>'
                );
                this._blockActionButtons(true);

                formData = new FormData();
                formData.append('video_file', file);
                formData.append('form_key', window.FORM_KEY);

                uploadUrl = this._getLocalVideoUploadUrl();

                $.ajax({
                    url: uploadUrl,
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    dataType: 'json',
                    success: function (result) {
                        if (result.error) {
                            statusEl.html(
                                '<span class="message message-error">' + result.error + '</span>'
                            );
                            self._blockActionButtons(false);
                            return;
                        }

                        self._localVideoUploadResult = result;

                        // Fill video_url with the public URL of the uploaded file
                        self.element.find(self._videoUrlSelector).val(result.url);

                        statusEl.html(
                            '<span class="message message-success">' +
                            $.mage.__('Uploaded: ') + file.name +
                            '</span>'
                        );
                        self._blockActionButtons(false);
                    },
                    error: function () {
                        statusEl.html(
                            '<span class="message message-error">' +
                            $.mage.__('Upload failed. Please try again.') +
                            '</span>'
                        );
                        self._blockActionButtons(false);
                    }
                });
            },

            /**
             * Build the upload URL by deriving from the existing saveVideoUrl option.
             * saveVideoUrl = admin_base/catalog/product_gallery/upload/key/xxx/
             */
            _getLocalVideoUploadUrl: function () {
                var saveUrl = this.options.saveVideoUrl || '';

                return saveUrl.replace(
                    'catalog/product_gallery/upload',
                    'rollpix_gallery/product_video/upload'
                );
            },

            /* ── overrides for save flow ────────────────────── */

            /**
             * Override _onCreate to handle local video save.
             * Uses the video upload result as the gallery entry file.
             */
            _onCreate: function () {
                if (!this._isLocalVideoMode) {
                    return this._super();
                }

                if (!this._localVideoUploadResult) {
                    this.element.find(this._localVideoStatusSelector).html(
                        '<span class="message message-error">' +
                        $.mage.__('Please upload a video file first.') +
                        '</span>'
                    );
                    return;
                }

                this.isValid($.proxy(function (isValid) {
                    if (!isValid) {
                        return;
                    }

                    // Use the video upload result directly as the gallery entry.
                    // _onImageLoaded will set media_type='external-video' and merge
                    // form fields (video_url, video_title, video_description, video_provider).
                    this._onImageLoaded(
                        this._localVideoUploadResult,
                        null,
                        null,
                        $.proxy(this.close, this)
                    );
                }, this));
            },

            /**
             * Override isValid to skip URL validation for local videos.
             */
            isValid: function (callback) {
                if (!this._isLocalVideoMode) {
                    return this._super(callback);
                }

                var videoForm = this.element.find(this._videoFormSelector);

                this._blockActionButtons(true);

                videoForm.mage('validation', {
                    errorPlacement: function (error, element) {
                        error.insertAfter(element);
                    }
                }).on('highlight.validate', function () {
                    $(this).validation('option');
                });

                videoForm.validation();

                this._blockActionButtons(false);

                callback(videoForm.valid());
            },

            /* ── overrides for dialog lifecycle ─────────────── */

            /**
             * Override _onClose to reset local video state.
             */
            _onClose: function () {
                this._super();
                this._isLocalVideoMode = false;
                this._localVideoUploadResult = null;

                // Reset UI to URL mode
                this._switchVideoMode('url');

                // Clear file input and status
                var fileInput = this.element.find(this._localVideoFileSelector);

                if (fileInput.length) {
                    fileInput.val('');
                }
                this.element.find(this._localVideoStatusSelector).html('');
            },

            /**
             * Override _onOpenDialog to detect existing local videos
             * and switch to local mode automatically.
             */
            _onOpenDialog: function (e, imageData) {
                this._super(e, imageData);

                if (imageData && imageData['media_type'] === 'external-video') {
                    var provider = imageData.video_provider || '';

                    if (provider === 'local') {
                        this._switchVideoMode('local');

                        this.element.find(this._localVideoStatusSelector).html(
                            '<span class="message message-success">' +
                            $.mage.__('Local video file') +
                            '</span>'
                        );

                        // Restore upload result from existing data
                        this._localVideoUploadResult = {
                            file: imageData.file,
                            url: imageData.video_url || ''
                        };
                    }
                }
            }
        });

        return $.mage.newVideoDialog;
    };
});
