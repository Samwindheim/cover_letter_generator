# Cover Letter Generator

An AI-powered full-stack application that generates personalized cover letters based on an uploaded resume (PDF) and a job description.

## Key Features

- **AI-Powered Generation:** Leverages LLM (GPT 4.1 nano) to create tailored cover letters.
- **User-Friendly Interface:** Simple web UI for uploading resumes and inputting job descriptions.
- **PDF Resume Parsing:** Extracts text content from uploaded PDF resumes.
- **Interactive Feedback:** Provides notifications for successful operations or errors.
- **Copy to Clipboard:** Easily copy the generated cover letter.

## Tech Stack & Skills Demonstrated

- **Frontend:**

  - Framework: Next.js, React (v19)
  - Language: TypeScript
  - UI: Shadcn/UI, Radix UI Primitives, Custom React Hooks (e.g., for Toasts)
  - Styling: Tailwind CSS (with `tailwindcss-animate`)
  - Icons: Lucide React
  - API Communication: Client-side `fetch` for interaction with backend API.

- **Backend:**

  - Framework: FastAPI (Python)
  - Language: Python
  - AI/LLM Orchestration: LangChain & LangGraph for building and managing the generation agent.
  - LLM Interaction: OpenAI GPT-4.1 (via `langchain-openai`).
  - Data Handling: Pydantic for data validation, PDF parsing (`PyPDFLoader`), secure file upload and temporary file management.
  - API Design: RESTful endpoint with `multipart/form-data` handling.
  - Asynchronous Programming: Utilizing `async/await` in FastAPI.

- **Full-Stack & General:**
  - Full-Stack Integration: Seamless connection between Next.js frontend and FastAPI backend.
  - Environment Management: Python virtual environments, `python-dotenv` for API keys.
  - Version Control: Git & GitHub.
  - Observability: Setup for Langtrace (performance tracing for LLM applications).

## Project Structure

- `backend/`: FastAPI application for the cover letter generation logic.
- `frontend/`: Next.js/React application for the user interface.
- `.env`: For local environment variables (API keys). Create from `.env.example`.
- `.env.example`: Template for environment variables.

## Setup & Running

### Prerequisites

- Python 3.8+ and `pip`
- Node.js (v18+) and `pnpm` (or `npm`/`yarn` if you've configured it differently)

### 1. Environment Variables

Copy `.env.example` to a new file named `.env` in the project root:

```bash
cp .env.example .env
```

Then, open `.env` and add your actual API keys:

```env
OPENAI_API_KEY=your_openai_api_key_here
LANGTRACE_KEY=your_langtrace_api_key_here
```

### 2. Backend (FastAPI)

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a Python virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the FastAPI application (from the `backend` directory):
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will typically be available at `http://127.0.0.1:8000`.

### 3. Frontend (React + Next.js)

1.  Navigate to the `frontend` directory (from the project root):
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Run the Next.js development server:
    ```bash
    pnpm run dev
    ```
    The frontend will typically be available at `http://localhost:3000` (or another port if 3000 is busy).

## API Endpoint (Backend)

- **POST** `/generate_cover_letter/`
  - **Request Type**: `multipart/form-data`
  - **Form Fields**:
    - `resume_file`: The resume PDF file.
    - `job_description`: Text of the job description.
  - **Success Response (200 OK)**:
    ```json
    {
      "cover_letter": "Generated cover letter text..."
    }
    ```
  - **Error Response (e.g., 422 Unprocessable Entity for validation errors)**:
    ```json
    {
      "detail": "Error message or validation details..."
    }
    ```
