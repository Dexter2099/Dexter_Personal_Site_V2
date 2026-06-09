export type Project = {
  title: string;
  githubUrl: string;
  videoSrc: string;
  videoLabel: string;
  description: string;
  techStack: string[];
  emphasis: string;
};

export const projects: Project[] = [
  {
    title: "Job Tracker API",
    githubUrl: "https://github.com/Dexter2099/Job-Tracker",
    videoSrc: "/videos/job-tracker-demo.mp4",
    videoLabel: "Job Tracker API demo reel",
    description:
      "A backend-focused job application tracker built to demonstrate APIs, databases, testing, Docker, and production fundamentals.",
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
      "A chat-based project that demonstrates practical AI integration, retrieval-style answering, and user-facing software design.",
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
      "A machine learning project that classifies chest X-rays and uses Grad-CAM style visual explanations to show model focus areas.",
    techStack: ["Python", "PyTorch", "Computer Vision", "Grad-CAM", "Flask", "Machine Learning"],
    emphasis:
      "Model inference, medical image classification, visual explanation, and interview-ready ML project communication."
  }
];
