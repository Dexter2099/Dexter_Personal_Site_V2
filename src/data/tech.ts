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

export const techStack: TechItem[] = [
  { name: "Python", iconPath: siPython.path },
  { name: "FastAPI", iconPath: siFastapi.path },
  { name: "PostgreSQL", iconPath: siPostgresql.path },
  { name: "SQLAlchemy", iconPath: siSqlalchemy.path },
  { name: "Docker", iconPath: siDocker.path },
  { name: "GitHub Actions", iconPath: siGithubactions.path },
  { name: "TypeScript", iconPath: siTypescript.path },
  { name: "React", iconPath: siReact.path },
  { name: "AI / LLM APIs", iconFallback: "ai" }
];
