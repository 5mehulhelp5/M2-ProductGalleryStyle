<?php
/**
 * Rollpix ProductGallery Focus Style Source Model
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Model\Config\Source;

use Magento\Framework\Data\OptionSourceInterface;

class FocusStyle implements OptionSourceInterface
{
    public const DISABLED = 'disabled';
    public const FADE = 'fade';
    public const BLUR = 'blur';
    public const BOTH = 'both';

    /**
     * @inheritdoc
     */
    public function toOptionArray(): array
    {
        return [
            ['value' => self::DISABLED, 'label' => __('Disabled')],
            ['value' => self::FADE, 'label' => __('Fade (opacity)')],
            ['value' => self::BLUR, 'label' => __('Blur')],
            ['value' => self::BOTH, 'label' => __('Fade + Blur')]
        ];
    }
}
