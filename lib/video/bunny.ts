import crypto from 'node:crypto';

export interface BunnyVideoAuthResponse {
  isConfigured: boolean;
  videoId?: string;
  playbackUrl?: string;
  embedUrl?: string;
  token?: string;
  expires?: number;
  isDevelopmentPlaceholder: boolean;
  message?: string;
}

/**
 * Generate Bunny.net token authentication for protected video playback.
 * 
 * Follows Bunny.net Stream security specifications:
 * 1. Embed Token: SHA256(token_key + videoId + expires)
 * 2. URL Token: Base64Url(SHA256(token_key + path + expires))
 */
export function generateBunnyVideoAuth(videoId: string, expiresInSeconds: number = 7200): BunnyVideoAuthResponse {
  const libraryId = process.env.BUNNY_LIBRARY_ID;
  const tokenKey = process.env.BUNNY_TOKEN_KEY;
  const hostname = process.env.BUNNY_HOSTNAME || 'vz-cdn.net';

  // Check if Bunny credentials are configured
  if (!libraryId || !tokenKey || !videoId || videoId.startsWith('REPLACE_WITH_BUNNY')) {
    return {
      isConfigured: false,
      videoId: videoId || 'demo-placeholder',
      playbackUrl: '/videos/sample-dev.mp4',
      isDevelopmentPlaceholder: true,
      message: 'Bunny.net video credentials or video ID not configured. Playing development preview video.',
    };
  }

  // Calculate expiration timestamp (in UNIX seconds)
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;

  // 1. Generate embed token: SHA256(tokenKey + videoId + expires)
  const embedHashString = `${tokenKey}${videoId}${expires}`;
  const embedToken = crypto.createHash('sha256').update(embedHashString).digest('hex');
  const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${embedToken}&expires=${expires}&autoplay=false&preload=true`;

  // 2. Generate HLS direct playlist token
  const path = `/${videoId}/playlist.m3u8`;
  const hlsHashString = `${tokenKey}${path}${expires}`;
  const hlsToken = crypto
    .createHash('sha256')
    .update(hlsHashString)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const playbackUrl = `https://${hostname}/${videoId}/playlist.m3u8?token=${hlsToken}&expires=${expires}`;

  return {
    isConfigured: true,
    videoId,
    playbackUrl,
    embedUrl,
    token: embedToken,
    expires,
    isDevelopmentPlaceholder: false,
  };
}
