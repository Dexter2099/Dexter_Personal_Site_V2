import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("home page keeps supporting intro content outside the vertically-centered hero", async () => {
  const homePage = await read("src/pages/index.astro");

  assert.match(homePage, /import HomeSocialLinks from "\.\.\/components\/react\/HomeSocialLinks\.jsx";/);
  assert.match(homePage, /import HomeSupportingContent from "\.\.\/components\/react\/HomeSupportingContent\.jsx";/);
  assert.match(homePage, /import\s+\{\s*techStack\s*\}\s+from "\.\.\/data\/tech";/);
  assert.match(homePage, /import\s+\{\s*getSpotifyTopTracks\s*\}\s+from "\.\.\/lib\/spotify";/);
  assert.match(homePage, /const\s+topTracks\s*=\s*await\s+getSpotifyTopTracks\(3\);/);
  assert.match(homePage, /<HomeSocialLinks\s+client:only="react"[^>]*socialLinks=\{socialLinks\}/s);
  assert.match(homePage, /<HomeSupportingContent\s+client:only="react"[^>]*techStack=\{techStack\}[^>]*initialTracks=\{topTracks\}/s);
  assert.doesNotMatch(homePage, /<TechStack showHeading=\{false\}\s*\/>/);
  assert.doesNotMatch(homePage, /<SpotifyCard\s*\/>/);

  const heroStart = homePage.indexOf('<section class="hero home-hero"');
  const socialLinks = homePage.indexOf("<HomeSocialLinks");
  const heroEnd = homePage.indexOf("</section>", socialLinks);
  const supportingContent = homePage.indexOf("<HomeSupportingContent");

  assert.ok(heroStart >= 0);
  assert.ok(socialLinks > heroStart);
  assert.ok(heroEnd > socialLinks);
  assert.ok(supportingContent > heroEnd);
});

test("hero title dispatches a completion event for the next home-page animation stage", async () => {
  const heroTitleEffect = await read("src/components/react/HeroTitleEffect.jsx");

  assert.match(heroTitleEffect, /HERO_TITLE_EFFECT_COMPLETE_EVENT/);
  assert.match(heroTitleEffect, /window\.dispatchEvent\(new Event\(HERO_TITLE_EFFECT_COMPLETE_EVENT\)\)/);
  assert.match(heroTitleEffect, /window\.setTimeout\(notifyTitleComplete,\s*0\)/);
});

test("home intro content animates once after the hero title and then renders final state", async () => {
  const sequence = await read("src/components/react/home-intro-sequence.js");
  const socialLinks = await read("src/components/react/HomeSocialLinks.jsx");
  const supportingContent = await read("src/components/react/HomeSupportingContent.jsx");

  assert.match(sequence, /HOME_CONTENT_EFFECT_PLAYED_KEY/);
  assert.match(sequence, /HERO_TITLE_EFFECT_COMPLETE_EVENT/);
  assert.match(sequence, /sessionStorage\.getItem\(HOME_CONTENT_EFFECT_PLAYED_KEY\)/);
  assert.match(sequence, /sessionStorage\.setItem\(HOME_CONTENT_EFFECT_PLAYED_KEY,\s*"true"\)/);
  assert.match(sequence, /addEventListener\(HERO_TITLE_EFFECT_COMPLETE_EVENT,\s*handleHeroComplete\)/);
  assert.match(sequence, /const\s+shouldAnimate\s*=\s*isReady\s*&&\s*!hasPlayed;/);
  assert.match(sequence, /return\s+\{\s*isReady,\s*shouldAnimate,\s*markIntroComplete\s*\}/s);

  assert.match(socialLinks, /import\s+\{\s*AnimatedGroup\s*\}\s+from "\.\/animated-group";/);
  assert.match(socialLinks, /useHomeIntroSequence/);
  assert.doesNotMatch(socialLinks, /if\s*\(!isReady\)\s*\{\s*return null;\s*\}/);
  assert.match(socialLinks, /const\s+reservedSocialStyle\s*=\s*isReady\s*\?\s*undefined\s*:\s*\{\s*visibility:\s*"hidden"/s);
  assert.match(socialLinks, /<AnimatedGroup[^>]*className="hero__links home-socials"[^>]*preset="scale"[^>]*trigger=\{shouldAnimate\}/s);
  assert.match(socialLinks, /key=\{isReady\s*\?\s*"ready"\s*:\s*"reserved"\}/);
  assert.match(socialLinks, /style=\{reservedSocialStyle\}/);
  assert.match(socialLinks, /aria-hidden=\{!isReady\}/);

  assert.match(supportingContent, /import\s+\{\s*AnimatedGroup\s*\}\s+from "\.\/animated-group";/);
  assert.match(supportingContent, /useHomeIntroSequence/);
  assert.match(supportingContent, /<section className="home-supporting-content" aria-label="Home supporting content">/);
  assert.match(supportingContent, /<AnimatedGroup[^>]*className="tech-stack__list"[^>]*preset="scale"[^>]*trigger=\{shouldAnimate\}/s);
  assert.match(supportingContent, /filter:\s*"blur\(12px\)"/);
  assert.match(supportingContent, /y:\s*-60/);
  assert.match(supportingContent, /rotateX:\s*90/);
  assert.match(supportingContent, /<AnimatedGroup[^>]*className="spotify-card__list"[^>]*variants=\{spotifyVariants\}[^>]*trigger=\{shouldAnimate\}[^>]*onAnimationComplete=\{markIntroComplete\}/s);
  assert.match(supportingContent, /fetch\(SPOTIFY_ENDPOINT/);
  assert.match(supportingContent, /setTracks\(tracks\)/);
});

test("AnimatedGroup keeps children rendered in final state when trigger is false", async () => {
  const animatedGroup = await read("src/components/react/animated-group.jsx");

  assert.match(animatedGroup, /export function AnimatedGroup/);
  assert.match(animatedGroup, /presetVariants/);
  assert.match(animatedGroup, /scale:/);
  assert.match(animatedGroup, /initial=\{trigger\s*\?\s*"hidden"\s*:\s*false\}/);
  assert.doesNotMatch(animatedGroup, /\{trigger\s*&&\s*\(/);
});
