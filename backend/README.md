# Wealthify Backend

## Setup

1. Copy `.env.example` to `.env` and fill in your secrets.
2. Run `yarn install` or `npm install`.
3. Run `npx prisma migrate dev --name init` to setup DB.
4. Start dev server: `yarn dev` or `npm run dev`.

## Endpoints
- `/auth/register`, `/auth/login`
- `/accounts` (CRUD)
- `/transactions` (CRUD)
- `/goals` (CRUD)
- `/insights` (OpenAI-powered)

## Tech
- Node.js, Express, Prisma, PostgreSQL, OpenAI
