import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Mallet Mayhem '84 is the last featured project", async () => {
  const projects = await read("src/data/projects.ts");

  const xrayIndex = projects.indexOf('title: "X-Ray Pneumonia Classifier"');
  const malletIndex = projects.indexOf(`title: "Mallet Mayhem '84"`);

  assert.ok(xrayIndex >= 0, "X-Ray project must exist");
  assert.ok(malletIndex > xrayIndex, "Mallet Mayhem must appear after X-Ray");
  assert.equal(
    projects.slice(malletIndex).match(/title: /g)?.length,
    1,
    "Mallet Mayhem must be the final project"
  );
  assert.match(
    projects,
    /An air-hockey sports simulation game built in Unreal Engine 5 and C\+\+, developed from ideation and physics research through testing and production builds within two months\./
  );
  assert.match(
    projects,
    /Developed almost entirely by directing Codex and Unreal MCP in natural language\./
  );
  assert.match(projects, /techStack: \["Unreal Engine 5", "C\+\+", "Codex", "Unreal MCP"\]/);
  assert.match(projects, /videoSrc: "\/videos\/mallet-mayhem-84-demo-f8e60fd6\.mp4"/);
  assert.doesNotMatch(
    projects,
    /videoSrc: "\/videos\/mallet-mayhem-84-demo\.mp4"/,
    "Mallet Mayhem must use a versioned video URL so browsers cannot reuse the old sped-up asset"
  );
  assert.match(projects, /videoFit: "contain"/);
  assert.match(projects, /xUrl: "https:\/\/x\.com\/DeftMenaceGames"/);
  assert.ok(
    existsSync(
      new URL("../public/videos/mallet-mayhem-84-demo-f8e60fd6.mp4", import.meta.url)
    )
  );
});

test("project descriptions keep the complete C++ token on one line", async () => {
  const projectCard = await read("src/components/ProjectCard.astro");
  const globalStyles = await read("src/styles/global.css");

  assert.match(projectCard, /project\.description\.split\(\/\(C\\\+\\\+\)\/g\)/);
  assert.match(projectCard, /part === "C\+\+" \? <span class="project-card__no-wrap">/);
  assert.match(
    globalStyles,
    /\.project-card__no-wrap\s*\{\s*white-space:\s*nowrap;\s*\}/
  );
});

test("project cards render optional X links independently of GitHub links", async () => {
  const projectCard = await read("src/components/ProjectCard.astro");

  assert.match(projectCard, /\(project\.githubUrl \|\| project\.xUrl\) &&/);
  assert.match(projectCard, /project\.xUrl &&/);
  assert.match(projectCard, /href=\{project\.xUrl\}/);
  assert.match(projectCard, /View \$\{project\.title\} development updates on X/);
});
