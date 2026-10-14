# Forest, Wildlife & Environment Department — Gilgit-Baltistan

A responsive Vite website for the Government of Gilgit-Baltistan’s Forest, Wildlife & Environment Department. The approved landing-page visual system is reused throughout the local department, directory, article, project, resource and map routes.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`; preview it with `npm run preview`. Vite is configured to bind to `0.0.0.0` and allow the Arena preview host.

## Contact form configuration

No submission endpoint is published by the department, so the contact form does **not** send messages by default. It validates required fields and reports that the message was not sent. To enable submission, copy `.env.example` to `.env.local` and set `VITE_CONTACT_ENDPOINT` to a real, secured endpoint that accepts JSON `POST` requests with `{ name, email, phone, subject, message }` and returns a successful 2xx response only after accepting the message. Configure CORS, server-side validation, spam protection and privacy handling on that service; do not put secrets in a `VITE_` variable.

## Content and source notes

- Department descriptions, staff listings, park and species facts, projects, update headlines/dates and document records are based on the department’s public pages and linked source records at `https://fwegb.gov.pk/`.
- Official notices and PDF/DOC files continue to open from their department-hosted source URLs in a clearly identified new tab. A local resource detail page identifies documents whose source files are missing.
- Local map previews, portraits and regional photographs are in `public/assets/`; exact scenic-photo author, source and Creative Commons license details are documented in `IMAGE-CREDITS.md` and the relevant entries in `src/data.js`. Scenic reference imagery is identified as illustrative rather than presented as department-authored photography. Park-specific photos that could not be verified locally are explicitly flagged.
- Source gaps are labelled in-page rather than filled with invented details. These include missing original boundary-map files, incomplete divisional directory records, missing individual documentary/video IDs, a source page with little NDMRF detail, conflicting/stale contact-directory postings, and vacancies that are only verifiable as archived 2023 notices.
- Current project status, staff assignments, public-notice deadlines and contact details should be verified against the linked official page before operational use.
