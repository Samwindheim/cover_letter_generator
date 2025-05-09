import { useState } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = 'http://127.0.0.1:8000'

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    setResumeFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setCoverLetter('');

    if (!jobDescription.trim() || !resumeFile) {
      setError('Both resume file and job description are required.');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('resume_file', resumeFile);
    formData.append('job_description', jobDescription);

    try {
      console.log("Sending to backend with FormData...");
      const response = await axios.post(`${API_BASE_URL}/generate_cover_letter/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.cover_letter) {
        setCoverLetter(response.data.cover_letter);
      } else {
        setError('Received an unexpected response from the server.');
      }
    } catch (err) {
      console.error("API Error:", err);
      if (err.response && err.response.data && err.response.data.detail) {
        if (Array.isArray(err.response.data.detail)) {
             setError(err.response.data.detail.map(d => `${d.loc.join(' -> ')}: ${d.msg}`).join('\n'));
        } else {
            setError(err.response.data.detail);
        }
      } else if (err.request) {
        setError('Could not connect to the server. Please ensure the backend is running.');
      } else {
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
            <label htmlFor="resumeFile">Resume PDF:</label>
            <input
              type="file"
              id="resumeFile"
              onChange={handleFileChange}
              accept=".pdf"
              disabled={isLoading}
            />
            {resumeFile && <p className="file-name">Selected file: {resumeFile.name}</p>}
            <small>Upload your resume in PDF format.</small>
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

          <button type="submit" disabled={isLoading || !resumeFile}>
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
