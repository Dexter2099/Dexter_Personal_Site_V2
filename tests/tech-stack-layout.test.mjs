import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("home tech stack uses the requested ordered stack", async () => {
  const tech = await read("src/data/tech.ts");
  const expectedNames = [
    "Python",
    "FastAPI",
    "SQLAlchemy",
    "PostgreSQL",
    "pytest",
    "Docker",
    "GitHub Actions",
    "TypeScript",
    "React",
    "Tailwind CSS",
    "PyTorch",
    "Google Cloud"
  ];

  const actualNames = Array.from(tech.matchAll(/\{\s*name:\s*"([^"]+)"/g), (match) => match[1]);

  assert.deepEqual(actualNames, expectedNames);
  assert.match(tech, /siGooglecloud/);
  assert.match(tech, /siPytest/);
  assert.match(tech, /siTailwindcss/);
});

test("desktop tech stack is icon-only while preserving header and link sizing", async () => {
  const css = await read("src/styles/global.css");

  assert.match(css, /\.home-hero__content\s*\{[^}]*transform:\s*translateY\(clamp\(8rem,\s*18vh,\s*13rem\)\);/s);
  assert.match(css, /\.hero__links\s*\{[^}]*margin-top:\s*1rem;/s);
  assert.match(css, /\.home-social-link\s*\{[^}]*width:\s*3rem;[^}]*height:\s*3rem;/s);
  assert.match(css, /\.home-social-link__icon\s*\{[^}]*width:\s*2rem;[^}]*height:\s*2rem;/s);

  assert.match(css, /\.site-shell:has\(\.home-page\)\s+\.site-footer\s*\{[^}]*display:\s*none;/s);
  assert.match(css, /\.site-shell:has\(\.home-page\)\s+\.site-main\s*\{[^}]*padding-bottom:\s*0;/s);
  assert.match(css, /\.site-shell:has\(\.home-page\)\s+\.home-page\s*\{[^}]*padding-bottom:\s*0;/s);
  assert.match(css, /\.home-supporting-content\s*\{[^}]*gap:\s*clamp\(0\.8rem,\s*1\.5vh,\s*1\.1rem\);[^}]*margin-top:\s*clamp\(4\.5rem,\s*6vh,\s*5rem\);/s);
  assert.match(css, /\.tech-stack__list\s*\{[^}]*flex-wrap:\s*wrap;[^}]*gap:\s*clamp\(0\.85rem,\s*1\.7vw,\s*1\.2rem\);[^}]*row-gap:\s*0\.55rem;[^}]*padding:\s*0\.35rem 0 0\.65rem;/s);
  assert.match(css, /\.tech-stack__chip\s*\{[^}]*width:\s*2\.25rem;[^}]*height:\s*2\.25rem;[^}]*flex:\s*0 0 2\.25rem;[^}]*border:\s*0;[^}]*background:\s*transparent;/s);
  assert.match(css, /\.tech-stack__icon svg\s*\{[^}]*width:\s*1\.7rem;[^}]*height:\s*1\.7rem;/s);
  assert.match(css, /\.spotify-card__list\s*\{[^}]*gap:\s*0\.25rem;[^}]*padding:\s*0\.45rem 0 0;/s);
  assert.match(css, /\.spotify-card__row\s*\{[^}]*padding:\s*0\.2rem 0\.2rem;/s);
});

test("on rotation heading keeps a readable mobile minimum and the current desktop maximum", async () => {
  const css = await read("src/styles/global.css");

  assert.match(
    css,
    /\.spotify-card \.home-card__header h2\s*\{[^}]*font-size:\s*clamp\(1\.2rem,\s*2\.49vw,\s*1\.5rem\);/s
  );
});
