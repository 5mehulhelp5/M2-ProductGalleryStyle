<?php
/**
 * Rollpix ProductGallery Thumbnail Shape Source Model
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Model\Config\Source;

use Magento\Framework\Data\OptionSourceInterface;

class ThumbnailShape implements OptionSourceInterface
{
    public const SHAPE_SQUARE = 'square';
    public const SHAPE_PRESERVE = 'preserve';

    /**
     * @inheritdoc
     */
    public function toOptionArray(): array
    {
        return [
            ['value' => self::SHAPE_SQUARE, 'label' => __('Square (cropped)')],
            ['value' => self::SHAPE_PRESERVE, 'label' => __('Preserve aspect ratio')]
        ];
    }
}
