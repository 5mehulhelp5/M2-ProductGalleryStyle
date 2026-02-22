<?php
/**
 * Rollpix ProductGallery - Plugin to allow MP4 video uploads in product gallery
 *
 * The core Upload controller hardcodes allowed extensions to image types only
 * and adds an image validation callback that rejects non-image files.
 * This plugin intercepts MP4 uploads and handles them without image validation.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Plugin\Catalog\Controller\Adminhtml\Product\Gallery;

use Magento\Catalog\Controller\Adminhtml\Product\Gallery\Upload;
use Magento\Catalog\Model\Product\Media\Config as MediaConfig;
use Magento\Framework\App\Filesystem\DirectoryList;
use Magento\Framework\Controller\Result\RawFactory;
use Magento\Framework\Event\ManagerInterface as EventManager;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Filesystem;
use Magento\MediaStorage\Model\File\UploaderFactory;

class UploadPlugin
{
    private RawFactory $resultRawFactory;
    private Filesystem $filesystem;
    private MediaConfig $mediaConfig;
    private UploaderFactory $uploaderFactory;
    private EventManager $eventManager;

    public function __construct(
        RawFactory $resultRawFactory,
        Filesystem $filesystem,
        MediaConfig $mediaConfig,
        UploaderFactory $uploaderFactory,
        EventManager $eventManager
    ) {
        $this->resultRawFactory = $resultRawFactory;
        $this->filesystem = $filesystem;
        $this->mediaConfig = $mediaConfig;
        $this->uploaderFactory = $uploaderFactory;
        $this->eventManager = $eventManager;
    }

    /**
     * Handle MP4 uploads separately to bypass image-only validation
     */
    public function aroundExecute(Upload $subject, callable $proceed)
    {
        $file = $_FILES['image'] ?? null;

        if (!$file || empty($file['name'])) {
            return $proceed();
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        if ($ext !== 'mp4') {
            return $proceed();
        }

        try {
            $uploader = $this->uploaderFactory->create(['fileId' => 'image']);
            $uploader->setAllowedExtensions(['mp4']);
            $uploader->setAllowRenameFiles(true);
            $uploader->setFilesDispersion(true);

            $mediaDirectory = $this->filesystem->getDirectoryRead(DirectoryList::MEDIA);
            $result = $uploader->save(
                $mediaDirectory->getAbsolutePath($this->mediaConfig->getBaseTmpMediaPath())
            );

            $this->eventManager->dispatch(
                'catalog_product_gallery_upload_image_after',
                ['result' => $result, 'action' => $subject]
            );

            if (is_array($result)) {
                unset($result['tmp_name'], $result['path']);
                $result['url'] = $this->mediaConfig->getTmpMediaUrl($result['file']);
                $result['file'] = $result['file'] . '.tmp';
            } else {
                $result = ['error' => 'Something went wrong while saving the file(s).'];
            }
        } catch (LocalizedException $e) {
            $result = ['error' => $e->getMessage(), 'errorcode' => $e->getCode()];
        } catch (\Throwable $e) {
            $result = ['error' => 'Something went wrong while saving the file(s).', 'errorcode' => 0];
        }

        $response = $this->resultRawFactory->create();
        $response->setHeader('Content-type', 'text/plain');
        $response->setContents(json_encode($result));

        return $response;
    }
}
