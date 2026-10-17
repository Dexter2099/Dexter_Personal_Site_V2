export type LinkedExperienceBullet = {
  before: string;
  link: {
    label: string;
    href: string;
  };
  after: string;
};

export type ExperienceBullet = string | LinkedExperienceBullet;

export type ExperienceGroup = {
  title: string;
  bullets: ExperienceBullet[];
};

export type ExperienceEntry = {
  id?: string;
  date: string;
  title: string;
  meta: string;
  summary?: string;
  logo?: string;
  logoAlt?: string;
} & (
  | { groups: ExperienceGroup[]; bullets?: never }
  | { bullets: ExperienceBullet[]; groups?: never }
);

export const experienceEntries: ExperienceEntry[] = [
  {
    id: "safetrase",
    date: "2026",
    title: "Internship at SafeTrase",
    meta: "The Advisory Network",
    summary: "Developed the Stage 1 SafeTrase prototype with product and public-health stakeholders. The app helps people review official health alerts relevant to their selected locations, saved places and planned trips.",
    logo: "/images/advisory-network-logo.png",
    logoAlt: "The Advisory Network logo",
    groups: [
      {
        title: "Mobile app and backend",
        bullets: [
          "Built an Expo/React Native mobile app and Next.js administration portal using TypeScript, with sign-in, alert feeds, saved places and workflows for reviewing and publishing alerts.",
          "Used Supabase Auth, PostgreSQL/PostGIS and Edge Functions for the backend. Implemented database migrations and row-level security to restrict access to personal data and administrative actions.",
          "Integrated Geoapify for place search and geocoding through backend services, keeping provider credentials outside the mobile app."
        ]
      },
      {
        title: "Source ingestion and cloud infrastructure",
        bullets: [
          "Built a TypeScript/Node.js platform to collect and structure official public-health information. Stored source snapshots, revision history and validation results so records could be traced to the original evidence.",
          "Deployed collection services and PostgreSQL on a DigitalOcean Linux VM using Docker, with scheduled collection, persistent storage and automatic restarts. Connected the platform to Supabase through an authenticated, versioned HTTPS feed with resumable imports."
        ]
      },
      {
        title: "Android testing and software quality",
        bullets: [
          "Integrated Firebase messaging and crash-reporting modules. Used EAS builds and Firebase App Distribution for installed Android previews.",
          "Tested native builds on a physical Android device using Android SDK tools, ADB and runtime logs. Checked sign-in, place search, cloud synchronisation, alert loading and session persistence after restart.",
          "Diagnosed and fixed a native map crash, then verified map rendering, location refresh and app restarts on the device.",
          "Wrote automated application, database, API contract and security tests for access controls, source imports and failure handling."
        ]
      },
      {
        title: "Website, SEO and audience engagement",
        bullets: [
          {
            before: "Built and deployed ",
            link: {
              label: "safetrase.com",
              href: "https://safetrase.com"
            },
            after: " using React, Vite and Cloudflare Pages. Connected Brevo waitlist registration to consent controls and a Cloudflare D1 submission ledger."
          },
          "Implemented page metadata, canonical URLs, structured data and an XML sitemap, and used Google Search Console for SEO work.",
          "Configured Google Analytics 4 with visitor consent controls to track page views, scrolling and waitlist-link clicks."
        ]
      }
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
