<?php
/**
 * Rollpix ProductGallery - Plugin on ImageFactory
 *
 * Stores the product reference on the Image block so that
 * downstream plugins (ImagePlugin) can access the product's
 * pre-loaded video data (rp_listing_video).
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Plugin\Catalog\Block\Product;

use Magento\Catalog\Block\Product\Image as ImageBlock;
use Magento\Catalog\Block\Product\ImageFactory;
use Magento\Catalog\Model\Product;

class ImageFactoryPlugin
{
    /**
     * After ImageFactory::create - attach the product reference to the image block.
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     */
    public function afterCreate(
        ImageFactory $subject,
        ImageBlock $result,
        Product $product
    ): ImageBlock {
        $result->setData('rp_product', $product);
        return $result;
    }
}
