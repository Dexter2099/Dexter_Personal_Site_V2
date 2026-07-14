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

test("home intro sections start together and animate once per session", async () => {
  const heroTitleEffect = await read("src/components/react/HeroTitleEffect.jsx");
  const sequence = await read("src/components/react/home-intro-sequence.js");
  const socialLinks = await read("src/components/react/HomeSocialLinks.jsx");
  const supportingContent = await read("src/components/react/HomeSupportingContent.jsx");

  assert.doesNotMatch(heroTitleEffect, /HERO_TITLE_EFFECT_COMPLETE_EVENT/);
  assert.doesNotMatch(heroTitleEffect, /dispatchEvent/);
  assert.match(sequence, /HOME_CONTENT_EFFECT_PLAYED_KEY/);
  assert.match(sequence, /sessionStorage\.getItem\(HOME_CONTENT_EFFECT_PLAYED_KEY\)/);
  assert.match(sequence, /sessionStorage\.setItem\(HOME_CONTENT_EFFECT_PLAYED_KEY,\s*"true"\)/);
  assert.match(sequence, /const\s+shouldAnimate\s*=\s*!hasPlayed;/);
  assert.match(sequence, /return\s+\{\s*shouldAnimate,\s*markIntroComplete\s*\}/s);
  assert.doesNotMatch(sequence, /HERO_TITLE_EFFECT_COMPLETE_EVENT/);
  assert.doesNotMatch(sequence, /HOME_SOCIAL_LINKS_EFFECT_COMPLETE_EVENT/);
  assert.doesNotMatch(sequence, /addEventListener/);

  assert.match(socialLinks, /import\s+\{\s*AnimatedGroup\s*\}\s+from "\.\/animated-group";/);
  assert.match(socialLinks, /useHomeIntroSequence/);
  assert.match(socialLinks, /<AnimatedGroup[^>]*className="hero__links home-socials"[^>]*preset="scale"[^>]*trigger=\{shouldAnimate\}/s);
  assert.doesNotMatch(socialLinks, /reservedSocialStyle/);
  assert.doesNotMatch(socialLinks, /HOME_SOCIAL_LINKS_EFFECT_COMPLETE_EVENT/);
  assert.doesNotMatch(socialLinks, /onAnimationComplete=/);

  assert.match(supportingContent, /import\s+\{\s*AnimatedGroup\s*\}\s+from "\.\/animated-group";/);
  assert.match(supportingContent, /import\s+\{\s*motion\s*\}\s+from "motion\/react";/);
  assert.match(supportingContent, /useHomeIntroSequence/);
  assert.match(supportingContent, /<section className="home-supporting-content" aria-label="Home supporting content">/);
  assert.match(supportingContent, /<AnimatedGroup[^>]*className="tech-stack__list"[^>]*preset="scale"[^>]*trigger=\{shouldAnimate\}[^>]*onAnimationComplete=\{shouldAnimate\s*\?\s*markIntroComplete\s*:\s*undefined\}/s);
  assert.match(supportingContent, /filter:\s*"blur\(12px\)"/);
  assert.match(supportingContent, /y:\s*-60/);
  assert.match(supportingContent, /rotateX:\s*90/);
  assert.match(supportingContent, /<motion\.div[^>]*className="home-card__header"[^>]*initial=\{shouldAnimate/s);
  assert.match(supportingContent, /<AnimatedGroup[^>]*className="spotify-card__list"[^>]*variants=\{spotifyVariants\}[^>]*trigger=\{shouldAnimate\}/s);
  assert.doesNotMatch(supportingContent, /areSocialLinksComplete|isTechStackComplete|isSpotifyHeaderComplete/);
  assert.doesNotMatch(supportingContent, /HOME_SOCIAL_LINKS_EFFECT_COMPLETE_EVENT/);
  assert.match(supportingContent, /fetch\(SPOTIFY_ENDPOINT/);
  assert.match(supportingContent, /setTracks\(tracks\)/);
});

test("concurrent home intro finishes in approximately 2 seconds", async () => {
  const heroTitleEffect = await read("src/components/react/HeroTitleEffect.jsx");
  const socialLinks = await read("src/components/react/HomeSocialLinks.jsx");
  const supportingContent = await read("src/components/react/HomeSupportingContent.jsx");

  assert.doesNotMatch(heroTitleEffect, /delay=/);
  assert.match(heroTitleEffect, /staggerChildren:\s*0\.1/);
  assert.match(heroTitleEffect, /duration:\s*0\.4/);
  assert.match(socialLinks, /staggerChildren:\s*0\.15/);
  assert.match(socialLinks, /duration:\s*0\.7/);
  assert.match(supportingContent, /staggerChildren:\s*0\.12/);
  assert.match(supportingContent, /duration:\s*0\.68/);
  assert.match(supportingContent, /transition=\{\{ duration:\s*0\.8 \}\}/);
  assert.match(supportingContent, /delayChildren:\s*0/);
  assert.match(supportingContent, /staggerChildren:\s*0\.15/);
  assert.match(supportingContent, /duration:\s*0\.7/);

  const stageDurations = [
    (17 - 1) * 0.1 + 0.4,
    (3 - 1) * 0.15 + 0.7,
    (12 - 1) * 0.12 + 0.68,
    0.8,
    (3 - 1) * 0.15 + 0.7
  ];

  assert.ok(Math.abs(Math.max(...stageDurations) - 2) < 0.001);
});

test("AnimatedGroup keeps children rendered in final state when trigger is false", async () => {
  const animatedGroup = await read("src/components/react/animated-group.jsx");

  assert.match(animatedGroup, /export function AnimatedGroup/);
  assert.match(animatedGroup, /presetVariants/);
  assert.match(animatedGroup, /scale:/);
  assert.match(animatedGroup, /initial=\{trigger\s*\?\s*"hidden"\s*:\s*false\}/);
  assert.doesNotMatch(animatedGroup, /\{trigger\s*&&\s*\(/);
});
