"""
Core LangGraph agent logic for cover letter generation.
"""
import os
import sys
from typing import TypedDict

# Env imports and load env variables
from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv(usecwd=True)) # Ensure .env from project root is loaded

# Langchain and Langtrace imports
from langtrace_python_sdk import langtrace
from langchain_community.document_loaders import PyPDFLoader
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END, START

# Initialize Langtrace (globally for the module)
# langtrace.init(api_key=os.environ.get('LANGTRACE_KEY'))

# --- Define State ---
class AgentState(TypedDict):
    resume_path: str # Path to the resume PDF
    resume_content: str # Extracted text from the resume
    job_description: str
    cover_letter: str
    # output_file: str # No longer saving to file directly from here
    model: ChatOpenAI # The LLM model instance

# --- Node Functions ---

def get_resume_content(state: AgentState) -> dict:
    """Loads and processes the resume PDF from a given path."""
    pdf_path = state.get('resume_path')
    if not pdf_path or not os.path.isfile(pdf_path) or not pdf_path.lower().endswith('.pdf'):
        # This should ideally be validated before calling the graph
        # For now, we can raise an error or return a state indicating failure
        print(f"Invalid resume path: {pdf_path}")
        raise ValueError(f"Invalid or missing resume PDF path: {pdf_path}")

    print(f"Processing resume: {pdf_path}")
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()
    resume_content = " ".join([doc.page_content for doc in docs])
    print("Resume processed successfully.")
    return {"resume_content": resume_content}

# get_job_description node is removed as it's passed directly to the graph.

def generate_cover_letter_node(state: AgentState) -> dict:
    """Generates the cover letter using the resume and job description."""
    print("\nGenerating cover letter...")
    resume_text = state['resume_content']
    job_description = state['job_description']
    model = state['model']

    if not resume_text or not job_description:
        raise ValueError("Resume content and job description are required.")

    system_prompt = """You are an expert cover letter writer. Your task is to create a compelling,
    personalized cover letter that highlights the candidate's relevant experience and skills
    based on their resume and the job description. The cover letter should be approximately
    450 words and should:
    1. Be professional and engaging
    2. Highlight relevant skills and experiences
    3. Show how the candidate's background aligns with the job requirements
    4. Include specific examples from their resume
    5. Be well-structured with an introduction, body paragraphs, and conclusion
    6. Avoid generic phrases and clichés
    7. Maintain a confident and enthusiastic tone
    """

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"""
        Please write a cover letter based on the following information:

        RESUME:
        {resume_text}

        JOB DESCRIPTION:
        {job_description}

        Generate a professional cover letter that effectively connects the candidate's
        experience with the job requirements.
        """)
    ]

    response = model.invoke(messages)
    print("Cover letter generated.")
    return {"cover_letter": response.content}

# save_cover_letter node is removed, the API endpoint will handle the result.

# --- Build Graph ---
def create_graph():
    workflow = StateGraph(AgentState)

    workflow.add_node("get_resume_content", get_resume_content)
    workflow.add_node("generate_cover_letter", generate_cover_letter_node)

    # --- Define Edges ---
    workflow.add_edge(START, "get_resume_content")
    workflow.add_edge("get_resume_content", "generate_cover_letter")
    workflow.add_edge("generate_cover_letter", END)

    return workflow.compile()

# --- Global instances (initialized on FastAPI startup) ---
# These will be initialized in main.py or a dedicated config file

# Example of how it might be run (for testing, not for FastAPI direct use here)
if __name__ == '__main__':
    # This part is for standalone testing of the agent_logic
    # It won't be used when FastAPI runs this.
    
    print("Testing agent_logic standalone...")
    
    # Initialize Langtrace (if not done globally or if you want separate test init)
    if not os.environ.get('LANGTRACE_API_KEY_INITIALIZED'): # Custom flag
        langtrace_api_key = os.environ.get('LANGTRACE_KEY')
        if langtrace_api_key:
            print("Initializing Langtrace for test...")
            langtrace.init(api_key=langtrace_api_key)
            os.environ['LANGTRACE_API_KEY_INITIALIZED'] = 'true'
        else:
            print("LANGTRACE_KEY not found. Skipping Langtrace initialization for test.")

    openai_api_key = os.environ.get('OPENAI_API_KEY')
    if not openai_api_key:
        print("Error: OPENAI_API_KEY environment variable not set for test.")
        sys.exit(1)

    test_model = ChatOpenAI(api_key=openai_api_key, model="gpt-4")
    agent_app = create_graph()

    # Create a dummy resume.pdf for testing if it doesn't exist
    dummy_resume_path = "dummy_resume.pdf"
    if not os.path.exists(dummy_resume_path):
        try:
            from reportlab.pdfgen import canvas
            c = canvas.Canvas(dummy_resume_path)
            c.drawString(100, 750, "This is a dummy resume for testing.")
            c.save()
            print(f"Created dummy resume: {dummy_resume_path}")
        except ImportError:
            print("reportlab not installed. Cannot create dummy_resume.pdf for testing.")
            print("Please create a dummy_resume.pdf manually or install reportlab: pip install reportlab")
            # sys.exit(1) # Or allow to proceed if dummy_resume.pdf is created manually

    # Prepare initial state for the test run
    # Ensure dummy_resume.pdf exists or provide a valid path
    if os.path.exists(dummy_resume_path):
        initial_test_state = {
            "resume_path": dummy_resume_path,
            "job_description": "Seeking a highly motivated individual for a challenging role.",
            "model": test_model
        }
        print(f"Initial test state: {initial_test_state}")

        try:
            final_state = agent_app.invoke(initial_test_state)
            print("\nCover Letter (from test):")
            print(final_state.get("cover_letter"))
        except Exception as e:
            print(f"Error during standalone test: {e}")
    else:
        print(f"{dummy_resume_path} not found and could not be created. Skipping standalone test invocation.") 