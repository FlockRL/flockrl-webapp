# FlockRL Backend

Python backend service for FlockRL, handling submission processing and Plotty integration.

## Setup

1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create and configure environment file:
```bash
cp .env.example .env
# Edit .env and set SIMULATOR_PATH to your simulator repository path
```

4. Run the development server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## PlotlyRenderer Integration

This backend integrates with the FlockRL Simulator's `PlotlyRenderer` for visualizing simulation runs. The integration points are:

1. **File Upload** (`POST /api/submissions`): Receives JSON log files from `CoreSimulator.save_run()`
2. **Status Check** (`GET /api/submissions/{id}/status`): Checks if the submission is ready
3. **Data Retrieval** (`GET /api/submissions/{id}/data`): Gets simulation data (frames, metadata, obstacles)
4. **Render** (`POST /api/submissions/{id}/render`): Prepares the submission for visualization

## Simulator Repository Setup

The backend imports from the FlockRL Simulator repository. The code loads the simulator path from your `.env` file.

### Setup Steps

1. **Create `.env` file** (if you haven't already):
   ```bash
   cp .env.example .env
   ```

2. **Set SIMULATOR_PATH in `.env`**:
   ```bash
   # Edit .env and set:
   SIMULATOR_PATH=/Users/joshz/repos/flockrl/simulator
   ```
   Update the path to match your simulator repository location.

3. **The code will automatically**:
   - Load `SIMULATOR_PATH` from `.env` using `python-dotenv`
   - Add it to Python's `sys.path` so imports work
   - Fall back to default locations if not set

### Alternative: Install as Editable Package
You can also install the simulator as a package:
```bash
pip install -e /Users/joshz/repos/flockrl/simulator
```

### Required Dependencies
Make sure visualization dependencies are installed:
```bash
pip install dash plotly
```
Or install the simulator's optional dependencies:
```bash
pip install -e /path/to/simulator[visualization]
```

## Usage

1. Upload a JSON file created by `CoreSimulator.save_run()`
2. The file is validated and stored
3. Use the render endpoint to start visualization (or integrate with frontend)

## Development

The PlotlyRenderer runs a Dash server. For production, consider:
- Generating static images/plots instead of interactive Dash apps
- Running the renderer in background processes
- Storing rendered outputs for frontend display
