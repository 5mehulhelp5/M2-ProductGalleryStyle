<?php
/**
 * Rollpix ProductGallery - Video Object Fit Source Model
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Model\Config\Source;

use Magento\Framework\Data\OptionSourceInterface;

class VideoObjectFit implements OptionSourceInterface
{
    public function toOptionArray(): array
    {
        return [
            ['value' => 'cover', 'label' => __('Cover (crop to fill)')],
            ['value' => 'contain', 'label' => __('Contain (show entire video, may letterbox)')]
        ];
    }
}
