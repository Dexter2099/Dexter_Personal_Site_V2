export type LinkedExperienceBullet = {
  before: string;
  link: {
    label: string;
    href: string;
  };
  after: string;
};

export type ExperienceBullet = string | LinkedExperienceBullet;

export type ExperienceEntry = {
  date: string;
  title: string;
  meta: string;
  logo?: string;
  logoAlt?: string;
  bullets: ExperienceBullet[];
};

export const experienceEntries: ExperienceEntry[] = [
  {
    date: "2026",
    title: "Internship at SafeTrase",
    meta: "The Advisory Network | Mobile, web and backend development",
    logo: "/images/advisory-network-logo.png",
    logoAlt: "The Advisory Network logo",
    bullets: [
      "Develop the Stage 1 SafeTrase MVP across an Expo/React Native mobile app, Next.js admin portal, and Supabase/PostgreSQL backend using TypeScript.",
      "Built secure workflows for reviewing and publishing public-health alerts, alongside authenticated mobile feeds and versioned in-app guidance.",
      "Implemented database migrations, row-level security, and automated contract and security tests to protect sensitive workflows and enforce access boundaries.",
      "Collaborate with stakeholders to translate evolving product and public-health requirements into maintainable technical solutions."
    ]
  },
  {
    date: "2026",
    title: "Volunteer Full Stack Developer at the THRIVE Project",
    meta: "KAP SuperQuiz | Remote",
    logo: "/images/thrive-logo.png",
    logoAlt: "THRIVE Project logo",
    bullets: [
      "Develop a self-hosted assessment platform using TypeScript, React, Express, PostgreSQL/Drizzle, Docker Compose, and Nginx, covering authentication, question banks, quiz delivery, and reporting.",
      "Implemented role- and cohort-scoped authorization to protect learner data and answer keys across administrator, facilitator, and learner workflows.",
      "Strengthened authentication and session flows, expanded automated test coverage, and improved deployment verification for reliable releases.",
      {
        before: "Contribute to the ",
        link: {
          label: "THRIVE Project",
          href: "https://thrivabilitymatters.org/"
        },
        after: ", a for-impact social enterprise focused on research, education, and advocacy for long-term human and environmental well-being."
      }
    ]
  },
  {
    date: "2026",
    title: "Internship at Delvify.ai",
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
