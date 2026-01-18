# FlockRL Webapp

A modern web platform for visualizing and sharing AI-powered drone flight simulation logs. Built with Next.js and Cloudflare Workers, FlockRL provides an interactive gallery where researchers and developers can upload, view, and compare drone flight simulations.

## 🎯 Overview

FlockRL Webapp is a full-stack application that enables users to:
- **Upload** drone flight simulation logs (JSON format)
- **Visualize** flight trajectories with interactive 3D plots
- **Compare** performance metrics across different simulations
- **Share** results in a public gallery with filtering and search capabilities

## 🏗️ Architecture

This is a monorepo containing two main services:

- **Frontend**: Next.js 16 application with React 19, TypeScript, and Tailwind CSS
- **Backend**: Cloudflare Workers API with R2 storage and KV metadata

### Project Structure

```
flockrl-webapp/
├── frontend/          # Next.js React application
│   ├── app/          # App router pages (gallery, submit, submissions)
│   ├── components/   # React components (UI, charts, visualizers)
│   └── lib/          # API client and utilities
├── backend/          # TypeScript Cloudflare Workers backend
│   ├── src/          # API routes and business logic
│   └── storage/      # R2 and KV storage utilities
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Cloudflare account (for deployment)
- Wrangler CLI (installed automatically with dependencies)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Start development server (uses local R2/KV emulators)
npm run dev
```

The backend will run on `http://localhost:8787` with local storage emulators.

**Note**: For detailed backend setup, testing, and deployment instructions, see:
- `backend/README.md` - Architecture and setup details
- `backend/TESTING.md` - Testing guide
- `backend/DEPLOYMENT.md` - Production deployment

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install  # or pnpm install

# Create environment file
echo 'NEXT_PUBLIC_API_URL=http://localhost:8787' > .env.local

# Start development server
npm run dev  # or pnpm dev
```

The frontend will run on `http://localhost:3000` and automatically connect to the backend API.

### 3. Root-Level Scripts

From the root directory, you can use convenience scripts:

```bash
# Start frontend dev server
npm run dev

# Start backend dev server
npm run dev:backend

# Start production frontend
npm start
```

## ✨ Features

### Core Functionality

- **📤 Submission Upload**: Drag-and-drop interface for uploading JSON simulation logs
  - Validates file format and structure
  - Extracts metadata automatically
  - Supports files from `CoreSimulator._save_episode_run()`

- **🖼️ Interactive Gallery**: Browse all submissions with powerful filtering
  - Search by title or tags
  - Sort by score, duration, or date
  - Real-time statistics (total flights, top score, average duration)

- **📊 Detailed Visualization**: Rich submission detail pages
  - Interactive 3D trajectory plots using Plotly.js
  - Performance metrics and charts
  - Flight duration and score tracking
  - Custom notes and tags

- **🎨 Modern UI**: Beautiful, responsive interface
  - Dark/light theme support
  - Glassmorphism design elements
  - Smooth animations and transitions
  - Mobile-friendly layout

### Technical Features

- **⚡ Edge Computing**: Serverless backend on Cloudflare's global network
- **💾 Scalable Storage**: R2 for files, KV for metadata
- **🔄 Real-time Status**: Processing status tracking for submissions
- **🛡️ Error Handling**: Graceful degradation when backend is unavailable
- **📱 Progressive Web App**: Optimized for all devices

## 🔌 API Endpoints

The backend provides a RESTful API for managing submissions:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/submissions` | Upload a new submission (multipart/form-data) |
| `GET` | `/api/submissions` | List all submissions with metadata |
| `GET` | `/api/submissions/{id}` | Get detailed submission information |
| `GET` | `/api/submissions/{id}/status` | Get processing status |
| `GET` | `/api/submissions/{id}/data` | Get raw simulation data (JSON) |
| `GET` | `/api/submissions/{id}/file` | Download original submission file |

All endpoints support CORS and include proper error handling.

## ⚙️ Configuration

### Frontend Environment Variables

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8787
```

For production, set this to your deployed Cloudflare Workers URL:
```bash
NEXT_PUBLIC_API_URL=https://flockrl-api.your-account.workers.dev
```

