import {
  siDocker,
  siFastapi,
  siGithubactions,
  siGooglecloud,
  siPostgresql,
  siPython,
  siPytest,
  siReact,
  siSqlalchemy,
  siTailwindcss,
  siTypescript
} from "simple-icons";

export type TechItem = {
  name: string;
  iconPath?: string;
  iconFallback?: "ai";
};

const pytorchIconPath =
  "M12.005 0 4.952 7.053a9.865 9.865 0 0 0 0 14.022 9.866 9.866 0 0 0 14.022 0c3.984-3.9 3.986-10.205.085-14.023l-1.744 1.743c2.904 2.905 2.904 7.634 0 10.538s-7.634 2.904-10.538 0-2.904-7.634 0-10.538l4.647-4.646.582-.665Zm3.568 3.899a1.327 1.327 0 0 0-1.327 1.327 1.327 1.327 0 0 0 1.327 1.328A1.327 1.327 0 0 0 16.9 5.226 1.327 1.327 0 0 0 15.573 3.9Z";

// Codex mark: https://devicons.io/devicons/icons/codex-icon.svg
const codexIconPath =
  "M9.064 3.344a4.6 4.6 0 0 1 2.285-.312q1.5.173 2.673 1.275.016.015.037.021a.1.1 0 0 0 .043 0 4.55 4.55 0 0 1 3.046.275l.047.022.116.057a4.58 4.58 0 0 1 2.188 2.399q.313.765.315 1.595a4.2 4.2 0 0 1-.134 1.223.12.12 0 0 0 .03.115q.89.91 1.183 2.17.433 2.138-.887 3.854l-.136.166a4.55 4.55 0 0 1-2.201 1.388.12.12 0 0 0-.081.076c-.191.551-.383 1.023-.74 1.494-.9 1.187-2.222 1.846-3.711 1.838q-1.78-.009-3.157-1.302a.11.11 0 0 0-.105-.024c-.388.125-.78.143-1.204.138a4.44 4.44 0 0 1-1.945-.466 4.54 4.54 0 0 1-1.61-1.335c-.152-.202-.303-.392-.414-.617a6 6 0 0 1-.37-.961 4.6 4.6 0 0 1-.014-2.298.1.1 0 0 0 .006-.056.1.1 0 0 0-.027-.048 4.5 4.5 0 0 1-1.034-1.651 3.9 3.9 0 0 1-.251-1.192 5.2 5.2 0 0 1 .141-1.6Q3.659 7.92 5.086 6.97q.318-.212.601-.33a6 6 0 0 1 .646-.227.1.1 0 0 0 .065-.066 4.5 4.5 0 0 1 .829-1.615 4.54 4.54 0 0 1 1.837-1.388m3.482 10.565a.637.637 0 0 0 0 1.272h3.636a.637.637 0 1 0 0-1.272zM8.462 9.23a.637.637 0 0 0-1.106.631l1.272 2.224-1.266 2.136a.636.636 0 1 0 1.095.649l1.454-2.455a.64.64 0 0 0 .005-.64z";

export const techStackReviewed = "2026-11-17";

export const techStack: TechItem[] = [
  { name: "Python", iconPath: siPython.path },
  { name: "FastAPI", iconPath: siFastapi.path },
  { name: "SQLAlchemy", iconPath: siSqlalchemy.path },
  { name: "PostgreSQL", iconPath: siPostgresql.path },
  { name: "pytest", iconPath: siPytest.path },
  { name: "Docker", iconPath: siDocker.path },
  { name: "GitHub Actions", iconPath: siGithubactions.path },
  { name: "TypeScript", iconPath: siTypescript.path },
  { name: "React", iconPath: siReact.path },
  { name: "Tailwind CSS", iconPath: siTailwindcss.path },
  { name: "AI assisted development (Codex)", iconPath: codexIconPath },
  { name: "Google Cloud", iconPath: siGooglecloud.path }
];

// Keep the Experience page unchanged by the homepage-only replacement.
export const experienceTechStack: TechItem[] = techStack.map((tech) =>
  tech.name === "AI assisted development (Codex)"
    ? { ...tech, name: "PyTorch", iconPath: pytorchIconPath }
    : tech
);
