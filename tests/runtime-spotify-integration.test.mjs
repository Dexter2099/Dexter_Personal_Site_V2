import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Cloudflare Pages Spotify function fetches server-side data without exposing secrets", async () => {
  const source = await read("functions/api/spotify.ts");

  assert.match(source, /export\s+const\s+onRequestGet/);
  assert.match(source, /context\.env\.SPOTIFY_CLIENT_ID/);
  assert.match(source, /context\.env\.SPOTIFY_CLIENT_SECRET/);
  assert.match(source, /context\.env\.SPOTIFY_REFRESH_TOKEN/);
  assert.doesNotMatch(source, /process\.env/);
  assert.match(source, /https:\/\/accounts\.spotify\.com\/api\/token/);
  assert.match(source, /https:\/\/api\.spotify\.com\/v1\/me\/top\/tracks/);
  assert.match(source, /time_range["']?\s*,\s*["']short_term/);
  assert.match(source, /limit["']?\s*,\s*String\(SPOTIFY_TRACK_LIMIT\)/);
});

test("Cloudflare Pages Spotify function returns normalized tracks with 30 minute caching", async () => {
  const source = await read("functions/api/spotify.ts");

  for (const field of ["title", "artists", "albumImageUrl", "url", "albumName"]) {
    assert.match(source, new RegExp(`${field}:`));
  }

  assert.match(source, /const\s+SPOTIFY_TRACK_LIMIT\s*=\s*3/);
  assert.match(source, /const\s+CACHE_SECONDS\s*=\s*30\s*\*\s*60/);
  assert.match(source, /Cache-Control/);
  assert.match(source, /s-maxage=\$\{CACHE_SECONDS\}/);
  assert.match(source, /stale-while-revalidate=300/);
  assert.match(source, /caches\.default/);
});

test("Spotify card keeps static fallback HTML and hydrates from the runtime API", async () => {
  const component = await read("src/components/SpotifyCard.astro");

  assert.match(component, /const\s+topTracks\s*=\s*await\s+getSpotifyTopTracks\(3\)/);
  assert.match(component, /data-spotify-track-list/);
  assert.match(component, /data-spotify-endpoint="\/api\/spotify"/);
  assert.match(component, /fetch\(endpoint/);
  assert.match(component, /replaceChildren\(\.\.\.rows\)/);
  assert.match(component, /createElement/);
  assert.doesNotMatch(component, /innerHTML\s*=/);
  assert.match(component, /catch\s*\{/);
});
