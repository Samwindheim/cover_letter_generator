# Cover Letter Generator

This project is a full-stack application that generates cover letters based on an uploaded resume (PDF) and a job description.

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

## Contributing

(Optional: Add guidelines if you plan to have contributors)
