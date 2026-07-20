import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("experience timeline adds SafeTrase then THRIVE with a clickable project link", async () => {
  const experience = await read("src/data/experience.ts");
  const timeline = await read("src/components/Timeline.astro");

  const safeTraseIndex = experience.indexOf('title: "Internship at SafeTrase"');
  const thriveIndex = experience.indexOf('title: "Volunteer Full Stack Developer at the THRIVE Project"');
  const delvifyIndex = experience.indexOf('title: "Internship at Delvify.ai"');

  assert.ok(safeTraseIndex >= 0, "SafeTrase entry must exist");
  assert.ok(thriveIndex > safeTraseIndex, "THRIVE must appear below SafeTrase");
  assert.ok(delvifyIndex > thriveIndex, "Delvify must remain below the two new entries");

  assert.match(experience, /meta: "The Advisory Network \| Mobile, web and backend development"/);
  assert.match(experience, /Develop the Stage 1 SafeTrase MVP across an Expo\/React Native mobile app, Next\.js admin portal, and Supabase\/PostgreSQL backend using TypeScript\./);
  assert.match(experience, /meta: "KAP SuperQuiz \| Remote"/);
  assert.match(experience, /Develop a self-hosted assessment platform using TypeScript, React, Express, PostgreSQL\/Drizzle, Docker Compose, and Nginx/);

  assert.match(experience, /label: "THRIVE Project"/);
  assert.match(experience, /href: "https:\/\/thrivabilitymatters\.org\/"/);
  assert.match(timeline, /typeof bullet === "string"/);
  assert.match(timeline, /<a href=\{bullet\.link\.href\}[^>]*>\{bullet\.link\.label\}<\/a>/s);
});

test("SafeTrase and THRIVE entries render their supplied logos", async () => {
  const experience = await read("src/data/experience.ts");

  assert.match(experience, /logo: "\/images\/advisory-network-logo\.png"/);
  assert.match(experience, /logoAlt: "The Advisory Network logo"/);
  assert.match(experience, /logo: "\/images\/thrive-logo\.png"/);
  assert.match(experience, /logoAlt: "THRIVE Project logo"/);
  assert.ok(existsSync(new URL("../public/images/advisory-network-logo.png", import.meta.url)));
  assert.ok(existsSync(new URL("../public/images/thrive-logo.png", import.meta.url)));
});
