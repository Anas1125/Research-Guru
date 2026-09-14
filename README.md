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
│   └── research_guru.db
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