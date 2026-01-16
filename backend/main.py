"""
FlockRL Backend API
Python backend service for handling submission processing and Plotty integration
"""

from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel
from typing import Optional, List
import json
import os
from datetime import datetime
from flockrl_sim.visualization.plotly_renderer import PlotlyRenderer
from flockrl_sim.visualization.renderer import OfflineVisualizer

load_dotenv()

app = FastAPI(title="FlockRL API", version="1.0.0")

# CORS middleware to allow frontend to communicate with backend
# Allow origins from environment variable or default to localhost for development
allowed_origins = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class SubmissionCreate(BaseModel):
    title: str
    tags: Optional[List[str]] = []
    notes: Optional[str] = None
    env_set: Optional[str] = None
    renderer_preset: Optional[str] = None


class SubmissionResponse(BaseModel):
    id: str
    title: str
    status: str
    created_at: str
    message: str


@app.get("/")
async def root():
    return {"message": "FlockRL Backend API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/submissions", response_model=SubmissionResponse)
async def create_submission(
    file: UploadFile = File(...),
    title: str = "",
    tags: List[str] = [],
    notes: Optional[str] = None,
    env_set: Optional[str] = None,
    renderer_preset: Optional[str] = None,
):
    """
    Upload a log file (JSON simulation output) and create a new submission.
    The file will be processed and ready for visualization.
    """
    try:
        # Validate file type - accept both .log and .json files
        if not (file.filename.endswith('.log') or file.filename.endswith('.json')):
            raise HTTPException(
                status_code=400, 
                detail="File must be a .log or .json file (simulation output from CoreSimulator.save_run())"
            )
        
        # Generate submission ID
        submission_id = f"sub-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        created_at = datetime.now().isoformat()
        
        # Create uploads directory if it doesn't exist
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)
        
        # Save the uploaded file
        file_extension = Path(file.filename).suffix
        file_path = upload_dir / f"{submission_id}{file_extension}"
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Validate that it's a valid JSON simulation log
        try:
            with open(file_path, "r") as f:
                data = json.load(f)
                if "frames" not in data:
                    raise ValueError("Invalid simulation log: missing 'frames' field")
                frame_count = len(data.get("frames", []))
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400,
                detail="File is not valid JSON. Expected output from CoreSimulator.save_run()"
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        # Save metadata JSON file alongside the upload
        metadata = {
            "id": submission_id,
            "title": title or f"Submission {submission_id}",
            "tags": tags or [],
            "notes": notes,
            "env_set": env_set,
            "renderer_preset": renderer_preset,
            "created_at": created_at,
            "status": "READY",  # Since we validated the file, it's ready
            "log_file_name": file.filename,
            "file_path": str(file_path),
            "frame_count": frame_count,
        }
        
        metadata_path = upload_dir / f"{submission_id}_metadata.json"
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)
        
        return SubmissionResponse(
            id=submission_id,
            title=metadata["title"],
            status="READY",
            created_at=created_at,
            message="Submission uploaded successfully. Ready for visualization."
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/submissions/{submission_id}")
async def get_submission(submission_id: str):
    """
    Get submission details by ID.
    Returns full Submission object matching frontend types.
    """
    upload_dir = Path("uploads")
    
    # Load metadata file
    metadata_path = upload_dir / f"{submission_id}_metadata.json"
    if not metadata_path.exists():
        raise HTTPException(status_code=404, detail="Submission not found")
    
    try:
        with open(metadata_path, "r") as f:
            metadata = json.load(f)
        
        # Find and load the simulation file
        json_file = upload_dir / f"{submission_id}.json"
        log_file = upload_dir / f"{submission_id}.log"
        file_path = json_file if json_file.exists() else (log_file if log_file.exists() else None)
        
        # Extract additional data from simulation file if available
        metrics = None
        duration_sec = None
        plots = []
        
        if file_path and file_path.exists():
            with open(file_path, "r") as f:
                sim_data = json.load(f)
                
            frames = sim_data.get("frames", [])
            frame_count = len(frames)
            
            # Estimate duration from frames (assuming ~0.1s per frame)
            duration_sec = frame_count * 0.1 if frame_count > 0 else None
            
            # Extract metrics from simulation metadata if available
            sim_metadata = sim_data.get("metadata", {})
            if sim_metadata:
                metrics = {
                    "score": sim_metadata.get("score"),
                    "success": sim_metadata.get("success"),
                    "timeSec": sim_metadata.get("time_sec") or sim_metadata.get("timeSec"),
                    "collisions": sim_metadata.get("collisions"),
                    "smoothness": sim_metadata.get("smoothness"),
                    "pathEfficiency": sim_metadata.get("path_efficiency") or sim_metadata.get("pathEfficiency"),
                }
                # Remove None values
                metrics = {k: v for k, v in metrics.items() if v is not None}
                if not metrics:
                    metrics = None
        
        # Build full submission response matching frontend Submission type
        submission = {
            "id": metadata.get("id", submission_id),
            "title": metadata.get("title", "Untitled"),
            "createdAt": metadata.get("created_at", datetime.now().isoformat()),
            "envSet": metadata.get("env_set"),
            "status": metadata.get("status", "READY"),
            "videoUrl": None,  # Not yet implemented
            "thumbnailUrl": "/drone-image.jpg",  # Default thumbnail
            "durationSec": duration_sec,
            "notes": metadata.get("notes"),
            "tags": metadata.get("tags", []),
            "metrics": metrics,
            "plots": plots,
            "logFileName": metadata.get("log_file_name", f"{submission_id}.json"),
            "rendererVersion": metadata.get("renderer_preset"),
        }
        
        return submission
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse metadata: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load submission: {str(e)}")


@app.get("/api/submissions")
async def list_submissions():
    """
    List all submissions.
    Scans uploads/ directory for metadata files and returns list.
    """
    upload_dir = Path("uploads")
    
    if not upload_dir.exists():
        return {"submissions": []}
    
    submissions = []
    
    # Find all metadata files
    for metadata_path in upload_dir.glob("*_metadata.json"):
        try:
            with open(metadata_path, "r") as f:
                metadata = json.load(f)
            
            submission_id = metadata.get("id", metadata_path.stem.replace("_metadata", ""))
            
            # Build submission summary
            submission = {
                "id": submission_id,
                "title": metadata.get("title", "Untitled"),
                "createdAt": metadata.get("created_at", ""),
                "status": metadata.get("status", "READY"),
                "thumbnailUrl": "/drone-image.jpg",
                "tags": metadata.get("tags", []),
                "logFileName": metadata.get("log_file_name", f"{submission_id}.json"),
            }
            submissions.append(submission)
        except Exception:
            # Skip files that can't be parsed
            continue
    
    # Sort by createdAt descending (newest first)
    submissions.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    
    return {"submissions": submissions}


@app.get("/api/submissions/{submission_id}/status")
async def get_submission_status(submission_id: str):
    """
    Get the current processing status of a submission.
    """
    upload_dir = Path("uploads")
    
    # Check if file exists
    json_file = upload_dir / f"{submission_id}.json"
    log_file = upload_dir / f"{submission_id}.log"
    
    file_path = json_file if json_file.exists() else (log_file if log_file.exists() else None)
    
    if not file_path or not file_path.exists():
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Try to load and validate the file
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
            frame_count = len(data.get("frames", []))
            has_metadata = "metadata" in data
            
        return {
            "id": submission_id,
            "status": "READY",
            "frame_count": frame_count,
            "has_metadata": has_metadata,
            "file_path": str(file_path),
        }
    except Exception as e:
        return {
            "id": submission_id,
            "status": "ERROR",
            "message": str(e)
        }


# Store active renderer processes
_active_renderers: dict = {}


@app.post("/api/submissions/{submission_id}/render")
async def render_submission(submission_id: str, host: str = "127.0.0.1", port: int = 8050):
    """
    Start a PlotlyRenderer server for the submission.
    Starts Dash server in a background thread and returns the URL.
    """
    import threading
    
    upload_dir = Path("uploads")
    
    # Find the file
    json_file = upload_dir / f"{submission_id}.json"
    log_file = upload_dir / f"{submission_id}.log"
    
    file_path = json_file if json_file.exists() else (log_file if log_file.exists() else None)
    
    if not file_path or not file_path.exists():
        raise HTTPException(status_code=404, detail="Submission not found")
    
    try:
        # Check if renderer is already running for this submission
        if submission_id in _active_renderers and _active_renderers[submission_id].is_alive():
            return {
                "id": submission_id,
                "message": "Renderer already running",
                "render_url": f"http://{host}:{port}",
                "frame_count": 0,
                "obstacle_count": 0,
            }
        
        # Load the simulation data
        visualizer = OfflineVisualizer(file_path, render_mode="plotly")
        visualizer.load()
        
        frame_count = len(visualizer.frames)
        obstacle_count = len(visualizer.obstacles)
        
        # Start renderer in background thread
        def run_renderer():
            try:
                visualizer.render(host=host, port=port, debug=False)
            except Exception as e:
                print(f"Renderer error: {e}")
        
        renderer_thread = threading.Thread(target=run_renderer, daemon=True)
        renderer_thread.start()
        
        # Store reference to thread
        _active_renderers[submission_id] = renderer_thread
        
        return {
            "id": submission_id,
            "message": f"Renderer started. Access at http://{host}:{port}",
            "render_url": f"http://{host}:{port}",
            "frame_count": frame_count,
            "obstacle_count": obstacle_count,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start renderer: {str(e)}")


@app.get("/api/submissions/{submission_id}/data")
async def get_submission_data(submission_id: str):
    """
    Get the raw simulation data for a submission.
    Returns the JSON structure with frames, metadata, and obstacles.
    """
    upload_dir = Path("uploads")
    
    # Find the file
    json_file = upload_dir / f"{submission_id}.json"
    log_file = upload_dir / f"{submission_id}.log"
    
    file_path = json_file if json_file.exists() else (log_file if log_file.exists() else None)
    
    if not file_path or not file_path.exists():
        raise HTTPException(status_code=404, detail="Submission not found")
    
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
        
        # Return summary (full data might be too large)
        return {
            "id": submission_id,
            "frame_count": len(data.get("frames", [])),
            "metadata": data.get("metadata", {}),
            "obstacles": data.get("metadata", {}).get("obstacles", []),
            "first_frame": data.get("frames", [])[0] if data.get("frames") else None,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load data: {str(e)}")


@app.get("/api/submissions/{submission_id}/log")
async def get_submission_log(submission_id: str):
    """
    Get the log file content for a submission.
    Returns the file content as formatted JSON text.
    """
    upload_dir = Path("uploads")
    
    # Find the file
    json_file = upload_dir / f"{submission_id}.json"
    log_file = upload_dir / f"{submission_id}.log"
    
    file_path = json_file if json_file.exists() else (log_file if log_file.exists() else None)
    
    if not file_path or not file_path.exists():
        raise HTTPException(status_code=404, detail="Log file not found")
    
    try:
        with open(file_path, "r") as f:
            content = f.read()
        
        # Try to format as JSON if it's valid JSON
        try:
            data = json.loads(content)
            formatted_content = json.dumps(data, indent=2)
            return PlainTextResponse(formatted_content, media_type="text/plain")
        except json.JSONDecodeError:
            # If it's not valid JSON, return as-is
            return PlainTextResponse(content, media_type="text/plain")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read log file: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
