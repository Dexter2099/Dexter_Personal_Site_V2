import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("desktop navigation hydrates the vertical Dock only above the mobile breakpoint", async () => {
  const sideNav = await read("src/components/SideNav.astro");

  assert.match(sideNav, /import Dock from "\.\/react\/Dock\.jsx";/);
  assert.match(sideNav, /class="site-nav site-nav--desktop"/);
  assert.match(sideNav, /<Dock[\s\S]*client:media="\(min-width: 761px\)"/);
  assert.match(sideNav, /items=\{navItems\}/);
  assert.match(sideNav, /currentPath=\{currentPath\}/);
  assert.match(sideNav, /distance=\{110\}/);
  assert.match(sideNav, /baseItemSize=\{52\}/);
  assert.match(sideNav, /magnification=\{68\}/);
});

test("mobile navigation keeps the existing static links and icon labels", async () => {
  const sideNav = await read("src/components/SideNav.astro");

  assert.match(sideNav, /class="site-nav site-nav--mobile"/);
  assert.match(sideNav, /<ul class="site-nav__list">/);
  assert.match(sideNav, /class:list=\{\["site-nav__link", \{ "site-nav__link--active": isCurrent\(item\.href\) \}\]\}/);
  assert.match(sideNav, /<span class="site-nav__label">\{item\.label\}<\/span>/);
});

test("Dock magnifies only icons while every navigation row keeps the same full width", async () => {
  const dock = await read("src/components/react/Dock.jsx");
  const dockCss = await read("src/components/react/Dock.css");
  const packageJson = JSON.parse(await read("package.json"));

  assert.ok(packageJson.dependencies.motion, "motion must remain available for Dock springs");
  assert.match(dock, /from "motion\/react"/);
  assert.match(dock, /const mouseY = useMotionValue\(Infinity\)/);
  assert.match(dock, /value - rect\.y - rect\.height \/ 2/);
  assert.match(dock, /onMouseMove=\{\(\{ clientY \}\) => mouseY\.set\(clientY\)\}/);
  assert.match(dock, /const targetScale = useTransform/);
  assert.match(dock, /magnification \/ baseItemSize/);
  assert.match(dock, /<li[\s\S]*style=\{\{ height: baseItemSize \}\}/);
  assert.doesNotMatch(dock, /style=\{\{ width: baseItemSize, height: baseItemSize \}\}/);
  assert.match(dockCss, /\.dock-item\s*\{[^}]*width:\s*100%;/s);
  assert.match(dockCss, /\.dock-item__link\s*\{[^}]*min-width:\s*0;/s);
  assert.match(dockCss, /\.dock-icon\s*\{[^}]*width:\s*1\.35rem;/s);
  assert.doesNotMatch(dockCss, /\.dock-icon\s*\{[^}]*width:\s*42%;/s);
  assert.match(dock, /<a[\s\S]*href=\{item\.href\}/);
  assert.match(dock, /<motion\.span[\s\S]*className="dock-icon"[\s\S]*style=\{\{ scale \}\}/);
  assert.match(dock, /<\/motion\.span>\s*<span className="dock-label">\{item\.label\}<\/span>/);
  assert.doesNotMatch(dock, /<motion\.li/);
  assert.doesNotMatch(dock, /<motion\.a/);
  assert.doesNotMatch(dock, /style=\{\{ width: size, height: size \}\}/);
  assert.match(dock, /aria-current=\{isCurrent \? "page" : undefined\}/);
});

test("Dock CSS keeps the desktop panel vertical and hides it at the mobile breakpoint", async () => {
  const dockCss = await read("src/components/react/Dock.css");
  const globalCss = await read("src/styles/global.css");

  assert.match(dockCss, /\.dock-panel\s*\{[^}]*flex-direction:\s*column;/s);
  assert.match(dockCss, /\.dock-panel\s*\{[^}]*background:\s*transparent;/s);
  assert.doesNotMatch(dockCss, /\.dock-item__link:hover\s*\{[^}]*background:/s);
  assert.match(globalCss, /\.site-nav--mobile\s*\{[^}]*display:\s*none;/s);
  assert.match(globalCss, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.site-nav--desktop\s*\{[^}]*display:\s*none;/s);
  assert.match(globalCss, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*\.site-nav--mobile\s*\{[^}]*display:\s*flex;/s);
});
