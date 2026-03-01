<?php
/**
 * Rollpix ProductGallery Configuration Helper
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Model;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Store\Model\ScopeInterface;

class Config
{
    private const XML_PATH_ZOOM_TYPE = 'rollpix_gallery/zoom/type';
    private const XML_PATH_ZOOM_LEVEL = 'rollpix_gallery/zoom/level';
    private const XML_PATH_ZOOM_POSITION = 'rollpix_gallery/zoom/position';
    private const XML_PATH_LAYOUT_TYPE = 'rollpix_gallery/layout/type';
    private const XML_PATH_GALLERY_POSITION = 'rollpix_gallery/layout/gallery_position';
    private const XML_PATH_COLUMN_RATIO = 'rollpix_gallery/layout/column_ratio';
    private const XML_PATH_GRID_RATIO = 'rollpix_gallery/layout/grid_ratio';
    private const XML_PATH_GRID_IMAGE_COLUMNS = 'rollpix_gallery/layout/grid_image_columns';
    private const XML_PATH_IMAGE_GAP = 'rollpix_gallery/layout/image_gap';
    private const XML_PATH_MOBILE_BEHAVIOR = 'rollpix_gallery/mobile/behavior';
    private const XML_PATH_MOBILE_CAROUSEL_DOTS = 'rollpix_gallery/mobile/carousel_dots';
    private const XML_PATH_MOBILE_CAROUSEL_ARROWS = 'rollpix_gallery/mobile/carousel_arrows';
    private const XML_PATH_STICKY_ENABLED = 'rollpix_gallery/sticky/enabled';
    private const XML_PATH_STICKY_MODE = 'rollpix_gallery/sticky/mode';
    private const XML_PATH_STICKY_OFFSET = 'rollpix_gallery/sticky/offset';
    private const XML_PATH_TABS_INLINE_ENABLED = 'rollpix_gallery/tabs/inline_enabled';
    private const XML_PATH_TABS_DESC_MAX_HEIGHT = 'rollpix_gallery/tabs/description_max_height';
    private const XML_PATH_THUMBNAIL_POSITION = 'rollpix_gallery/layout/thumbnail_position';
    private const XML_PATH_SLIDER_DIRECTION = 'rollpix_gallery/layout/slider_direction';
    private const XML_PATH_SLIDER_TRANSITION = 'rollpix_gallery/layout/slider_transition';
    private const XML_PATH_SLIDER_ARROWS = 'rollpix_gallery/layout/slider_arrows';
    private const XML_PATH_SLIDER_DOTS = 'rollpix_gallery/layout/slider_dots';
    private const XML_PATH_SLIDER_MOUSEWHEEL = 'rollpix_gallery/layout/slider_mousewheel';
    private const XML_PATH_THUMBNAIL_STYLE = 'rollpix_gallery/layout/thumbnail_style';
    private const XML_PATH_THUMBNAIL_SHAPE = 'rollpix_gallery/layout/thumbnail_shape';
    private const XML_PATH_SHIMMER_ENABLED = 'rollpix_gallery/effects/shimmer_enabled';
    private const XML_PATH_FADEIN_ENABLED = 'rollpix_gallery/effects/fadein_enabled';
    private const XML_PATH_COUNTER_ENABLED = 'rollpix_gallery/effects/counter_enabled';
    private const XML_PATH_FOCUS_STYLE = 'rollpix_gallery/effects/focus_style';
    private const XML_PATH_VIDEO_ENABLED = 'rollpix_gallery/video/enabled';
    private const XML_PATH_VIDEO_AUTOPLAY = 'rollpix_gallery/video/autoplay';
    private const XML_PATH_VIDEO_LOOP = 'rollpix_gallery/video/loop';
    private const XML_PATH_VIDEO_MUTED = 'rollpix_gallery/video/muted';
    private const XML_PATH_VIDEO_CONTROLS = 'rollpix_gallery/video/controls';
    private const XML_PATH_VIDEO_OBJECT_FIT = 'rollpix_gallery/video/object_fit';
    private const XML_PATH_VIDEO_LAZY_LOAD = 'rollpix_gallery/video/lazy_load';
    private const XML_PATH_VIDEO_LISTING_ENABLED = 'rollpix_gallery/video/listing_enabled';
    private const XML_PATH_VIDEO_LISTING_AUTOPLAY = 'rollpix_gallery/video/listing_autoplay';
    private const XML_PATH_VIDEO_LISTING_CONTROLS = 'rollpix_gallery/video/listing_controls';
    private const XML_PATH_VIDEO_LISTING_OBJECT_FIT = 'rollpix_gallery/video/listing_object_fit';
    private const XML_PATH_VIDEO_MAX_SIZE = 'rollpix_gallery/video/max_size';

    private ScopeConfigInterface $scopeConfig;

    public function __construct(ScopeConfigInterface $scopeConfig)
    {
        $this->scopeConfig = $scopeConfig;
    }

    public function getZoomType(?int $storeId = null): string
    {
        return (string) $this->scopeConfig->getValue(
            self::XML_PATH_ZOOM_TYPE,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function getZoomLevel(?int $storeId = null): int
    {
        return (int) $this->scopeConfig->getValue(
            self::XML_PATH_ZOOM_LEVEL,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function getZoomPosition(?int $storeId = null): string
    {
        return (string) $this->scopeConfig->getValue(
            self::XML_PATH_ZOOM_POSITION,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function getLayoutType(?int $storeId = null): string
    {
        return (string) $this->scopeConfig->getValue(
            self::XML_PATH_LAYOUT_TYPE,
            ScopeInterface::SCOPE_STORE,
            $storeId
        ) ?: 'vertical';
    }

    public function getGalleryPosition(?int $storeId = null): string
    {
        return (string) $this->scopeConfig->getValue(
            self::XML_PATH_GALLERY_POSITION,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function getColumnRatio(?int $storeId = null): string
    {
        return (string) $this->scopeConfig->getValue(
            self::XML_PATH_COLUMN_RATIO,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function getGridRatio(?int $storeId = null): string
    {
        return (string) $this->scopeConfig->getValue(
            self::XML_PATH_GRID_RATIO,
            ScopeInterface::SCOPE_STORE,
            $storeId
        ) ?: '70_30';
    }

    public function getGridImageColumns(?int $storeId = null): int
    {
        return (int) $this->scopeConfig->getValue(
            self::XML_PATH_GRID_IMAGE_COLUMNS,
            ScopeInterface::SCOPE_STORE,
            $storeId
        ) ?: 2;
    }

    public function getImageGap(?int $storeId = null): int
    {
        return (int) $this->scopeConfig->getValue(
            self::XML_PATH_IMAGE_GAP,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function getMobileBehavior(?int $storeId = null): string
    {
        return (string) $this->scopeConfig->getValue(
            self::XML_PATH_MOBILE_BEHAVIOR,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function isMobileCarouselDotsEnabled(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_MOBILE_CAROUSEL_DOTS,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function isMobileCarouselArrowsEnabled(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_MOBILE_CAROUSEL_ARROWS,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function isStickyEnabled(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_STICKY_ENABLED,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function getStickyMode(?int $storeId = null): string
    {
        return (string) $this->scopeConfig->getValue(
            self::XML_PATH_STICKY_MODE,
            ScopeInterface::SCOPE_STORE,
            $storeId
        ) ?: 'scroll';
    }

    public function getStickyOffset(?int $storeId = null): int
    {
        return (int) $this->scopeConfig->getValue(
            self::XML_PATH_STICKY_OFFSET,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function isInlineTabsEnabled(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_TABS_INLINE_ENABLED,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function getDescriptionMaxHeight(?int $storeId = null): int
    {
        return (int) $this->scopeConfig->getValue(
            self::XML_PATH_TABS_DESC_MAX_HEIGHT,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function getThumbnailPosition(?int $storeId = null): string
    {
        return (string) $this->scopeConfig->getValue(
            self::XML_PATH_THUMBNAIL_POSITION,
            ScopeInterface::SCOPE_STORE,
            $storeId
        ) ?: 'disabled';
    }

    public function getSliderDirection(?int $storeId = null): string
    {
        return (string) $this->scopeConfig->getValue(
            self::XML_PATH_SLIDER_DIRECTION,
            ScopeInterface::SCOPE_STORE,
            $storeId
        ) ?: 'horizontal';
    }

    public function getSliderTransition(?int $storeId = null): string
    {
        return (string) $this->scopeConfig->getValue(
            self::XML_PATH_SLIDER_TRANSITION,
            ScopeInterface::SCOPE_STORE,
            $storeId
        ) ?: 'fade';
    }

    public function isSliderArrowsEnabled(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_SLIDER_ARROWS,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function isSliderDotsEnabled(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_SLIDER_DOTS,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function isSliderMousewheelEnabled(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_SLIDER_MOUSEWHEEL,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function getThumbnailStyle(?int $storeId = null): string
    {
        return (string) $this->scopeConfig->getValue(
            self::XML_PATH_THUMBNAIL_STYLE,
            ScopeInterface::SCOPE_STORE,
            $storeId
        ) ?: 'outside';
    }

    public function getThumbnailShape(?int $storeId = null): string
    {
        return (string) $this->scopeConfig->getValue(
            self::XML_PATH_THUMBNAIL_SHAPE,
            ScopeInterface::SCOPE_STORE,
            $storeId
        ) ?: 'square';
    }

    public function isShimmerEnabled(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_SHIMMER_ENABLED,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function isFadeInEnabled(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_FADEIN_ENABLED,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function isCounterEnabled(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_COUNTER_ENABLED,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function getFocusStyle(?int $storeId = null): string
    {
        return (string) $this->scopeConfig->getValue(
            self::XML_PATH_FOCUS_STYLE,
            ScopeInterface::SCOPE_STORE,
            $storeId
        ) ?: 'disabled';
    }

    public function isVideoEnabled(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_VIDEO_ENABLED,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function isVideoAutoplay(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_VIDEO_AUTOPLAY,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function isVideoLoop(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_VIDEO_LOOP,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function isVideoMuted(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_VIDEO_MUTED,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function isVideoControlsEnabled(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_VIDEO_CONTROLS,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function getVideoObjectFit(?int $storeId = null): string
    {
        return (string) $this->scopeConfig->getValue(
            self::XML_PATH_VIDEO_OBJECT_FIT,
            ScopeInterface::SCOPE_STORE,
            $storeId
        ) ?: 'cover';
    }

    public function isVideoLazyLoad(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_VIDEO_LAZY_LOAD,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function isVideoListingEnabled(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_VIDEO_LISTING_ENABLED,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function isListingAutoplay(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_VIDEO_LISTING_AUTOPLAY,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function isListingControlsEnabled(?int $storeId = null): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_VIDEO_LISTING_CONTROLS,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    public function getListingObjectFit(?int $storeId = null): string
    {
        return (string) $this->scopeConfig->getValue(
            self::XML_PATH_VIDEO_LISTING_OBJECT_FIT,
            ScopeInterface::SCOPE_STORE,
            $storeId
        ) ?: 'cover';
    }

    public function getVideoMaxSize(?int $storeId = null): int
    {
        return (int) $this->scopeConfig->getValue(
            self::XML_PATH_VIDEO_MAX_SIZE,
            ScopeInterface::SCOPE_STORE,
            $storeId
        ) ?: 20;
    }

    /**
     * Get all configuration as array for JS
     */
    public function getJsConfig(?int $storeId = null): array
    {
        return [
            'zoom' => [
                'type' => $this->getZoomType($storeId),
                'level' => $this->getZoomLevel($storeId),
                'position' => $this->getZoomPosition($storeId)
            ],
            'layout' => [
                'type' => $this->getLayoutType($storeId),
                'galleryPosition' => $this->getGalleryPosition($storeId),
                'columnRatio' => $this->getColumnRatio($storeId),
                'gridRatio' => $this->getGridRatio($storeId),
                'gridImageColumns' => $this->getGridImageColumns($storeId),
                'imageGap' => $this->getImageGap($storeId),
                'thumbnailPosition' => $this->getThumbnailPosition($storeId),
                'thumbnailStyle' => $this->getThumbnailStyle($storeId),
                'thumbnailShape' => $this->getThumbnailShape($storeId)
            ],
            'mobile' => [
                'behavior' => $this->getMobileBehavior($storeId),
                'carouselDots' => $this->isMobileCarouselDotsEnabled($storeId),
                'carouselArrows' => $this->isMobileCarouselArrowsEnabled($storeId)
            ],
            'sticky' => [
                'enabled' => $this->isStickyEnabled($storeId),
                'mode' => $this->getStickyMode($storeId),
                'offset' => $this->getStickyOffset($storeId)
            ],
            'tabs' => [
                'inlineEnabled' => $this->isInlineTabsEnabled($storeId),
                'descriptionMaxHeight' => $this->getDescriptionMaxHeight($storeId)
            ],
            'slider' => [
                'direction' => $this->getSliderDirection($storeId),
                'transition' => $this->getSliderTransition($storeId),
                'arrows' => $this->isSliderArrowsEnabled($storeId),
                'dots' => $this->isSliderDotsEnabled($storeId),
                'mousewheel' => $this->isSliderMousewheelEnabled($storeId)
            ],
            'effects' => [
                'shimmerEnabled' => $this->isShimmerEnabled($storeId),
                'fadeInEnabled' => $this->isFadeInEnabled($storeId),
                'counterEnabled' => $this->isCounterEnabled($storeId),
                'focusStyle' => $this->getFocusStyle($storeId)
            ],
            'video' => [
                'enabled' => $this->isVideoEnabled($storeId),
                'autoplay' => $this->isVideoAutoplay($storeId),
                'loop' => $this->isVideoLoop($storeId),
                'muted' => $this->isVideoMuted($storeId),
                'controls' => $this->isVideoControlsEnabled($storeId),
                'objectFit' => $this->getVideoObjectFit($storeId),
                'lazyLoad' => $this->isVideoLazyLoad($storeId),
                'listingEnabled' => $this->isVideoListingEnabled($storeId),
                'listingAutoplay' => $this->isListingAutoplay($storeId),
                'listingControls' => $this->isListingControlsEnabled($storeId),
                'listingObjectFit' => $this->getListingObjectFit($storeId)
            ]
        ];
    }

    /**
     * Get CSS variables based on configuration
     */
    public function getCssVariables(?int $storeId = null): array
    {
        $ratio = $this->getColumnRatio($storeId);
        $ratioMap = [
            '40_60' => ['40%', '60%'],
            '50_50' => ['50%', '50%'],
            '60_40' => ['60%', '40%']
        ];
        $columns = $ratioMap[$ratio] ?? ['50%', '50%'];

        $galleryPosition = $this->getGalleryPosition($storeId);
        $galleryOrder = $galleryPosition === 'left' ? 1 : 2;
        $infoOrder = $galleryPosition === 'left' ? 2 : 1;

        // Swap column widths if gallery is on right
        if ($galleryPosition === 'right') {
            $columns = array_reverse($columns);
        }

        return [
            '--rp-gallery-column' => $columns[0],
            '--rp-info-column' => $columns[1],
            '--rp-gallery-order' => $galleryOrder,
            '--rp-info-order' => $infoOrder,
            '--rp-image-gap' => $this->getImageGap($storeId) . 'px',
            '--rp-sticky-offset' => $this->getStickyOffset($storeId) . 'px'
        ];
    }
}
