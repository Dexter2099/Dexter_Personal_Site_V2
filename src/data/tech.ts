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
  "M21.76 11.196c0 5.39-4.372 9.761-9.761 9.761-3.58 0-6.709-1.928-8.4-4.804l1.851-1.064a7.547 7.547 0 0 0 6.549 3.794 7.55 7.55 0 0 0 7.545-7.687c-.073-4.107-3.458-7.403-7.565-7.373-1.863.014-3.563.713-4.85 1.852l2.297 2.297H2.24V1.088l2.415 2.415A9.726 9.726 0 0 1 12 .435c5.389 0 9.76 4.371 9.76 9.761Z";

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
