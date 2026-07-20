export type Project = {
  title: string;
  githubUrl?: string;
  videoSrc: string;
  videoLabel: string;
  videoFit?: "cover" | "contain";
  description: string;
  techStack: string[];
  emphasis: string;
};

export const projects: Project[] = [
  {
    title: "THRIVE Knowledge Assessment Platform",
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
    title: "Job Tracker API",
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
    githubUrl: "https://github.com/Dexter2099/xray-pneumonia-classifier",
    videoSrc: "/videos/xray-classifier-demo.mp4",
    videoLabel: "X-Ray Pneumonia Classifier demo reel",
    description:
      "A PyTorch CNN that classifies chest X-rays as pneumonia or normal, with training, evaluation, a Streamlit demo, and Grad-CAM visualisations to explain model focus areas.",
    techStack: ["Python", "PyTorch", "Computer Vision", "Grad-CAM", "Flask", "Machine Learning"],
    emphasis:
      "Model inference, medical image classification, visual explanation, and interview-ready ML project communication."
  }
];
