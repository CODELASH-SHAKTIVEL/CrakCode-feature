import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle file upload
  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  // Handle job description input
  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume || !jobDescription) {
      alert('Please provide both resume and job description.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jobdescription', jobDescription);

    try {
      const response = await axios.post('http://localhost:5000/analytics', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAnalysisResult(response.data.analysis);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setAnalysisResult('An error occurred while processing the resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Resume Analyzer</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label htmlFor="resume">Upload Resume (PDF):</label>
          <input
            type="file"
            id="resume"
            accept=".pdf"
            onChange={handleFileChange}
            required
          />
        </div>

        <div>
          <label htmlFor="jobDescription">Job Description:</label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={handleJobDescriptionChange}
            placeholder="Enter the job description"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </form>

      {analysisResult && (
        <div>
          <h2>AI Analysis:</h2>
          <p>{analysisResult}</p>
        </div>
      )}
    </div>
  );
}

export default App;
