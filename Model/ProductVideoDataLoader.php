<?php
/**
 * Rollpix ProductGallery - Product Video Data Loader
 *
 * Batch-loads video data for a collection of products from the media gallery tables.
 * Used to efficiently detect which products have videos for category listing pages.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Model;

use Magento\Framework\App\ResourceConnection;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Framework\UrlInterface;

class ProductVideoDataLoader
{
    private ResourceConnection $resourceConnection;
    private StoreManagerInterface $storeManager;

    public function __construct(
        ResourceConnection $resourceConnection,
        StoreManagerInterface $storeManager
    ) {
        $this->resourceConnection = $resourceConnection;
        $this->storeManager = $storeManager;
    }

    /**
     * Load video data for multiple products in a single query.
     *
     * Returns an array keyed by product entity_id with the first video found:
     * [
     *     entity_id => [
     *         'video_url' => string,
     *         'provider' => string,  // 'youtube', 'vimeo', 'local'
     *         'thumbnail' => string, // relative path to thumbnail file
     *     ]
     * ]
     *
     * Prioritizes videos that have the small_image role assigned.
     *
     * @param int[] $productIds
     * @param int $storeId
     * @return array<int, array{video_url: string, provider: string, thumbnail: string}>
     */
    public function loadForProductIds(array $productIds, int $storeId = 0): array
    {
        if (empty($productIds)) {
            return [];
        }

        $connection = $this->resourceConnection->getConnection();

        $galleryTable = $this->resourceConnection->getTableName('catalog_product_entity_media_gallery');
        $valueTable = $this->resourceConnection->getTableName('catalog_product_entity_media_gallery_value');
        $entityTable = $this->resourceConnection->getTableName('catalog_product_entity_media_gallery_value_to_entity');
        $videoTable = $this->resourceConnection->getTableName('catalog_product_entity_media_gallery_value_video');

        // Subquery to detect small_image role assignment:
        // Check catalog_product_entity_varchar for the small_image attribute
        $eavAttrTable = $this->resourceConnection->getTableName('eav_attribute');
        $varcharTable = $this->resourceConnection->getTableName('catalog_product_entity_varchar');

        $select = $connection->select()
            ->from(['mgvte' => $entityTable], ['entity_id'])
            ->join(
                ['mg' => $galleryTable],
                'mg.value_id = mgvte.value_id',
                ['file' => 'value']
            )
            ->join(
                ['mgv' => $valueTable],
                'mgv.value_id = mgvte.value_id AND (mgv.store_id = 0 OR mgv.store_id = ' . (int)$storeId . ')',
                ['position']
            )
            ->joinLeft(
                ['mgvv' => $videoTable],
                'mgvv.value_id = mgvte.value_id AND (mgvv.store_id = 0 OR mgvv.store_id = ' . (int)$storeId . ')',
                ['video_url' => 'url', 'provider']
            )
            ->where('mgvte.entity_id IN (?)', $productIds)
            ->where('mg.media_type = ?', 'external-video')
            ->where('COALESCE(mgv.disabled, 0) = 0')
            ->order(['mgvte.entity_id ASC', 'mgv.position ASC']);

        $rows = $connection->fetchAll($select);

        // Also load small_image attribute values to detect role assignment
        $smallImageValues = $this->getSmallImageValues($productIds, $storeId);

        // Group by product and pick the best video
        $result = [];
        $grouped = [];

        foreach ($rows as $row) {
            $entityId = (int)$row['entity_id'];
            if (!isset($grouped[$entityId])) {
                $grouped[$entityId] = [];
            }
            $grouped[$entityId][] = $row;
        }

        foreach ($grouped as $entityId => $videos) {
            $selected = null;
            $smallImage = $smallImageValues[$entityId] ?? null;

            // Prioritize video whose file matches the small_image attribute
            if ($smallImage) {
                foreach ($videos as $video) {
                    if ($video['file'] === $smallImage) {
                        $selected = $video;
                        break;
                    }
                }
            }

            // Fallback: first video by position
            if (!$selected) {
                $selected = $videos[0];
            }

            $provider = $selected['provider'] ?? '';
            $videoUrl = $selected['video_url'] ?? '';

            // Detect local MP4 by file extension if no provider set
            if (empty($provider) && !empty($selected['file'])) {
                $ext = strtolower(pathinfo($selected['file'], PATHINFO_EXTENSION));
                if ($ext === 'mp4') {
                    $provider = 'local';
                    if (empty($videoUrl)) {
                        try {
                            $mediaUrl = $this->storeManager->getStore()
                                ->getBaseUrl(UrlInterface::URL_TYPE_MEDIA);
                            $videoUrl = $mediaUrl . 'catalog/product' . $selected['file'];
                        } catch (\Exception $e) {
                            continue;
                        }
                    }
                }
            }

            if (empty($videoUrl) || empty($provider)) {
                continue;
            }

            $thumbnailUrl = '';
            if ($provider !== 'local' && !empty($selected['file'])) {
                try {
                    $mediaUrl = $this->storeManager->getStore()
                        ->getBaseUrl(UrlInterface::URL_TYPE_MEDIA);
                    $thumbnailUrl = $mediaUrl . 'catalog/product' . $selected['file'];
                } catch (\Exception $e) {
                    // Skip thumbnail
                }
            }

            $result[$entityId] = [
                'video_url' => $videoUrl,
                'provider' => $provider,
                'thumbnail' => $thumbnailUrl,
            ];
        }

        return $result;
    }

    /**
     * Get small_image attribute values for products.
     *
     * @param int[] $productIds
     * @param int $storeId
     * @return array<int, string>
     */
    private function getSmallImageValues(array $productIds, int $storeId): array
    {
        $connection = $this->resourceConnection->getConnection();
        $eavAttrTable = $this->resourceConnection->getTableName('eav_attribute');
        $varcharTable = $this->resourceConnection->getTableName('catalog_product_entity_varchar');

        // Get small_image attribute ID
        $attrId = $connection->fetchOne(
            $connection->select()
                ->from($eavAttrTable, ['attribute_id'])
                ->where('attribute_code = ?', 'small_image')
                ->where('entity_type_id = ?', 4) // catalog_product
        );

        if (!$attrId) {
            return [];
        }

        $select = $connection->select()
            ->from($varcharTable, ['entity_id', 'value'])
            ->where('attribute_id = ?', (int)$attrId)
            ->where('entity_id IN (?)', $productIds)
            ->where('store_id IN (0, ?)', (int)$storeId)
            ->order('store_id DESC'); // Store-specific overrides default

        $rows = $connection->fetchAll($select);
        $result = [];

        foreach ($rows as $row) {
            $entityId = (int)$row['entity_id'];
            // First match wins (store-specific first due to ORDER BY)
            if (!isset($result[$entityId])) {
                $result[$entityId] = $row['value'];
            }
        }

        return $result;
    }
}
