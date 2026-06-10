import {
  siDocker,
  siFastapi,
  siGithubactions,
  siPostgresql,
  siPython,
  siReact,
  siSqlalchemy,
  siTypescript
} from "simple-icons";

export type TechItem = {
  name: string;
  iconPath?: string;
  iconFallback?: "ai";
};

const pytorchIconPath =
  "M12.005 0 4.952 7.053a9.865 9.865 0 0 0 0 14.022 9.866 9.866 0 0 0 14.022 0c3.984-3.9 3.986-10.205.085-14.023l-1.744 1.743c2.904 2.905 2.904 7.634 0 10.538s-7.634 2.904-10.538 0-2.904-7.634 0-10.538l4.647-4.646.582-.665Zm3.568 3.899a1.327 1.327 0 0 0-1.327 1.327 1.327 1.327 0 0 0 1.327 1.328A1.327 1.327 0 0 0 16.9 5.226 1.327 1.327 0 0 0 15.573 3.9Z";

export const techStack: TechItem[] = [
  { name: "Python", iconPath: siPython.path },
  { name: "FastAPI", iconPath: siFastapi.path },
  { name: "PostgreSQL", iconPath: siPostgresql.path },
  { name: "SQLAlchemy", iconPath: siSqlalchemy.path },
  { name: "Docker", iconPath: siDocker.path },
  { name: "GitHub Actions", iconPath: siGithubactions.path },
  { name: "TypeScript", iconPath: siTypescript.path },
  { name: "React", iconPath: siReact.path },
  { name: "PyTorch", iconPath: pytorchIconPath }
];
