<?php
/**
 * Rollpix ProductGallery - Listing Player Size Source Model
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Model\Config\Source;

use Magento\Framework\Data\OptionSourceInterface;

class ListingPlayerSize implements OptionSourceInterface
{
    public function toOptionArray(): array
    {
        return [
            ['value' => 'image', 'label' => __('Match image size (same as other products)')],
            ['value' => 'video', 'label' => __('Video proportion (16:9)')]
        ];
    }
}
