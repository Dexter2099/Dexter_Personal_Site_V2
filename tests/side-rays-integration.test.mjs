import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("SideRays dependencies and Astro React integration are configured", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  const astroConfig = await read("astro.config.mjs");

  for (const dependency of ["@astrojs/react", "react", "react-dom", "ogl"]) {
    assert.ok(dependencies[dependency], `${dependency} is missing from package.json`);
  }

  assert.match(astroConfig, /@astrojs\/react/);
  assert.match(astroConfig, /integrations:\s*\[\s*react\(\)\s*\]/s);
});

test("BaseLayout renders the decorative SideRays background behind page content", async () => {
  const layout = await read("src/layouts/BaseLayout.astro");
  const importIndex = layout.indexOf('import SideRaysBackground from "../components/SideRaysBackground.astro";');
  const backgroundIndex = layout.indexOf("<SideRaysBackground />");
  const shellIndex = layout.indexOf('<div class="site-shell">');

  assert.notEqual(importIndex, -1, "BaseLayout must import SideRaysBackground");
  assert.notEqual(backgroundIndex, -1, "BaseLayout must render SideRaysBackground");
  assert.ok(backgroundIndex < shellIndex, "SideRaysBackground should render before the content shell");
});

test("SideRays wrapper hydrates the React component with the requested subtle gold props", async () => {
  const wrapper = await read("src/components/SideRaysBackground.astro");

  assert.match(wrapper, /import SideRays from "\.\/react\/SideRays\.jsx";/);
  assert.match(wrapper, /class="side-rays-background"/);
  assert.match(wrapper, /aria-hidden="true"/);
  assert.match(wrapper, /client:idle/);
  assert.match(wrapper, /rayColor1="#F5EBC8"/);
  assert.match(wrapper, /rayColor2="#EAB308"/);
  assert.match(wrapper, /origin="top-right"/);
  assert.match(wrapper, /intensity=\{1\.35\}/);
  assert.match(wrapper, /spread=\{1\.25\}/);
  assert.match(wrapper, /saturation=\{1\.5\}/);
  assert.match(wrapper, /blend=\{0\.75\}/);
  assert.match(wrapper, /falloff=\{1\.6\}/);
  assert.match(wrapper, /opacity=\{0\.62\}/);
});

test("global stacking rules keep rays decorative and content interactive", async () => {
  const css = await read("src/styles/global.css");

  assert.match(css, /\.side-rays-background\s*\{[^}]*position:\s*fixed;/s);
  assert.match(css, /\.side-rays-background\s*\{[^}]*pointer-events:\s*none;/s);
  assert.match(css, /\.side-rays-background\s*\{[^}]*overflow:\s*hidden;/s);
  assert.match(css, /\.side-rays-background::before\s*\{[^}]*content:\s*"";/s);
  assert.match(css, /\.side-rays-background::before\s*\{[^}]*radial-gradient/s);
  assert.match(css, /\.side-rays-background::before\s*\{[^}]*opacity:\s*0\.5;/s);
  assert.doesNotMatch(css, /\.side-rays-background::after/);
  assert.doesNotMatch(css, /conic-gradient/);
  assert.doesNotMatch(css, /linear-gradient\(115deg/);
  assert.match(css, /\.side-rays-background astro-island\s*\{[^}]*display:\s*block;/s);
  assert.match(css, /\.side-rays-background astro-island\s*\{[^}]*width:\s*100%;/s);
  assert.match(css, /\.side-rays-background astro-island\s*\{[^}]*height:\s*100%;/s);
  assert.match(css, /\.site-shell\s*\{[^}]*position:\s*relative;[^}]*z-index:\s*1;/s);
  assert.match(css, /\.site-main\s*\{[^}]*position:\s*relative;[^}]*z-index:\s*1;/s);
  assert.match(css, /@media\s*\(max-width:\s*700px\)\s*\{[^}]*\.side-rays-background\s*\{[^}]*opacity:\s*0\.5;/s);
  assert.doesNotMatch(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\.side-rays-background\s*\{[^}]*display:\s*none;/s);
});

test("React SideRays component and CSS are present with non-layout-impacting container styles", async () => {
  const component = await read("src/components/react/SideRays.jsx");
  const componentCss = await read("src/components/react/SideRays.css");

  assert.match(component, /import\s+\{[^}]*Renderer[^}]*Program[^}]*Triangle[^}]*Mesh[^}]*\}\s+from\s+['"]ogl['"];/s);
  assert.match(component, /import ['"]\.\/SideRays\.css['"];/);
  assert.match(component, /const SideRays = \(/);
  assert.match(componentCss, /\.side-rays-container\s*\{[^}]*width:\s*100%;/s);
  assert.match(componentCss, /\.side-rays-container\s*\{[^}]*height:\s*100%;/s);
  assert.match(componentCss, /\.side-rays-container\s*\{[^}]*pointer-events:\s*none;/s);
  assert.match(componentCss, /\.side-rays-container\s*\{[^}]*overflow:\s*hidden;/s);
});
