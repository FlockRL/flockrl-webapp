# FlockRL Webapp

A monorepo containing the FlockRL frontend (Next.js) and backend (Cloudflare Workers) services for viewing and submitting drone flight simulation logs.

## Project Structure

```
flockrl-webapp/
├── frontend/          # Next.js React application
├── backend/           # TypeScript Cloudflare Workers backend
└── README.md         # This file
```

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Start the development server (uses local emulators)
npm run dev
```

Backend runs on `http://localhost:8787`
- See `backend/README.md` for detailed setup instructions
- See `backend/TESTING.md` for testing guide

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install  # or npm install

# Create environment file
echo 'NEXT_PUBLIC_API_URL=http://localhost:8787' > .env.local

# Start the dev server
pnpm dev  # or npm run dev
```

Frontend runs on `http://localhost:3000`

## Features

- **Submit**: Upload JSON simulation logs (only `.json` files accepted)
- **Gallery**: Browse all uploaded submissions with filtering/search
- **Detail View**: View submission details, metrics, and notes
- **Serverless Backend**: Runs on Cloudflare's edge network for global low latency

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/submissions` | Upload a new submission |
| GET | `/api/submissions` | List all submissions |
| GET | `/api/submissions/{id}` | Get submission details |
| GET | `/api/submissions/{id}/status` | Get processing status |
| POST | `/api/submissions/{id}/render` | Start visualization server |
| GET | `/api/submissions/{id}/data` | Get raw simulation data |

## Environment Variables

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8787
```

### Backend (`backend/wrangler.toml`)
```toml
[vars]
CORS_ORIGINS = "http://localhost:3000,https://your-frontend.pages.dev"
```

## Development Workflow

1. Start the backend server: `cd backend && npm run dev` (port 8787)
2. Start the frontend dev server: `cd frontend && npm run dev` (port 3000)
3. The frontend communicates with the backend API
4. Upload simulation logs via the Submit page (only `.json` files)
5. View submissions in the Gallery
6. Click on a submission to see details and metrics

## Deployment

### Quick Deploy Summary

**Backend (Cloudflare Workers):**
```bash
cd backend
npm install
npm run deploy
```
- See `backend/DEPLOYMENT.md` for detailed instructions
- Requires Cloudflare account and R2/KV setup

**Frontend (Cloudflare Pages):**
- Root directory: `frontend`
- Build command: `npm run build && npm run pages:build`
- Build output: `dist`
- Set `NEXT_PUBLIC_API_URL` to your Workers URL

For complete deployment instructions, see `backend/DEPLOYMENT.md` and `frontend/README.md`.

## Backend Architecture

The backend uses:
- **Cloudflare Workers**: Serverless edge functions
- **R2**: Object storage for submission files
- **KV**: Key-value storage for metadata

See `backend/README.md` for architecture details and `backend/LOGIC_EXTRACTION.md` for implementation documentation.
