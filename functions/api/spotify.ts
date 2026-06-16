interface SpotifyEnv {
  SPOTIFY_CLIENT_ID?: string;
  SPOTIFY_CLIENT_SECRET?: string;
  SPOTIFY_REFRESH_TOKEN?: string;
}

interface PagesFunctionContext {
  request: Request;
  env: SpotifyEnv;
  waitUntil?: (promise: Promise<unknown>) => void;
}

interface SpotifyTokenResponse {
  access_token?: string;
  error?: string;
}

interface SpotifyTopTracksResponse {
  items?: Array<{
    name?: string;
    external_urls?: {
      spotify?: string;
    };
    artists?: Array<{
      name?: string;
    }>;
    album?: {
      name?: string;
      images?: Array<{
        url?: string;
        height?: number | null;
        width?: number | null;
      }>;
    };
  }>;
}

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_TOP_TRACKS_URL = "https://api.spotify.com/v1/me/top/tracks";
const SPOTIFY_TRACK_LIMIT = 3;
const CACHE_SECONDS = 30 * 60;

function jsonResponse(body: unknown, status = 200, cache = false) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8"
  });

  if (cache) {
    headers.set("Cache-Control", `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=300`);
  } else {
    headers.set("Cache-Control", "no-store");
  }

  return new Response(JSON.stringify(body), {
    status,
    headers
  });
}

function requireSpotifyEnv(context: PagesFunctionContext) {
  const clientId = context.env.SPOTIFY_CLIENT_ID;
  const clientSecret = context.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = context.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Spotify environment variables are not configured.");
  }

  return {
    clientId,
    clientSecret,
    refreshToken
  };
}

async function requestSpotifyAccessToken(context: PagesFunctionContext) {
  const { clientId, clientSecret, refreshToken } = requireSpotifyEnv(context);
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken
    })
  });

  if (!response.ok) {
    throw new Error(`Spotify token request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as SpotifyTokenResponse;

  if (!data.access_token) {
    throw new Error("Spotify token response did not include an access token.");
  }

  return data.access_token;
}

function pickAlbumImage(images: NonNullable<SpotifyTopTracksResponse["items"]>[number]["album"] extends infer Album
  ? Album extends { images?: infer Images }
    ? Images
    : never
  : never) {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  return images.find((image) => image.width === 300)?.url ?? images[0]?.url ?? null;
}

async function fetchSpotifyTopTracks(context: PagesFunctionContext) {
  const accessToken = await requestSpotifyAccessToken(context);
  const url = new URL(SPOTIFY_TOP_TRACKS_URL);
  url.searchParams.set("time_range", "short_term");
  url.searchParams.set("limit", String(SPOTIFY_TRACK_LIMIT));

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Spotify top tracks request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as SpotifyTopTracksResponse;

  return data.items?.slice(0, SPOTIFY_TRACK_LIMIT).map((track) => ({
    title: track.name ?? "Untitled track",
    artists: track.artists?.map((artist) => artist.name).filter(Boolean).join(", ") || "Unknown artist",
    albumImageUrl: pickAlbumImage(track.album?.images),
    url: track.external_urls?.spotify ?? null,
    albumName: track.album?.name ?? null
  })) ?? [];
}

export const onRequestGet = async (context: PagesFunctionContext) => {
  const cacheRequest = new Request(context.request.url, {
    method: "GET"
  });

  const cachedResponse = await caches.default.match(cacheRequest);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const tracks = await fetchSpotifyTopTracks(context);
    const response = jsonResponse({ tracks }, 200, true);
    context.waitUntil?.(caches.default.put(cacheRequest, response.clone()));

    return response;
  } catch (error) {
    console.warn("Spotify runtime endpoint unavailable.", error instanceof Error ? error.message : error);

    return jsonResponse({
      error: "Spotify top tracks unavailable"
    }, 502);
  }
};
