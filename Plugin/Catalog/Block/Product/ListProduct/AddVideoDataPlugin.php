<?php
/**
 * Rollpix ProductGallery - Plugin to enrich product listing with video data
 *
 * Replaces a former observer on `catalog_block_product_list_collection` that
 * forced a premature collection load (getSize() + foreach) before the toolbar
 * applied pageSize/curPage. Under Amasty Shopby AJAX pagination this caused
 * the full category to be returned instead of the requested page.
 *
 * This plugin hooks `getLoadedProductCollection()` and only enriches the
 * collection once it has actually been loaded with the toolbar-applied page
 * size, so only the products that will be rendered are batched.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Plugin\Catalog\Block\Product\ListProduct;

use Magento\Catalog\Block\Product\ListProduct;
use Magento\Catalog\Model\ResourceModel\Product\Collection as ProductCollection;
use Magento\Store\Model\StoreManagerInterface;
use Rollpix\ProductGallery\Model\Config;
use Rollpix\ProductGallery\Model\ProductVideoDataLoader;

class AddVideoDataPlugin
{
    private Config $config;
    private ProductVideoDataLoader $videoDataLoader;
    private StoreManagerInterface $storeManager;

    public function __construct(
        Config $config,
        ProductVideoDataLoader $videoDataLoader,
        StoreManagerInterface $storeManager
    ) {
        $this->config = $config;
        $this->videoDataLoader = $videoDataLoader;
        $this->storeManager = $storeManager;
    }

    public function afterGetLoadedProductCollection(
        ListProduct $subject,
        ProductCollection $collection
    ): ProductCollection {
        if (!$this->config->isVideoEnabled() || !$this->config->isVideoListingEnabled()) {
            return $collection;
        }

        if (!$collection->isLoaded() || $collection->getFlag('rp_video_enriched')) {
            return $collection;
        }

        $productIds = [];
        foreach ($collection as $product) {
            $productIds[] = (int) $product->getId();
        }
        if (empty($productIds)) {
            $collection->setFlag('rp_video_enriched', true);
            return $collection;
        }

        try {
            $storeId = (int) $this->storeManager->getStore()->getId();
        } catch (\Exception $e) {
            $storeId = 0;
        }

        $videoData = $this->videoDataLoader->loadForProductIds($productIds, $storeId);
        foreach ($collection as $product) {
            $id = (int) $product->getId();
            if (isset($videoData[$id])) {
                $product->setData('rp_listing_video', $videoData[$id]);
            }
        }
        $collection->setFlag('rp_video_enriched', true);

        return $collection;
    }
}
