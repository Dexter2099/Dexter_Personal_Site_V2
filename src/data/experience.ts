export type ExperienceEntry = {
  date: string;
  title: string;
  meta: string;
  logo?: string;
  logoAlt?: string;
  bullets: string[];
};

export const experienceEntries: ExperienceEntry[] = [
  {
    date: "2026",
    title: "Software Engineer Internship at Delvify.ai",
    meta: "Hong Kong / Singapore-based SaaS",
    logo: "/images/delvify-logo.png",
    logoAlt: "Delvify.ai logo",
    bullets: [
      "Designed and implemented REST API endpoints using Python, FastAPI, SQLAlchemy, and PostgreSQL for production SaaS workflows.",
      "Implemented authentication features including JWT-based flows and two-factor authentication support.",
      "Built full-text search capability for structured product data and integrated ML-powered search into backend workflows.",
      "Wrote automated backend tests with pytest and used Postman during API validation and debugging.",
      "Worked with Docker and CI/CD pipelines to support reliable deployment and developer workflow improvements.",
      "Collaborated with engineers and product stakeholders on site in Hong Kong to clarify requirements, trace issues, and ship maintainable backend changes."
    ]
  },
  {
    date: "2023–2025",
    title: "Career Transition and Software Development",
    meta: "QUT / Independent Projects | Brisbane",
    logo: "/images/qut-logo.jpg",
    logoAlt: "QUT logo",
    bullets: [
      "Completed a Master of IT majoring in computer science, backend engineering, databases, system design, and applied ML systems.",
      "Built API-oriented projects using Python and modern web tooling, with emphasis on clean data flow, validation, and maintainable structure."
    ]
  },
  {
    date: "2018–2024",
    title: "Rehabilitation Physiotherapist",
    meta: "SPEARS Health | Medibank | Brisbane",
    bullets: [
      "Managed 400+ complex client cases, using structured assessment, accurate documentation, and outcome tracking under time pressure.",
      "Developed strong stakeholder communication habits through client education, progress reporting, and multidisciplinary collaboration."
    ]
  }
];
