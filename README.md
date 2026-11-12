# Task Manager

A small full-stack task manager.

- **`/api`**: NestJS REST API, validated with `class-validator`, stored in SQLite through Prisma
- **`/web`**: Next.js (App Router) frontend using shadcn/ui and Tailwind CSS

## Prerequisites

- **Node.js 20 or newer** (developed on Node 22)
- **npm** (comes with Node.js)

No separate database server is needed. SQLite runs from a local file.

## Run it locally

Use two terminals, starting from the repository root.

### 1. Backend (`/api`), runs on http://localhost:3001

```bash
cd api
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

- `.env.example` contains `DATABASE_URL`, `PORT` and `CORS_ORIGIN`. The defaults work as they are.
- `npx prisma migrate deploy` creates the SQLite file (`api/prisma/dev.db`) and the `Task` table.

### 2. Frontend (`/web`), runs on http://localhost:3000

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

- `.env.local` contains `NEXT_PUBLIC_API_URL=http://localhost:3001`, the address of the API.

Open http://localhost:3000.

## Run with Docker Compose (optional)

```bash
docker compose up --build
```

The web app is on http://localhost:3000 and the API on http://localhost:3001. SQLite data is kept in a Docker volume (`api-data`).

## API

| Method | Path         | Description                  |
| ------ | ------------ | ---------------------------- |
| GET    | `/tasks`     | List tasks, newest first     |
| GET    | `/tasks/:id` | Get one task                 |
| POST   | `/tasks`     | Create a task                |
| PATCH  | `/tasks/:id` | Update any subset of fields  |
| DELETE | `/tasks/:id` | Delete a task (204)          |

A task has `id`, `title` (required), `description`, `status` (`TODO`, `IN_PROGRESS` or `DONE`, default `TODO`), `dueDate` (ISO date) and `createdAt`.
Invalid input returns **400** with the validation messages. Unknown ids return **404**.
Sending `null` for `description` or `dueDate` on PATCH clears the value.

## Tests

```bash
cd api
npm run test:e2e
```

These run the real controller, service and validation pipe against an in-memory stand-in for Prisma, so no database is needed.

## Features

- Task table with status badges
- Create and edit in a dialog form
- Confirmation dialog before deleting
- Loading skeleton, error state with retry, and toasts on success or failure
- Bonus: filter by status, sort by due date, Docker Compose

## How I used AI

I used **Claude** to generate the first version of this project: the NestJS module, Prisma schema, DTOs, the Next.js components and the Docker setup.

