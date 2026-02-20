<?php
/**
 * Rollpix ProductGallery - Video Max Size Source Model
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Model\Config\Source;

use Magento\Framework\Data\OptionSourceInterface;

class VideoMaxSize implements OptionSourceInterface
{
    public function toOptionArray(): array
    {
        return [
            ['value' => '5', 'label' => __('5 MB')],
            ['value' => '10', 'label' => __('10 MB')],
            ['value' => '15', 'label' => __('15 MB')],
            ['value' => '20', 'label' => __('20 MB')],
            ['value' => '30', 'label' => __('30 MB')],
            ['value' => '50', 'label' => __('50 MB')]
        ];
    }
}
