export type ExperienceEntry = {
  date: string;
  title: string;
  body: string;
  highlights: string[];
};

export const experienceEntries: ExperienceEntry[] = [
  {
    date: "2026",
    title: "Delvify internship",
    body: "Worked on backend/API features, authentication flows, structured data search, and AI-assisted product workflows.",
    highlights: [
      "Backend/API feature work",
      "Authentication flow support",
      "Structured product data search",
      "AI-assisted workflow exposure"
    ]
  },
  {
    date: "2025–2026",
    title: "Portfolio and production fundamentals",
    body: "Built backend projects to strengthen APIs, PostgreSQL, testing, Docker, deployment, and AI integration.",
    highlights: [
      "REST API design",
      "PostgreSQL-backed projects",
      "Testing and Docker workflows",
      "Deployment and production readiness"
    ]
  },
  {
    date: "2023–2025",
    title: "Computer science transition",
    body: "Completed a Master of Information Technology at QUT, focusing on programming, databases, software development, and AI-related systems.",
    highlights: [
      "Programming fundamentals",
      "Databases",
      "Software development",
      "AI-related systems"
    ]
  },
  {
    date: "2021–2024",
    title: "Physiotherapy foundation",
    body: "Worked in rehabilitation and client-facing care. Built communication, documentation, problem-solving, and stakeholder-management skills.",
    highlights: [
      "Client-facing communication",
      "Documentation discipline",
      "Problem-solving under constraints",
      "Stakeholder management"
    ]
  }
];