**Important**: `NEXT_PUBLIC_*` variables are build-time only. You must rebuild after changing them.

### Backend Configuration

Edit `backend/wrangler.toml`:

```toml
[vars]
CORS_ORIGINS = "http://localhost:3000,https://your-frontend.pages.dev"
```

The backend uses:
- **R2 Bucket**: `flockrl-submissions` (for file storage)
- **KV Namespace**: `SUBMISSIONS_KV` (for metadata)

See `backend/wrangler.toml` for full configuration options.

## 🛠️ Development Workflow

1. **Start Backend**: `cd backend && npm run dev` (port 8787)
2. **Start Frontend**: `cd frontend && npm run dev` (port 3000)
3. **Access Application**: Open `http://localhost:3000`
4. **Upload Logs**: Navigate to Submit page and upload JSON files
5. **View Gallery**: Browse submissions on the home page
6. **Inspect Details**: Click any submission to see full details

### Development Tips

- Backend uses local R2/KV emulators in development
- Frontend hot-reloads on file changes
- Check browser console for API errors
- Use Wrangler tail for backend logs: `cd backend && npm run tail`

## 🚢 Deployment

### Backend (Cloudflare Workers)

```bash
cd backend
npm install
npm run deploy
```

**Requirements**:
- Cloudflare account with Workers enabled
- R2 bucket created: `flockrl-submissions`
- KV namespace created and bound
- CORS origins configured in `wrangler.toml`

See `backend/DEPLOYMENT.md` for detailed instructions.

### Frontend (Cloudflare Pages)

**Via Wrangler CLI:**
```bash
cd frontend
npm run build
npm run deploy
```

**Via Cloudflare Dashboard:**
1. Connect your Git repository
2. Set build settings:
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Build output**: `out`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = Your Workers URL
4. Deploy

The frontend builds as a static export optimized for Cloudflare Pages.

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test  # If test scripts are configured
```

See `backend/TESTING.md` for testing guidelines and examples.

### Frontend Testing

```bash
cd frontend
npm run lint  # ESLint checks
```

## 📚 Tech Stack

### Frontend
- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4.1.9
- **Components**: Radix UI + shadcn/ui
- **Visualization**: Plotly.js, Recharts
- **Deployment**: Cloudflare Pages

### Backend
- **Runtime**: Cloudflare Workers
- **Language**: TypeScript 5
- **Storage**: Cloudflare R2 (files), KV (metadata)
- **Deployment**: Wrangler CLI

## 🐛 Troubleshooting

### Backend Issues

**Backend not starting:**
- Ensure Wrangler is installed: `npm install -g wrangler`
- Check `wrangler.toml` configuration
- Verify R2/KV bindings are correct

**CORS errors:**
- Update `CORS_ORIGINS` in `backend/wrangler.toml`
- Include both localhost and production URLs

### Frontend Issues

**Backend connection errors:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is running on the expected port
- Review browser console for detailed error messages
- Ensure CORS is configured on backend

**Build failures:**
```bash
# Clean and rebuild
cd frontend
rm -rf .next out node_modules
npm install
npm run build
```

**CSS not loading:**
- Verify static assets in `out/` directory
- Check `_routes.json` configuration
- Ensure Cloudflare Pages routing is correct

### General Issues

**Port already in use:**
- Backend: Change port in `wrangler.toml` or kill process on 8787
- Frontend: Use `-p` flag: `npm run dev -- -p 3001`

**Storage emulator issues:**
- Restart Wrangler dev server
- Clear local emulator data if needed

## 📖 Additional Documentation

- `frontend/README.md` - Frontend-specific documentation
- `backend/README.md` - Backend architecture and setup
- `backend/DEPLOYMENT.md` - Detailed deployment guide
- `backend/TESTING.md` - Testing instructions
- `backend/LOGIC_EXTRACTION.md` - Implementation details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Production Frontend**: [flockrl-webapp.pages.dev](https://flockrl-webapp.pages.dev)
- **Production Backend**: Configured via `NEXT_PUBLIC_API_URL`

---

Built with ❤️ for the drone simulation community
