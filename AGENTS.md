# Public website content and chatbot synchronization

When editing public career/profile content, keep the page and chatbot on the same source:

- Experience: `src/data/experience.ts`; project cards: `src/data/projects.ts`.
- Home identity, About and Contact prose: `src/data/site-copy.ts`.
- Public social/contact URLs: `src/data/links.ts`; author links: `src/data/author.ts`; home technology labels: `src/data/tech.ts`.
- Keep existing item IDs stable when renaming a role/project. New items can omit IDs and receive a derived chatbot ID. Update `reviewed` dates when reviewing changed facts.
- Do not hardcode new career/profile prose into page or React templates. Add it to shared data and render that data. Register any new page content source in `server/chat/public-experience.ts`.
- Keep private repository evidence in the separately reviewed `knowledge/approved/portfolio.json`; never import raw private files, secrets, learner data or referee details into public knowledge.
- Run `npm run chat:check`, `npm run chat:test`, `npm test` and the feature build before releasing content changes. The build validates the complete model context and fails if it exceeds the existing dollar-independent input bound.
