<?php
/**
 * Rollpix ProductGallery - Plugin to allow MP4 uploads in product media gallery
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Plugin\Catalog\Product\Media;

use Magento\Catalog\Model\Product\Media\Config as MediaConfig;

class ConfigPlugin
{
    /**
     * Add mp4 to allowed media extensions
     */
    public function afterGetMediaExtensions(MediaConfig $subject, array $result): array
    {
        if (!in_array('mp4', $result)) {
            $result[] = 'mp4';
        }
        return $result;
    }
}
