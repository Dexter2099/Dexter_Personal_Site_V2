import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("contact page hydrates BorderGlow around the existing panel with the site palette", async () => {
  const contactPage = await read("src/pages/contact.astro");

  assert.match(contactPage, /import BorderGlow from "\.\.\/components\/react\/BorderGlow\.jsx";/);
  assert.match(contactPage, /<BorderGlow[\s\S]*client:load/);
  assert.match(contactPage, /className="contact-panel"/);
  assert.match(contactPage, /glowColor="46 65 52"/);
  assert.match(contactPage, /backgroundColor="#0D1016"/);
  assert.match(contactPage, /colors=\{\["#E8D68A", "#D4AF37", "#8A6A12"\]\}/);
  assert.match(contactPage, /edgeSensitivity=\{70\}/);
  assert.match(contactPage, /glowRadius=\{18\}/);
  assert.match(contactPage, /glowIntensity=\{0\.38\}/);
  assert.match(contactPage, /coneSpread=\{8\}/);
  assert.match(contactPage, /fillOpacity=\{0\}/);
  assert.match(contactPage, /animated=\{false\}/);
  assert.match(contactPage, /<h1 class="contact-title" id="contact-title">Get in Touch<\/h1>/);
  assert.match(contactPage, /<Button[\s\S]*label="Email"/);
});

test("BorderGlow implements pointer-responsive edge lighting with scoped styles", async () => {
  const component = await read("src/components/react/BorderGlow.jsx");
  const componentCss = await read("src/components/react/BorderGlow.css");

  assert.match(component, /import \{ useRef, useCallback, useEffect \} from "react";/);
  assert.match(component, /import "\.\/BorderGlow\.css";/);
  assert.match(component, /onPointerMove=\{handlePointerMove\}/);
  assert.match(component, /className=\{`border-glow-card \$\{className\}`\}/);
  assert.match(componentCss, /\.border-glow-card:not\(:hover\):not\(\.sweep-active\)::before/);
  assert.match(componentCss, /\.border-glow-card > \.edge-light/);
  assert.match(componentCss, /mask-image:\s*conic-gradient/s);
  assert.match(componentCss, /0 0 18px 1px var\(--glow-color-10\)/);
  assert.doesNotMatch(componentCss, /0 0 50px/);
});
