import os
import shutil # For file operations
import tempfile # For temporary file/directory
from fastapi import FastAPI, HTTPException, Body, UploadFile, File, Form # Added UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware # For frontend later
from contextlib import asynccontextmanager

from langtrace_python_sdk import langtrace # Import langtrace
from langchain_openai import ChatOpenAI

from .models import GenerateResponse # GenerateRequest might not be used directly for this endpoint
from .agent_logic import create_graph, AgentState

# Global variables to hold the initialized model and LangGraph app
# These will be populated during FastAPI startup
llm_model = None
cover_letter_graph = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event
    global llm_model, cover_letter_graph
    print("FastAPI application startup...")

    # Initialize Langtrace
    langtrace_api_key = os.environ.get('LANGTRACE_KEY')
    if langtrace_api_key:
        print("Initializing Langtrace...")
        langtrace.init(api_key=langtrace_api_key)
    else:
        print("LANGTRACE_KEY not found. Skipping Langtrace initialization.")

    # Initialize OpenAI Model
    openai_api_key = os.environ.get('OPENAI_API_KEY')
    if not openai_api_key:
        print("Error: OPENAI_API_KEY environment variable not set.")
        # For a real app, you might want to prevent startup or use a fallback
        raise RuntimeError("OPENAI_API_KEY not set. Application cannot start.")
    
    print("Initializing ChatOpenAI model...")
    llm_model = ChatOpenAI(api_key=openai_api_key, model="gpt-4")
    
    print("Creating LangGraph application...")
    cover_letter_graph = create_graph()
    
    print("Model and graph initialized.")
    yield
    # Shutdown event (if any cleanup needed)
    print("FastAPI application shutdown...")

app = FastAPI(lifespan=lifespan)

# CORS middleware for frontend communication (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for now, restrict in production
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

@app.get("/")
async def read_root():
    return {"message": "Cover Letter Generator API is running."}

@app.post("/generate_cover_letter/", response_model=GenerateResponse)
async def generate_cover_letter_endpoint(
    resume_file: UploadFile = File(..., description="The resume PDF file."),
    job_description: str = Form(..., description="The job description text.")
):
    if llm_model is None or cover_letter_graph is None:
        raise HTTPException(status_code=503, detail="Service not ready, model or graph not initialized.")

    if not resume_file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    temp_dir = None
    temp_file_path = None

    try:
        # Create a temporary directory to store the uploaded file
        temp_dir = tempfile.mkdtemp()
        temp_file_path = os.path.join(temp_dir, resume_file.filename)
        
        print(f"Saving uploaded file to temporary path: {temp_file_path}")
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(resume_file.file, buffer)
        
        # Ensure the file is closed after writing, especially if it's a SpooledTemporaryFile
        # resume_file.file.close() # Handled by shutil.copyfileobj and context manager of UploadFile

        initial_state: AgentState = {
            "resume_path": temp_file_path, # Use the path of the saved temporary file
            "job_description": job_description,
            "model": llm_model,
            # Fields to be populated by the graph:
            "resume_content": "", 
            "cover_letter": "",
        }

        print(f"Invoking cover letter graph with state using temp file: {temp_file_path}")
        final_state = cover_letter_graph.invoke(initial_state)
        
        generated_letter = final_state.get("cover_letter")
        if not generated_letter:
            raise HTTPException(status_code=500, detail="Cover letter generation failed to produce content.")
            
        return GenerateResponse(cover_letter=generated_letter)
    except ValueError as ve:
        # Catch specific ValueErrors from agent_logic for bad inputs
        raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException as http_exc: # Re-raise HTTPException to ensure FastAPI handles it
        raise http_exc
    except Exception as e:
        print(f"Error during cover letter generation: {e}")
        # Log the full error for debugging
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
    finally:
        # Clean up: remove the temporary file and directory
        if temp_file_path and os.path.exists(temp_file_path):
            print(f"Deleting temporary file: {temp_file_path}")
            os.remove(temp_file_path)
        if temp_dir and os.path.exists(temp_dir):
            print(f"Deleting temporary directory: {temp_dir}")
            shutil.rmtree(temp_dir)
        # Ensure the uploaded file stream is closed if not already
        if resume_file:
            await resume_file.close() # Important for UploadFile

# To run this app (save as main.py in backend/app/):
# Ensure you are in the `backend` directory, then run:
# uvicorn app.main:app --reload 