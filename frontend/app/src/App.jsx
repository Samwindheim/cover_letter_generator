import { useState } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = 'http://127.0.0.1:8000'

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumePath, setResumePath] = useState(''); // Temporary for path input
  const [coverLetter, setCoverLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setCoverLetter('');

    // Basic validation
    if (!jobDescription.trim() || !resumePath.trim()) {
      setError('Both resume path and job description are required.');
      setIsLoading(false);
      return;
    }

    try {
      console.log("Sending to backend:", { resume_path: resumePath, job_description: jobDescription });
      const response = await axios.post(`${API_BASE_URL}/generate_cover_letter/`, {
        resume_path: resumePath, // Ensure keys match FastAPI model
        job_description: jobDescription,
      });

      if (response.data && response.data.cover_letter) {
        setCoverLetter(response.data.cover_letter);
      } else {
        setError('Received an unexpected response from the server.');
      }
    } catch (err) {
      console.error("API Error:", err);
      if (err.response && err.response.data && err.response.data.detail) {
        // FastAPI validation errors or specific HTTPException details
        if (Array.isArray(err.response.data.detail)) {
             // Handle Pydantic validation errors (which are an array of objects)
             setError(err.response.data.detail.map(d => `${d.loc.join(' -> ')}: ${d.msg}`).join('\n'));
        } else {
            // Handle other FastAPI HTTPExceptions (string detail)
            setError(err.response.data.detail);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('Could not connect to the server. Please ensure the backend is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`An error occurred: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cover Letter Generator</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit} className="cover-letter-form">
          <div className="form-group">
            <label htmlFor="resumePath">Resume PDF Path:</label>
            <input
              type="text"
              id="resumePath"
              value={resumePath}
              onChange={(e) => setResumePath(e.target.value)}
              placeholder="/path/to/your/resume.pdf"
              disabled={isLoading}
            />
            <small>Note: Enter the full local path to your resume PDF. This will be replaced by a file upload later.</small>
          </div>

          <div className="form-group">
            <label htmlFor="jobDescription">Job Description:</label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              placeholder="Paste the job description here..."
              disabled={isLoading}
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Cover Letter'}
          </button>
        </form>

        {error && (
          <div className="results-section error-message">
            <h2>Error</h2>
            <pre>{error}</pre>
          </div>
        )}

        {coverLetter && (
          <div className="results-section">
            <h2>Generated Cover Letter</h2>
            <pre className="cover-letter-output">{coverLetter}</pre>
          </div>
        )}
         {!isLoading && !coverLetter && !error && (
          <div className="results-section placeholder-text">
            <p>Your generated cover letter will appear here once submitted.</p>
          </div>
        )}
      </main>
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} Cover Letter Generator</p>
      </footer>
    </div>
  );
}

export default App;
