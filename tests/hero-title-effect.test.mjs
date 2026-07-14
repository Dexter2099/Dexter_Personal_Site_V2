import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("home hero renders a page-load per-character text effect for the title and role", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  const homePage = await read("src/pages/index.astro");
  const heroTitleEffect = await read("src/components/react/HeroTitleEffect.jsx");

  assert.ok(dependencies.motion, "motion is missing from package.json");
  assert.match(homePage, /import HeroTitleEffect from "\.\.\/components\/react\/HeroTitleEffect\.jsx";/);
  assert.match(homePage, /<HeroTitleEffect\s+client:only="react"\s*\/>/);
  assert.doesNotMatch(homePage, /<h1 id="home-title">Dexter Mehta<\/h1>/);
  assert.doesNotMatch(homePage, /<p class="hero__role">Backend Developer<\/p>/);

  assert.match(heroTitleEffect, /import\s+\{\s*TextEffect\s*\}\s+from\s+["']\.\/text-effect["'];/);
  assert.match(heroTitleEffect, /<TextEffect[^>]*as="h1"[^>]*per="char"[^>]*preset="fade"/s);
  assert.match(heroTitleEffect, /id="home-title"/);
  assert.match(heroTitleEffect, />\s*Dexter Mehta\s*<\/TextEffect>/s);
  assert.match(heroTitleEffect, /<TextEffect[^>]*as="p"[^>]*per="char"[^>]*preset="fade"/s);
  assert.match(heroTitleEffect, /className="hero__role"/);
  assert.doesNotMatch(heroTitleEffect, /delay=/);
  assert.match(heroTitleEffect, />\s*Backend Developer\s*<\/TextEffect>/s);
});

test("home hero records the animation and keeps the text-effect layout after the first run", async () => {
  const heroTitleEffect = await read("src/components/react/HeroTitleEffect.jsx");
  const textEffect = await read("src/components/react/text-effect.jsx");

  assert.match(heroTitleEffect, /HERO_TITLE_EFFECT_PLAYED_KEY/);
  assert.match(heroTitleEffect, /sessionStorage\.getItem\(HERO_TITLE_EFFECT_PLAYED_KEY\)/);
  assert.match(heroTitleEffect, /sessionStorage\.setItem\(HERO_TITLE_EFFECT_PLAYED_KEY,\s*"true"\)/);
  assert.match(heroTitleEffect, /const\s+shouldAnimate\s*=\s*!hasPlayed;/);
  assert.match(heroTitleEffect, /trigger=\{shouldAnimate\}/);
  assert.match(heroTitleEffect, /onAnimationComplete=\{handleAnimationComplete\}/);
  assert.doesNotMatch(heroTitleEffect, /<h1 id="home-title">Dexter Mehta<\/h1>/);
  assert.doesNotMatch(heroTitleEffect, /<p className="hero__role">Backend Developer<\/p>/);
  assert.doesNotMatch(textEffect, /\{trigger\s*&&\s*\(/);
  assert.match(textEffect, /initial=\{trigger\s*\?\s*"hidden"\s*:\s*false\}/);
});
