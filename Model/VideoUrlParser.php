<?php
/**
 * Rollpix ProductGallery - Video URL Parser
 *
 * Parses YouTube/Vimeo URLs and generates embed URLs with parameters.
 *
 * @category  Rollpix
 * @package   Rollpix_ProductGallery
 */

declare(strict_types=1);

namespace Rollpix\ProductGallery\Model;

class VideoUrlParser
{
    /**
     * Parse a video URL and return provider info.
     *
     * @return array{provider: string, id: string}|null
     */
    public function parse(string $url): ?array
    {
        $url = trim($url);
        if (empty($url)) {
            return null;
        }

        // YouTube
        $youtubeId = $this->extractYouTubeId($url);
        if ($youtubeId !== null) {
            return ['provider' => 'youtube', 'id' => $youtubeId];
        }

        // Vimeo
        $vimeoId = $this->extractVimeoId($url);
        if ($vimeoId !== null) {
            return ['provider' => 'vimeo', 'id' => $vimeoId];
        }

        // Local MP4
        $lower = strtolower($url);
        if (str_ends_with($lower, '.mp4') || str_contains($lower, '.mp4?')) {
            return ['provider' => 'local', 'id' => $url];
        }

        return null;
    }

    /**
     * Build an embed URL for the given provider and video ID.
     */
    public function getEmbedUrl(string $provider, string $id, array $params = []): string
    {
        switch ($provider) {
            case 'youtube':
                $defaults = [
                    'rel' => '0',
                ];
                $merged = array_merge($defaults, $params);
                $query = http_build_query($merged);
                return 'https://www.youtube.com/embed/' . urlencode($id)
                    . ($query ? '?' . $query : '');

            case 'vimeo':
                $query = http_build_query($params);
                return 'https://player.vimeo.com/video/' . urlencode($id)
                    . ($query ? '?' . $query : '');

            default:
                return $id;
        }
    }

    /**
     * Build embed params from module configuration values.
     *
     * @return array<string, string>
     */
    public function buildEmbedParams(
        string $provider,
        bool $autoplay,
        bool $muted,
        bool $loop,
        bool $controls,
        ?string $videoId = null
    ): array {
        if ($provider === 'youtube') {
            $params = [
                'autoplay' => $autoplay ? '1' : '0',
                'mute' => $muted ? '1' : '0',
                'loop' => $loop ? '1' : '0',
                'controls' => $controls ? '1' : '0',
                'rel' => '0',
                'playsinline' => '1',
            ];
            // YouTube loop requires playlist param with same video ID
            if ($loop && $videoId) {
                $params['playlist'] = $videoId;
            }
            return $params;
        }

        if ($provider === 'vimeo') {
            return [
                'autoplay' => $autoplay ? '1' : '0',
                'muted' => $muted ? '1' : '0',
                'loop' => $loop ? '1' : '0',
                'controls' => $controls ? '1' : '0',
                'playsinline' => '1',
                'dnt' => '1',
            ];
        }

        return [];
    }

    private function extractYouTubeId(string $url): ?string
    {
        // youtube.com/watch?v=ID
        if (preg_match('/(?:youtube\.com\/watch\?.*v=)([\w-]{11})/', $url, $m)) {
            return $m[1];
        }
        // youtu.be/ID
        if (preg_match('/youtu\.be\/([\w-]{11})/', $url, $m)) {
            return $m[1];
        }
        // youtube.com/embed/ID
        if (preg_match('/youtube\.com\/embed\/([\w-]{11})/', $url, $m)) {
            return $m[1];
        }
        // youtube-nocookie.com/embed/ID
        if (preg_match('/youtube-nocookie\.com\/embed\/([\w-]{11})/', $url, $m)) {
            return $m[1];
        }
        // youtube.com/shorts/ID
        if (preg_match('/youtube\.com\/shorts\/([\w-]{11})/', $url, $m)) {
            return $m[1];
        }
        return null;
    }

    private function extractVimeoId(string $url): ?string
    {
        // vimeo.com/ID or player.vimeo.com/video/ID
        if (preg_match('/vimeo\.com\/(?:video\/)?(\d+)/', $url, $m)) {
            return $m[1];
        }
        return null;
    }
}
