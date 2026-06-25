# Admin Panel — AskDB Dashboard

The admin dashboard for AskDB. Built with Next.js and TypeScript.

## Features

- View and manage registered users
- View admin audit logs (login, register, delete actions)
- View AI query logs (questions, generated SQL, execution status)
- Admin-only access (requires `admin` role JWT token)

## Setup

```bash
npm install

# Copy environment file
copy .env.local.example .env.local
# Or on Linux/Mac:
# cp .env.local.example .env.local

npm run dev -- --port 3001
# Opens at http://localhost:3001
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://127.0.0.1:5001` | Backend API base URL |

## Requirements

You must be logged in with a user that has the `admin` role.

Create an admin user by either:
1. Uncommenting the seed block in [`database/setup_TextToSQL_App.sql`](../database/setup_TextToSQL_App.sql)
2. Or calling `POST /auth/register` with `"role": "admin"` directly

## Tech Stack

- Next.js 14
- TypeScript
- Chakra UI
