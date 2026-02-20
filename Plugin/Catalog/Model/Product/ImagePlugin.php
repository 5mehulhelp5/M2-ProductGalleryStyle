<?php
/**
 * Rollpix ProductGallery - Plugin to bypass image resize for MP4 video files
 *
 * Magento's image cache system attempts to resize all media gallery files.
 * This plugin intercepts MP4 files and returns the original media URL
 * instead of attempting GD/ImageMagick processing.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Plugin\Catalog\Model\Product;

use Magento\Catalog\Model\Product\Image;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Framework\UrlInterface;

class ImagePlugin
{
    private StoreManagerInterface $storeManager;

    public function __construct(StoreManagerInterface $storeManager)
    {
        $this->storeManager = $storeManager;
    }

    /**
     * Bypass image processing for video files
     */
    public function aroundSetBaseFile(Image $subject, callable $proceed, string $file): Image
    {
        if ($this->isVideoFile($file)) {
            $subject->setData('_rp_is_video', true);
            $subject->setData('_rp_video_file', $file);
            return $subject;
        }
        return $proceed($file);
    }

    /**
     * Return direct media URL for video files instead of cached image URL
     */
    public function afterGetUrl(Image $subject, ?string $result): ?string
    {
        if ($subject->getData('_rp_is_video')) {
            $file = $subject->getData('_rp_video_file');
            try {
                $mediaUrl = $this->storeManager->getStore()
                    ->getBaseUrl(UrlInterface::URL_TYPE_MEDIA);
                return $mediaUrl . 'catalog/product' . $file;
            } catch (\Exception $e) {
                return $result;
            }
        }
        return $result;
    }

    private function isVideoFile(string $file): bool
    {
        return strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'mp4';
    }
}
