<?php
/**
 * Rollpix ProductGallery - Plugin to swap img for video on product listing pages
 *
 * When a product's thumbnail image is an MP4 video file, this plugin replaces
 * the <img> HTML output with a <video> element in the product listing grid.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Plugin\Catalog\Block\Product;

use Magento\Catalog\Block\Product\Image as ImageBlock;
use Rollpix\ProductGallery\Model\Config;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Framework\UrlInterface;

class ImagePlugin
{
    private Config $config;
    private StoreManagerInterface $storeManager;

    public function __construct(
        Config $config,
        StoreManagerInterface $storeManager
    ) {
        $this->config = $config;
        $this->storeManager = $storeManager;
    }

    /**
     * After toHtml: if the product image is a video, replace <img> with <video>
     */
    public function afterToHtml(ImageBlock $subject, string $result): string
    {
        if (!$this->config->isVideoEnabled() || !$this->config->isVideoListingEnabled()) {
            return $result;
        }

        // Get the original image file path from the block's data
        $imagePath = $subject->getData('image_url') ?: '';

        // Check if the rendered image URL points to a video file
        // Also check the custom_attributes or original data for the file extension
        if (!$this->isVideoUrl($imagePath)) {
            // Fallback: check if the HTML contains a video file reference
            if (!preg_match('/\.mp4["\'\s?#]/', $result)) {
                return $result;
            }
        }

        return $this->buildVideoHtml($imagePath, $subject);
    }

    private function buildVideoHtml(string $videoUrl, ImageBlock $subject): string
    {
        $attrs = [];

        if ($this->config->isVideoAutoplay()) {
            $attrs[] = 'autoplay';
        }
        if ($this->config->isVideoLoop()) {
            $attrs[] = 'loop';
        }
        if ($this->config->isVideoMuted()) {
            $attrs[] = 'muted';
        }
        if ($this->config->isVideoControlsEnabled()) {
            $attrs[] = 'controls';
        }

        $attrs[] = 'playsinline';
        $attrs[] = 'preload="metadata"';

        $objectFit = $this->config->getVideoObjectFit();
        $attrsStr = implode(' ', $attrs);

        $width = $subject->getWidth() ?: '';
        $height = $subject->getHeight() ?: '';

        return '<div class="rp-listing-video-wrapper">'
            . '<video ' . $attrsStr
            . ' class="rp-listing-video"'
            . ' style="width:100%;height:auto;object-fit:' . htmlspecialchars($objectFit) . ';"'
            . ($width ? ' width="' . (int)$width . '"' : '')
            . ($height ? ' height="' . (int)$height . '"' : '')
            . '>'
            . '<source src="' . htmlspecialchars($videoUrl) . '" type="video/mp4"/>'
            . '</video>'
            . '</div>';
    }

    private function isVideoUrl(string $url): bool
    {
        // Remove query string and fragments before checking extension
        $path = parse_url($url, PHP_URL_PATH) ?: $url;
        return strtolower(pathinfo($path, PATHINFO_EXTENSION)) === 'mp4';
    }
}
