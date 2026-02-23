<?php
/**
 * Rollpix ProductGallery - Local Video Upload Controller
 *
 * Handles MP4 video file uploads for the product "Add Video" dialog.
 * Files are saved to the product media tmp directory so Magento's
 * gallery handler moves them to the permanent location on product save.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Controller\Adminhtml\Product\Video;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Catalog\Model\Product\Media\Config as MediaConfig;
use Magento\Framework\App\Action\HttpPostActionInterface;
use Magento\Framework\App\Filesystem\DirectoryList;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Filesystem;
use Magento\MediaStorage\Model\File\UploaderFactory;

class Upload extends Action implements HttpPostActionInterface
{
    public const ADMIN_RESOURCE = 'Magento_Catalog::products';

    private UploaderFactory $uploaderFactory;
    private Filesystem $filesystem;
    private MediaConfig $mediaConfig;
    private JsonFactory $resultJsonFactory;

    public function __construct(
        Context $context,
        UploaderFactory $uploaderFactory,
        Filesystem $filesystem,
        MediaConfig $mediaConfig,
        JsonFactory $resultJsonFactory
    ) {
        parent::__construct($context);
        $this->uploaderFactory = $uploaderFactory;
        $this->filesystem = $filesystem;
        $this->mediaConfig = $mediaConfig;
        $this->resultJsonFactory = $resultJsonFactory;
    }

    /**
     * Upload MP4 video file to the product media tmp directory.
     */
    public function execute()
    {
        try {
            $uploader = $this->uploaderFactory->create(['fileId' => 'video_file']);
            $uploader->setAllowedExtensions(['mp4']);
            $uploader->setAllowRenameFiles(true);
            $uploader->setFilesDispersion(true);

            $mediaDirectory = $this->filesystem->getDirectoryRead(DirectoryList::MEDIA);
            $result = $uploader->save(
                $mediaDirectory->getAbsolutePath($this->mediaConfig->getBaseTmpMediaPath())
            );

            if (is_array($result)) {
                unset($result['tmp_name'], $result['path']);

                $result['url'] = $this->mediaConfig->getTmpMediaUrl($result['file']);
                $result['file'] = $result['file'] . '.tmp';
            } else {
                $result = ['error' => 'Something went wrong while saving the video file.'];
            }
        } catch (LocalizedException $e) {
            $result = ['error' => $e->getMessage(), 'errorcode' => $e->getCode()];
        } catch (\Throwable $e) {
            $result = ['error' => 'Something went wrong while saving the video file.', 'errorcode' => 0];
        }

        return $this->resultJsonFactory->create()->setData($result);
    }
}
