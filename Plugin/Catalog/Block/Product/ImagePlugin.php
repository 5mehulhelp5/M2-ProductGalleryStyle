<?php
/**
 * Rollpix ProductGallery - Plugin to swap img for video on product listing pages
 *
 * Replaces product image HTML with video elements on category listing pages.
 * Supports local MP4, YouTube, and Vimeo videos.
 * Also wraps images in shimmer containers when the shimmer effect is enabled.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Plugin\Catalog\Block\Product;

use Magento\Catalog\Block\Product\Image as ImageBlock;
use Rollpix\ProductGallery\Model\Config;
use Rollpix\ProductGallery\Model\VideoUrlParser;

class ImagePlugin
{
    private Config $config;
    private VideoUrlParser $videoUrlParser;

    public function __construct(
        Config $config,
        VideoUrlParser $videoUrlParser
    ) {
        $this->config = $config;
        $this->videoUrlParser = $videoUrlParser;
    }

    /**
     * After toHtml: replace <img> with video when product has video data.
     * Also wraps all listing images in shimmer container when enabled.
     */
    public function afterToHtml(ImageBlock $subject, string $result): string
    {
        $videoHtml = $this->getVideoHtml($subject, $result);
        $html = $videoHtml ?: $result;

        // Shimmer wrapper for all listing images (handled in Fase 4)
        if ($this->config->isShimmerEnabled()) {
            $html = '<div class="rp-listing-shimmer">' . $html . '</div>';
        }

        return $html;
    }

    /**
     * Attempt to render video HTML. Returns null if no video applies.
     */
    private function getVideoHtml(ImageBlock $subject, string $result): ?string
    {
        if (!$this->config->isVideoEnabled() || !$this->config->isVideoListingEnabled()) {
            return null;
        }

        // 1. Check if the image URL itself is an MP4 (existing behavior)
        $imagePath = $subject->getData('image_url') ?: '';
        if ($this->isVideoUrl($imagePath)) {
            return $this->buildLocalVideoHtml($imagePath, $subject);
        }

        // Fallback: check if the rendered HTML contains a video file reference
        if (preg_match('/\.mp4["\'\s?#]/', $result)) {
            return $this->buildLocalVideoHtml($imagePath, $subject);
        }

        // 2. Check pre-loaded video data from the observer (YouTube/Vimeo/MP4 from gallery)
        $product = $subject->getData('rp_product');
        if (!$product) {
            return null;
        }

        $videoData = $product->getData('rp_listing_video');
        if (!$videoData || !is_array($videoData)) {
            return null;
        }

        $provider = $videoData['provider'] ?? '';
        $videoUrl = $videoData['video_url'] ?? '';
        $thumbnail = $videoData['thumbnail'] ?? '';

        if (empty($videoUrl) || empty($provider)) {
            return null;
        }

        if ($provider === 'local') {
            return $this->buildLocalVideoHtml($videoUrl, $subject);
        }

        // YouTube or Vimeo
        return $this->buildExternalVideoHtml($videoUrl, $provider, $thumbnail, $subject);
    }

    /**
     * Build HTML5 <video> for local MP4 files.
     */
    private function buildLocalVideoHtml(string $videoUrl, ImageBlock $subject): string
    {
        $attrs = [];

        if ($this->config->isListingAutoplay()) {
            $attrs[] = 'autoplay';
        }
        if ($this->config->isVideoLoop()) {
            $attrs[] = 'loop';
        }
        if ($this->config->isVideoMuted()) {
            $attrs[] = 'muted';
        }

        $attrs[] = 'playsinline';
        $attrs[] = 'preload="metadata"';

        $objectFit = $this->config->getListingObjectFit();
        $attrsStr = implode(' ', $attrs);
        $width = $subject->getWidth() ?: '';
        $height = $subject->getHeight() ?: '';

        $html = '<div class="rp-listing-video-wrapper" data-video-provider="local">'
            . '<video ' . $attrsStr
            . ' class="rp-listing-video"'
            . ' style="width:100%;height:auto;object-fit:' . htmlspecialchars($objectFit) . ';"'
            . ($width ? ' width="' . (int)$width . '"' : '')
            . ($height ? ' height="' . (int)$height . '"' : '')
            . '>'
            . '<source src="' . htmlspecialchars($videoUrl) . '" type="video/mp4"/>'
            . '</video>';

        if ($this->config->isListingControlsEnabled()) {
            $html .= $this->buildPlayStopButton();
        }

        $html .= '</div>';

        return $html;
    }

    /**
     * Build iframe facade HTML for YouTube/Vimeo videos.
     */
    private function buildExternalVideoHtml(
        string $videoUrl,
        string $provider,
        string $thumbnailUrl,
        ImageBlock $subject
    ): string {
        $parsed = $this->videoUrlParser->parse($videoUrl);
        if (!$parsed) {
            return '';
        }

        $params = $this->videoUrlParser->buildEmbedParams(
            $parsed['provider'],
            $this->config->isListingAutoplay(),
            $this->config->isVideoMuted(),
            $this->config->isVideoLoop(),
            false, // no native controls for external videos in listing
            $parsed['id']
        );

        $embedUrl = $this->videoUrlParser->getEmbedUrl($parsed['provider'], $parsed['id'], $params);
        $objectFit = $this->config->getListingObjectFit();

        $html = '<div class="rp-listing-video-wrapper rp-listing-video-external"'
            . ' data-video-provider="' . htmlspecialchars($provider) . '"'
            . ' data-embed-url="' . htmlspecialchars($embedUrl) . '">';

        if (!empty($thumbnailUrl)) {
            // Facade: show thumbnail with play button, JS loads iframe
            $html .= '<div class="rp-listing-video-facade"'
                . ' style="background-image: url(\'' . htmlspecialchars($thumbnailUrl) . '\')">'
                . '<button class="rp-listing-play-btn" type="button" aria-label="Play video">'
                . '<svg width="48" height="34" viewBox="0 0 68 48">'
                . '<path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#212121" fill-opacity="0.8"/>'
                . '<path d="M 45,24 27,14 27,34" fill="#fff"/>'
                . '</svg>'
                . '</button>'
                . '</div>';
        } else {
            // No thumbnail, load iframe directly
            $html .= '<iframe src="' . htmlspecialchars($embedUrl) . '"'
                . ' class="rp-listing-video-iframe"'
                . ' frameborder="0"'
                . ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"'
                . ' allowfullscreen'
                . ' loading="lazy">'
                . '</iframe>';
        }

        if ($this->config->isListingControlsEnabled()) {
            $html .= $this->buildPlayStopButton();
        }

        $html .= '</div>';

        return $html;
    }

    /**
     * Build simplified play/stop button overlay for listing.
     */
    private function buildPlayStopButton(): string
    {
        return '<button class="rp-listing-playstop" type="button" aria-label="Play/Pause">'
            . '<svg class="rp-playstop-play" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">'
            . '<polygon points="5,3 19,12 5,21"/>'
            . '</svg>'
            . '<svg class="rp-playstop-pause" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display:none">'
            . '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
            . '</svg>'
            . '</button>';
    }

    private function isVideoUrl(string $url): bool
    {
        $path = parse_url($url, PHP_URL_PATH) ?: $url;
        return strtolower(pathinfo($path, PATHINFO_EXTENSION)) === 'mp4';
    }
}
