export interface SpotifyTopTrack {
  title: string;
  artists: string;
  url: string | null;
  albumImageUrl: string | null;
  albumName: string | null;
  isFallback?: boolean;
}

interface SpotifyTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
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

const fallbackTracks: SpotifyTopTrack[] = [
  "Spotify top tracks unavailable",
  "Recent listens unavailable",
  "Top song data unavailable",
  "Spotify refresh pending",
  "Check back soon"
].map((title) => ({
  title,
  artists: "Spotify",
  url: null,
  albumImageUrl: null,
  albumName: null,
  isFallback: true
}));

function getRequiredSpotifyEnv() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    throw new Error("Missing Spotify environment variables.");
  }

  return {
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    refreshToken: SPOTIFY_REFRESH_TOKEN
  };
}

async function requestSpotifyAccessToken(): Promise<string> {
  const { clientId, clientSecret, refreshToken } = getRequiredSpotifyEnv();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

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
  : never): string | null {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  return images.find((image) => image.width === 300)?.url ?? images[0]?.url ?? null;
}

export async function getSpotifyTopTracks(limit = 5): Promise<SpotifyTopTrack[]> {
  try {
    const accessToken = await requestSpotifyAccessToken();
    const url = new URL(SPOTIFY_TOP_TRACKS_URL);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("time_range", "short_term");

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Spotify top tracks request failed with status ${response.status}.`);
    }

    const data = (await response.json()) as SpotifyTopTracksResponse;
    const tracks = data.items?.slice(0, limit).map((track) => ({
      title: track.name ?? "Untitled track",
      artists: track.artists?.map((artist) => artist.name).filter(Boolean).join(", ") || "Unknown artist",
      url: track.external_urls?.spotify ?? null,
      albumImageUrl: pickAlbumImage(track.album?.images),
      albumName: track.album?.name ?? null
    })) ?? [];

    return tracks.length > 0 ? tracks : fallbackTracks;
  } catch (error) {
    console.warn("Spotify top tracks unavailable; rendering fallback rows.", error instanceof Error ? error.message : error);
    return fallbackTracks;
  }
}
