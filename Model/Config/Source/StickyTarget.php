<?php
/**
 * Rollpix ProductGallery Sticky Target Source Model
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Model\Config\Source;

use Magento\Framework\Data\OptionSourceInterface;

class StickyTarget implements OptionSourceInterface
{
    public const TARGET_INFO = 'info';
    public const TARGET_GALLERY = 'gallery';

    /**
     * @inheritdoc
     */
    public function toOptionArray(): array
    {
        return [
            ['value' => self::TARGET_INFO, 'label' => __('Product info panel')],
            ['value' => self::TARGET_GALLERY, 'label' => __('Image gallery')]
        ];
    }
}
