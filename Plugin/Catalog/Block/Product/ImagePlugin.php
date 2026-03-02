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
use Magento\Store\Model\StoreManagerInterface;
use Magento\Framework\UrlInterface;
use Rollpix\ProductGallery\Model\Config;
use Rollpix\ProductGallery\Model\VideoUrlParser;

class ImagePlugin
{
    private Config $config;
    private VideoUrlParser $videoUrlParser;
    private StoreManagerInterface $storeManager;

    public function __construct(
        Config $config,
        VideoUrlParser $videoUrlParser,
        StoreManagerInterface $storeManager
    ) {
        $this->config = $config;
        $this->videoUrlParser = $videoUrlParser;
        $this->storeManager = $storeManager;
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
            // Strip cache path from URL — MP4 files should never use cached URLs
            $cleanUrl = $this->sanitizeVideoUrl($imagePath);
            return $this->buildLocalVideoHtml($cleanUrl, $subject);
        }

        // Fallback: check if the rendered HTML contains a video file reference
        if (preg_match('/\.mp4["\'\s?#]/', $result)) {
            $cleanUrl = $this->sanitizeVideoUrl($imagePath);
            return $this->buildLocalVideoHtml($cleanUrl, $subject);
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
        $width = (int)($subject->getWidth() ?: 0);
        $height = (int)($subject->getHeight() ?: 0);
        $aspectRatio = ($width && $height) ? $width . '/' . $height : '1/1';

        $html = '<div class="rp-listing-video-wrapper" data-video-provider="local"'
            . ' style="aspect-ratio:' . $aspectRatio . ';">'
            . '<video ' . $attrsStr
            . ' class="rp-listing-video"'
            . ' style="width:100%;height:100%;object-fit:' . htmlspecialchars($objectFit) . ';background:#000;"'
            . ($width ? ' width="' . $width . '"' : '')
            . ($height ? ' height="' . $height . '"' : '')
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
            true, // enable native controls for external embedded players
            $parsed['id']
        );

        $embedUrl = $this->videoUrlParser->getEmbedUrl($parsed['provider'], $parsed['id'], $params);
        $width = (int)($subject->getWidth() ?: 0);
        $height = (int)($subject->getHeight() ?: 0);
        $aspectRatio = ($width && $height) ? $width . '/' . $height : '1/1';

        $html = '<div class="rp-listing-video-wrapper rp-listing-video-external"'
            . ' data-video-provider="' . htmlspecialchars($provider) . '"'
            . ' data-embed-url="' . htmlspecialchars($embedUrl) . '"'
            . ' style="aspect-ratio:' . $aspectRatio . ';">';

        if (!empty($thumbnailUrl)) {
            // Facade: show thumbnail with play button, JS loads iframe
            $html .= '<div class="rp-listing-video-facade"'
                . ' style="background-image: url(\'' . htmlspecialchars($thumbnailUrl) . '\')">'
                . '<button class="rp-listing-play-btn" type="button" aria-label="Play video">'
                . '<svg width="48" height="48" viewBox="0 0 48 48">'
                . '<circle cx="24" cy="24" r="22" fill="rgba(0,0,0,0.65)"/>'
                . '<polygon points="19,14 19,34 37,24" fill="#fff"/>'
                . '</svg>'
                . '</button>'
                . '</div>';
        } else {
            // No thumbnail, load iframe directly
            $html .= '<iframe src="' . htmlspecialchars($embedUrl) . '"'
                . ' class="rp-listing-video-iframe"'
                . ' frameborder="0"'
                . ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"'
                . ' referrerpolicy="strict-origin-when-cross-origin"'
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

    /**
     * Strip Magento image cache path from MP4 URLs.
     * Cache URLs look like: /media/catalog/product/cache/{hash}/{file}
     * We need raw: /media/catalog/product/{file}
     */
    private function sanitizeVideoUrl(string $url): string
    {
        // Strip cache segment: /cache/[hash]/ → /
        $sanitized = preg_replace('#/cache/[a-f0-9]+/#i', '/', $url);

        // Strip resize query params (width, height, store, image-type)
        $sanitized = preg_replace('/\?.*$/', '', $sanitized);

        // If URL still looks wrong, try building from product data
        if (empty($sanitized) || !$this->isVideoUrl($sanitized)) {
            return $url;
        }

        return $sanitized;
    }

    private function isVideoUrl(string $url): bool
    {
        $path = parse_url($url, PHP_URL_PATH) ?: $url;
        return strtolower(pathinfo($path, PATHINFO_EXTENSION)) === 'mp4';
    }
}
