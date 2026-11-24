# Research Guru

Research Guru is a research and academic support platform providing
research guidance, technical implementation, documentation, thesis,
academic writing, and publication support.

## Overview

The Research Guru website provides researchers, scholars, and PhD
candidates with information about available research services,
publication support, offers, and ways to submit research enquiries.

The project also includes an administrative interface for managing
website content and incoming enquiries.

## Features

### Public Website

- Home page
- About page
- Research services
- Research offers
- Research blog
- Individual blog articles
- Contact and research enquiry form
- Privacy Policy
- Terms & Conditions
- Responsive design for desktop, tablet, and mobile
- Dynamic site settings
- Dynamic favicon and branding
- SEO metadata
- Open Graph and Twitter/X metadata
- JSON-LD structured data
- `robots.txt`
- XML sitemap
- Custom 404 page

### Admin Area

The project includes a protected administrative interface for
managing website content and enquiries.

Administrative functionality includes:

- Dashboard
- Blog management
- Services management
- Offers management
- Client management
- Reviews management
- Contact enquiry management
- User management
- Site settings
- Admin authentication

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Lucide React

### Backend

- FastAPI
- Python
- SQLite

## Project Structure

```text
Research Guru/
├── backend/
│   ├── ...
│   └── research_guru.db  (local only; ignored by Git)
│
├── frontend/
│   ├── public/
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   └── og-image.jpg
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── utils/
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── README.md
└── .gitignore

## Security and local setup

Set a unique random `JWT_SECRET` before starting the backend. Generate it locally with `python -c 'import secrets; print(secrets.token_hex(32))'`. Store it in an untracked backend `.env` file or export it in the shell; in Vercel configure it as a production secret before deploying. Never use the old development fallback. Existing tokens signed with a replaced key become invalid. New admin tokens expire after one hour. Back up any existing local SQLite database outside the repository before pulling the commit that untracks it. Production should use a private PostgreSQL DATABASE_URL. Removing the tracked database does not remove historical copies; review its contents privately, rotate affected credentials, and address any personal data exposure and repository history separately.

Backend tests: `cd backend && python -m pytest tests -q` (tests use a temporary SQLite DB and independent random signing key by default; never point TEST_DATABASE_URL at production).


## SEO deployment

Cloudflare Pages root directory `frontend`, build command `npm run build`, output `dist`. Keep `VITE_API_URL` set to the public HTTPS backend origin in both build and runtime settings. The canonical frontend origin is defined in `frontend/src/utils/seo.js`; update it when moving to a custom domain. The build produces static route-specific HTML, noindex admin entries, a 404 page, robots.txt and a static fallback sitemap. Pages Functions serve `/sitemap.xml` dynamically using the public published-slug endpoint and `/blog/:slug` with article-specific HTML and HTTP 404 for missing/unpublished articles. Deploy the latest backend before the frontend; temporary upstream failures return 503. Search Console verification is preserved. Check the live sitemap and a published article without running JavaScript. If adding more Pages Functions, extend `public/_routes.json` accordingly.
