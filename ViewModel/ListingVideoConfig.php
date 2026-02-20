<?php
/**
 * Rollpix ProductGallery - Listing Video ViewModel
 *
 * Detects when a product's thumbnail/small_image is a video file
 * and provides video configuration for category listing pages.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\ViewModel;

use Magento\Framework\View\Element\Block\ArgumentInterface;
use Magento\Catalog\Model\Product;
use Magento\Framework\UrlInterface;
use Magento\Store\Model\StoreManagerInterface;
use Rollpix\ProductGallery\Model\Config;

class ListingVideoConfig implements ArgumentInterface
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
     * Check if product's small_image is a video file
     */
    public function isSmallImageVideo(Product $product): bool
    {
        if (!$this->config->isVideoEnabled() || !$this->config->isVideoListingEnabled()) {
            return false;
        }

        $smallImage = $product->getData('small_image');
        if (!$smallImage || $smallImage === 'no_selection') {
            return false;
        }

        return strtolower(pathinfo($smallImage, PATHINFO_EXTENSION)) === 'mp4';
    }

    /**
     * Get the direct URL to the video file in catalog/product media
     */
    public function getVideoUrl(Product $product): string
    {
        $smallImage = $product->getData('small_image');
        try {
            $mediaUrl = $this->storeManager->getStore()
                ->getBaseUrl(UrlInterface::URL_TYPE_MEDIA);
            return $mediaUrl . 'catalog/product' . $smallImage;
        } catch (\Exception $e) {
            return '';
        }
    }

    public function getVideoObjectFit(): string
    {
        return $this->config->getVideoObjectFit();
    }

    public function isVideoAutoplay(): bool
    {
        return $this->config->isVideoAutoplay();
    }

    public function isVideoLoop(): bool
    {
        return $this->config->isVideoLoop();
    }

    public function isVideoMuted(): bool
    {
        return $this->config->isVideoMuted();
    }

    public function isVideoControlsEnabled(): bool
    {
        return $this->config->isVideoControlsEnabled();
    }
}
