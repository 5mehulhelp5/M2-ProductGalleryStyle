<?php
/**
 * Rollpix ProductGallery ViewModel
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\ViewModel;

use Magento\Catalog\Model\Product;
use Magento\Framework\App\Filesystem\DirectoryList as FsDir;
use Magento\Framework\Filesystem;
use Magento\Framework\View\Element\Block\ArgumentInterface;
use Magento\Framework\Json\EncoderInterface;
use Rollpix\ProductGallery\Model\Config;
use Rollpix\ProductGallery\Model\VideoUrlParser;

class GalleryConfig implements ArgumentInterface
{
    private Config $config;
    private EncoderInterface $jsonEncoder;
    private VideoUrlParser $videoUrlParser;
    private Filesystem $filesystem;

    /** @var array<string, string> */
    private static array $imageAspectCache = [];

    public function __construct(
        Config $config,
        EncoderInterface $jsonEncoder,
        VideoUrlParser $videoUrlParser,
        ?Filesystem $filesystem = null
    ) {
        $this->config = $config;
        $this->jsonEncoder = $jsonEncoder;
        $this->videoUrlParser = $videoUrlParser;
        $this->filesystem = $filesystem
            ?: \Magento\Framework\App\ObjectManager::getInstance()->get(Filesystem::class);
    }

    public function getZoomType(): string
    {
        return $this->config->getZoomType();
    }

    public function getZoomLevel(): int
    {
        return $this->config->getZoomLevel();
    }

    public function getZoomPosition(): string
    {
        return $this->config->getZoomPosition();
    }

    public function getLayoutType(): string
    {
        return $this->config->getLayoutType();
    }

    public function getGalleryPosition(): string
    {
        return $this->config->getGalleryPosition();
    }

    public function getColumnRatio(): string
    {
        return $this->config->getColumnRatio();
    }

    public function getGridRatio(): string
    {
        return $this->config->getGridRatio();
    }

    public function getGridImageColumns(): int
    {
        return $this->config->getGridImageColumns();
    }

    public function getImageGap(): int
    {
        return $this->config->getImageGap();
    }

    public function getMobileBehavior(): string
    {
        return $this->config->getMobileBehavior();
    }

    public function isStickyEnabled(): bool
    {
        return $this->config->isStickyEnabled();
    }

    public function getStickyMode(): string
    {
        return $this->config->getStickyMode();
    }

    public function getStickyOffset(): int
    {
        return $this->config->getStickyOffset();
    }

    public function isInlineTabsEnabled(): bool
    {
        return $this->config->isInlineTabsEnabled();
    }

    public function getThumbnailPosition(): string
    {
        return $this->config->getThumbnailPosition();
    }

    public function getThumbnailStyle(): string
    {
        return $this->config->getThumbnailStyle();
    }

    public function getThumbnailShape(): string
    {
        return $this->config->getThumbnailShape();
    }

    public function isSliderArrowsEnabled(): bool
    {
        return $this->config->isSliderArrowsEnabled();
    }

    public function isSliderDotsEnabled(): bool
    {
        return $this->config->isSliderDotsEnabled();
    }

    public function isShimmerEnabled(): bool
    {
        return $this->config->isShimmerEnabled();
    }

    public function isFadeInEnabled(): bool
    {
        return $this->config->isFadeInEnabled();
    }

    public function isCounterEnabled(): bool
    {
        return $this->config->isCounterEnabled();
    }

    public function getFocusStyle(): string
    {
        return $this->config->getFocusStyle();
    }

    public function isVideoEnabled(): bool
    {
        return $this->config->isVideoEnabled();
    }

    public function isVideoAutoplay(): bool
    {
        return $this->config->isVideoAutoplay();
    }

    public function isVideoLoop(): bool
    {
        return $this->config->isVideoLoop();
    }

    public function isVideoMuted(): bool
    {
        return $this->config->isVideoMuted();
    }

    public function isVideoControlsEnabled(): bool
    {
        return $this->config->isVideoControlsEnabled();
    }

    public function getVideoObjectFit(): string
    {
        return $this->config->getVideoObjectFit();
    }

    public function getVideoPdpPlayerSize(): string
    {
        return $this->config->getVideoPdpPlayerSize();
    }

    /**
     * Returns the CSS aspect-ratio value for the PDP video container.
     * "video" mode: fixed 16/9.
     * "image" mode: reads the base product image dimensions from disk.
     */
    public function getPdpVideoAspectRatio(Product $product): string
    {
        if ($this->config->getVideoPdpPlayerSize() !== 'image') {
            return '16/9';
        }

        $baseImageFile = $product->getData('image');
        if (!$baseImageFile || $baseImageFile === 'no_selection') {
            return '1/1';
        }

        if (isset(self::$imageAspectCache[$baseImageFile])) {
            return self::$imageAspectCache[$baseImageFile];
        }

        try {
            $mediaDir = $this->filesystem->getDirectoryRead(FsDir::MEDIA);
            $filePath = $mediaDir->getAbsolutePath('catalog/product' . $baseImageFile);
            $size = @getimagesize($filePath);
            if ($size && $size[0] > 0 && $size[1] > 0) {
                $ar = $size[0] . '/' . $size[1];
                self::$imageAspectCache[$baseImageFile] = $ar;
                return $ar;
            }
        } catch (\Exception $e) {
            // Ignore — fall through to default
        }

        self::$imageAspectCache[$baseImageFile] = '1/1';
        return '1/1';
    }

    public function isVideoLazyLoad(): bool
    {
        return $this->config->isVideoLazyLoad();
    }

    public function isVideoListingEnabled(): bool
    {
        return $this->config->isVideoListingEnabled();
    }

    public function getVideoMaxSize(): int
    {
        return $this->config->getVideoMaxSize();
    }

    /**
     * Whether the "light mode" swatch → gallery image switch is enabled.
     *
     * Admin-gated (default off). The light-mode bridge is designed to
     * coexist with the full-feature `Rollpix_ConfigurableGallery` sibling
     * module: both can be installed together. If the richer module is
     * present and its own bridge takes precedence, this flag can simply
     * be left off from the admin — we do not auto-deactivate here so
     * that merchants keep explicit control over which bridge runs.
     */
    public function isSwatchGallerySwitchEnabled(): bool
    {
        return $this->config->isSwatchGallerySwitchEnabled();
    }

    /**
     * Check if a provider is an external video (YouTube/Vimeo)
     */
    public function isExternalVideo(string $provider): bool
    {
        return in_array($provider, ['youtube', 'vimeo'], true);
    }

    /**
     * Get embed URL for a YouTube/Vimeo video with config-based params.
     */
    public function getVideoEmbedUrl(string $videoUrl, string $provider): string
    {
        $parsed = $this->videoUrlParser->parse($videoUrl);
        if (!$parsed || $parsed['provider'] === 'local') {
            return $videoUrl;
        }

        $params = $this->videoUrlParser->buildEmbedParams(
            $parsed['provider'],
            $this->isVideoAutoplay(),
            $this->isVideoMuted(),
            $this->isVideoLoop(),
            $this->isVideoControlsEnabled(),
            $parsed['id']
        );

        return $this->videoUrlParser->getEmbedUrl($parsed['provider'], $parsed['id'], $params);
    }

    /**
     * Parse a video URL and return provider/id info.
     *
     * @return array{provider: string, id: string}|null
     */
    public function parseVideoUrl(string $url): ?array
    {
        return $this->videoUrlParser->parse($url);
    }

    /**
     * Check if a media gallery file is a video
     */
    public function isVideoFile(string $file): bool
    {
        return strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'mp4';
    }

    /**
     * Get JS configuration as JSON
     */
    public function getJsConfigJson(): string
    {
        return $this->jsonEncoder->encode($this->config->getJsConfig());
    }

    /**
     * Get column CSS values based on layout type, ratio and position
     */
    public function getColumnCss(): array
    {
        $layoutType = $this->getLayoutType();
        $position = $this->getGalleryPosition();

        if ($layoutType === 'grid' || $layoutType === 'fashion' || $layoutType === 'slider') {
            $gridRatio = $this->getGridRatio();
            $parts = explode('_', $gridRatio);
            $col1 = (int) ($parts[0] ?? 70);
            $col2 = (int) ($parts[1] ?? 30);
            $columns = [$col1 . 'fr', $col2 . 'fr'];

            if ($position === 'right') {
                $columns = array_reverse($columns);
            }

            $result = [
                'col1' => $columns[0],
                'col2' => $columns[1],
                'galleryOrder' => $position === 'left' ? 1 : 2,
                'infoOrder' => $position === 'left' ? 2 : 1
            ];

            if ($layoutType === 'grid') {
                $result['gridImageColumns'] = $this->getGridImageColumns();
            }

            return $result;
        }

        // Vertical layout
        $ratio = $this->getColumnRatio();
        $parts = explode('_', $ratio);
        $col1 = (int) ($parts[0] ?? 50);
        $col2 = (int) ($parts[1] ?? 50);
        $columns = [$col1 . 'fr', $col2 . 'fr'];

        if ($position === 'right') {
            $columns = array_reverse($columns);
        }

        return [
            'col1' => $columns[0],
            'col2' => $columns[1],
            'galleryOrder' => $position === 'left' ? 1 : 2,
            'infoOrder' => $position === 'left' ? 2 : 1
        ];
    }
}
