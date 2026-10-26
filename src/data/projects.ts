export type ProjectCategory = "professional" | "personal";

export const projectPages = {
  professional: {
    title: "Professional Projects",
    description: "Projects developed for organisations and independent release.",
    path: "/professional/",
    reviewed: "2026-10-19"
  },
  personal: {
    title: "Personal Projects",
    description: "Selected personal projects to showcase technical skills.",
    path: "/projects/",
    reviewed: "2026-10-19"
  }
} satisfies Record<ProjectCategory, { title: string; description: string; path: string; reviewed: string }>;

export type Project = {
  id?: string;
  reviewed?: string;
  category?: ProjectCategory;
  title: string;
  githubUrl?: string;
  demoUrl?: string;
  websiteUrl?: string;
  xUrl?: string;
  videoSrc: string;
  videoLabel: string;
  videoFit?: "cover" | "contain";
  description: string;
  techStack: string[];
  emphasis: string;
};

export const projects: Project[] = [
  {
    title: "SafeTrase Website",
    id: "safetrase-website",
    category: "professional",
    reviewed: "2026-10-19",
    websiteUrl: "https://safetrase.com/",
    videoSrc: "/videos/safetrase-website-analytics-5e980773.mp4",
    videoLabel: "SafeTrase website and Google Analytics 4 Home, showing active users, event count and the country map with account details hidden",
    videoFit: "contain",
    description:
      "Built SafeTrase’s responsive frontend with React and JavaScript, using Vite for development and production builds, and CSS for desktop and mobile layouts.",
    techStack: ["React", "JavaScript", "Vite", "CSS", "Google Analytics 4"],
    emphasis:
      "Integrated Brevo CRM for waitlist sign-ups and contact management. Configured Google Analytics 4 with visitor consent controls to measure page views, scrolling and waitlist-link clicks."
  },
  {
    title: "THRIVE Knowledge Assessment Platform",
    id: "kap",
    category: "professional",
    reviewed: "2026-10-19",
    videoSrc: "/videos/kap-superquiz-demo.mp4",
    videoLabel: "THRIVE Knowledge Assessment Platform demo reel",
    videoFit: "contain",
    description:
      "A self-hosted training and certification platform developed for members of the THRIVE Project. It supports authenticated learner assessments, question-bank and quiz-set management, attempt history, results, and administrator reporting.",
    techStack: ["TypeScript", "React", "Express", "PostgreSQL", "Drizzle", "Docker Compose", "Nginx", "Vitest"],
    emphasis:
      "Role-scoped learner and administrator workflows, secure assessment delivery, immutable attempt records, reporting, testing, and deployment-ready architecture."
  },
  {
    title: "OnboardFlow",
    id: "onboardflow",
    reviewed: "2026-10-26",
    githubUrl: "https://github.com/Dexter2099/client-onboarding-automation",
    demoUrl: "https://onboardflow.hostless.app/",
    videoSrc: "/videos/onboardflow-ai-demo-20261025-f4fd50f5.mp4",
    videoLabel: "OnboardFlow AI filling, source inspection, clarification and submission for human review; fictional data, sped-up demo",
    videoFit: "contain",
    description:
      "An AI onboarding app that drafts answers from client documents, shows supporting sources and asks for missing details before human submission. Built with React, C#/ASP.NET Core and PostgreSQL. The demo uses fictional data.",
    techStack: ["React", "TypeScript", "C#", "ASP.NET Core", "EF Core/Npgsql", "PostgreSQL", "Docker"],
    emphasis:
      "OWASP-aware security, practical SOLID principles and CI/CD with deployment gates and live checks."
  },
  {
    title: "Job Tracker API",
    id: "job-tracker",
    githubUrl: "https://github.com/Dexter2099/Job-Tracker",
    videoSrc: "/videos/job-tracker-demo.mp4",
    videoLabel: "Job Tracker API demo reel",
    description:
      "A production-style FastAPI backend for managing job applications, recruiter contacts, status history, follow-up reminders, weekly stats, and CSV exports, with PostgreSQL, Alembic migrations, Docker, pytest, and CI checks.",
    techStack: ["FastAPI", "PostgreSQL", "SQLAlchemy", "Alembic", "Docker", "pytest", "GitHub Actions"],
    emphasis:
      "Backend APIs, production fundamentals, database readiness, testing, and deployment hygiene."
  },
  {
    title: "Gspace Chat",
    id: "gspacechat",
    githubUrl: "https://github.com/Dexter2099/GspaceChat",
    videoSrc: "/videos/gspace-chat-demo.mp4",
    videoLabel: "Gspace Chat demo reel",
    description:
      "A grounded AI chat assistant for exploring Gilmour Space website content, built to answer project-specific questions with source-aware responses instead of generic chatbot output.",
    techStack: ["Python", "AI Integration", "APIs", "Frontend", "Retrieval", "UX"],
    emphasis:
      "AI application integration, source-grounded answers, user experience, and project-specific assistant behaviour."
  },
  {
    title: "X-Ray Pneumonia Classifier",
    id: "ml",
    githubUrl: "https://github.com/Dexter2099/xray-pneumonia-classifier",
    videoSrc: "/videos/xray-classifier-demo.mp4",
    videoLabel: "X-Ray Pneumonia Classifier demo reel",
    description:
      "A PyTorch CNN that classifies chest X-rays as pneumonia or normal, with training, evaluation, a Streamlit demo, and Grad-CAM visualisations to explain model focus areas.",
    techStack: ["Python", "PyTorch", "Computer Vision", "Grad-CAM", "Flask", "Machine Learning"],
    emphasis:
      "Model inference, medical image classification, visual explanation, and interview-ready ML project communication."
  },
  {
    title: "Mallet Mayhem '84",
    id: "mallet",
    category: "professional",
    reviewed: "2026-10-21",
    xUrl: "https://x.com/DeftMenaceGames",
    videoSrc: "/videos/mallet-mayhem-84-trailer-30s-cd9c4ab2.mp4",
    videoLabel: "Mallet Mayhem '84 coming soon trailer",
    videoFit: "contain",
    description:
      "Built an air-hockey sports simulation in Unreal Engine 5 and C++, taking the project from concept and physics research to tested production builds within two months.",
    techStack: ["Unreal Engine 5", "C++", "Codex", "Unreal MCP"],
    emphasis:
      "Used Codex and Unreal MCP to implement and refine gameplay systems, guiding development through physics research, iterative testing and build validation."
  }
];
