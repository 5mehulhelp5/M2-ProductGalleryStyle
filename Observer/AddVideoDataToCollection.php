<?php
/**
 * Rollpix ProductGallery - Observer to enrich product collections with video data
 *
 * Listens to catalog_block_product_list_collection event and pre-loads
 * video information for all products in the collection, avoiding N+1 queries.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Observer;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Store\Model\StoreManagerInterface;
use Rollpix\ProductGallery\Model\Config;
use Rollpix\ProductGallery\Model\ProductVideoDataLoader;

class AddVideoDataToCollection implements ObserverInterface
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

    public function execute(Observer $observer): void
    {
        if (!$this->config->isVideoEnabled() || !$this->config->isVideoListingEnabled()) {
            return;
        }

        /** @var \Magento\Catalog\Model\ResourceModel\Product\Collection $collection */
        $collection = $observer->getEvent()->getData('collection');

        if (!$collection || !$collection->getSize()) {
            return;
        }

        $productIds = [];
        foreach ($collection as $product) {
            $productIds[] = (int)$product->getId();
        }

        if (empty($productIds)) {
            return;
        }

        try {
            $storeId = (int)$this->storeManager->getStore()->getId();
        } catch (\Exception $e) {
            $storeId = 0;
        }

        $videoData = $this->videoDataLoader->loadForProductIds($productIds, $storeId);

        foreach ($collection as $product) {
            $id = (int)$product->getId();
            if (isset($videoData[$id])) {
                $product->setData('rp_listing_video', $videoData[$id]);
            }
        }
    }
}
