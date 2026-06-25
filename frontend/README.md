# Frontend — AskDB Chat Interface

The user-facing chat interface for AskDB. Built with Next.js and TypeScript using the Horizon UI template.

## Features

- Natural language chat interface
- Displays SQL query results as formatted tables
- JWT authentication (login/register)
- Role-aware UI (`admin`, `directeur`, `stagiaire`)

## Setup

```bash
npm install

# Copy environment file
copy .env.local.example .env.local
# Or on Linux/Mac:
# cp .env.local.example .env.local

npm run dev
# Opens at http://localhost:3000
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://127.0.0.1:5001` | Backend API base URL |

## How It Works

- Communicates with the **Backend** (`localhost:5001`) for authentication
- Communicates with the **AI Engine** (`localhost:8000`) for chat queries (text-to-SQL)
- Displays query results returned from the AI engine

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Chakra UI
- Horizon UI components
