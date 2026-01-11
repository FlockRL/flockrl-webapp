# FlockRL Webapp

A monorepo containing the FlockRL frontend (Next.js) and backend (Python/FastAPI) services for viewing and submitting drone flight simulation logs.

## Project Structure

```
flockrl-webapp/
├── frontend/          # Next.js React application
├── backend/           # Python FastAPI backend with PlotlyRenderer integration
└── README.md         # This file
```

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with simulator path
echo 'SIMULATOR_PATH=/Users/joshz/repos/flockrl/simulator' > .env

# Start the server
uvicorn main:app --reload --port 8000
```

Backend runs on `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install  # or npm install

# Create environment file
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local

# Start the dev server
pnpm dev  # or npm run dev
```

Frontend runs on `http://localhost:3000`

## Features

- **Submit**: Upload JSON simulation logs from `CoreSimulator.save_run()`
- **Gallery**: Browse all uploaded submissions with filtering/search
- **Detail View**: View submission details, metrics, and notes
- **Visualization**: Interactive 3D visualization using PlotlyRenderer (Dash)

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
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`backend/.env`)
```
SIMULATOR_PATH=/Users/joshz/repos/flockrl/simulator
```

## Development Workflow

1. Start the backend server (port 8000)
2. Start the frontend dev server (port 3000)
3. The frontend communicates with the backend API
4. Upload simulation logs via the Submit page
5. View submissions in the Gallery
6. Click on a submission to see details
7. Use the Renderer tab to start interactive visualization

## PlotlyRenderer Integration

The backend integrates with the FlockRL Simulator's `PlotlyRenderer` for interactive 3D visualization:

1. Simulation logs are uploaded and validated
2. When "Start Visualization" is clicked, a Dash server starts on port 8050
3. The visualization is embedded in an iframe on the detail page

See `backend/README.md` for more details on the simulator integration.
