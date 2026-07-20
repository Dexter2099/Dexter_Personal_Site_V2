import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("THRIVE Knowledge Assessment Platform is the first private project card", async () => {
  const projects = await read("src/data/projects.ts");
  const projectCard = await read("src/components/ProjectCard.astro");

  const kapIndex = projects.indexOf('title: "THRIVE Knowledge Assessment Platform"');
  const jobTrackerIndex = projects.indexOf('title: "Job Tracker API"');

  assert.ok(kapIndex >= 0, "KAP project must exist");
  assert.ok(jobTrackerIndex > kapIndex, "KAP project must appear above Job Tracker");
  assert.match(
    projects,
    /A self-hosted training and certification platform developed for members of the THRIVE Project\./
  );
  assert.match(
    projects,
    /Role-scoped learner and administrator workflows, secure assessment delivery, immutable attempt records, reporting, testing, and deployment-ready architecture\./
  );
  assert.match(
    projects,
    /techStack: \["TypeScript", "React", "Express", "PostgreSQL", "Drizzle", "Docker Compose", "Nginx", "Vitest"\]/
  );
  assert.match(projects, /videoSrc: "\/videos\/kap-superquiz-demo\.mp4"/);
  assert.match(projects, /githubUrl\?: string;/);
  assert.match(projectCard, /project\.githubUrl\s*&&\s*\(/);
  assert.match(projectCard, /href=\{project\.githubUrl\}/);
  assert.ok(existsSync(new URL("../public/videos/kap-superquiz-demo.mp4", import.meta.url)));
});

test("KAP preserves its widescreen video frame and uses the revised description", async () => {
  const projects = await read("src/data/projects.ts");
  const projectCard = await read("src/components/ProjectCard.astro");
  const css = await read("src/styles/global.css");

  assert.match(projects, /videoFit\?: "cover" \| "contain";/);
  assert.match(projects, /videoFit: "contain"/);
  assert.match(
    projects,
    /A self-hosted training and certification platform developed for members of the THRIVE Project\./
  );
  assert.doesNotMatch(projects, /A real, self-hosted training and certification platform being developed/);
  assert.match(projectCard, /"project-card__video--contain": project\.videoFit === "contain"/);
  assert.match(css, /\.project-card__video--contain\s*\{[^}]*object-fit:\s*contain;/s);
});
