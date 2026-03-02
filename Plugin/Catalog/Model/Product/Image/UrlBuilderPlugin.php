<?php
/**
 * Rollpix ProductGallery - Plugin to bypass UrlBuilder cache for MP4 video files
 *
 * Magento's Gallery block uses UrlBuilder to generate cached/resized image URLs.
 * For MP4 files, this produces invalid URLs with transformation parameters.
 * This plugin intercepts the UrlBuilder and returns the raw media URL for MP4 files.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Plugin\Catalog\Model\Product\Image;

use Magento\Catalog\Model\Product\Image\UrlBuilder;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Framework\UrlInterface;

class UrlBuilderPlugin
{
    private StoreManagerInterface $storeManager;

    public function __construct(StoreManagerInterface $storeManager)
    {
        $this->storeManager = $storeManager;
    }

    /**
     * Bypass cached URL generation for MP4 video files.
     * Returns the raw media URL instead of a cache URL with resize parameters.
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     */
    public function aroundGetUrl(
        UrlBuilder $subject,
        callable $proceed,
        string $baseFilePath,
        string $imageDisplayArea
    ): string {
        if ($this->isVideoFile($baseFilePath)) {
            try {
                $mediaUrl = $this->storeManager->getStore()
                    ->getBaseUrl(UrlInterface::URL_TYPE_MEDIA);
                return $mediaUrl . 'catalog/product' . $baseFilePath;
            } catch (\Exception $e) {
                return $proceed($baseFilePath, $imageDisplayArea);
            }
        }

        return $proceed($baseFilePath, $imageDisplayArea);
    }

    private function isVideoFile(string $file): bool
    {
        return strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'mp4';
    }
}
