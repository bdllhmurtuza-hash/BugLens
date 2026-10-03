import { useState } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = (selectedFile) => {
    if (!selectedFile || !selectedFile.type.startsWith('image/')) {
      setError('Please upload an image screenshot.')
      return
    }

    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
    setAnalysis('')
    setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  const analyzeScreenshot = async () => {
    if (!file) return

    setLoading(true)
    setAnalysis('')
    setError('')

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('http://127.0.0.1:5000/api/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setAnalysis(data.analysis)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app">
      <header className="header">
        <div className="logo">Bug<span>Lens</span></div>
        <p>AI-powered screenshot debugging</p>
      </header>

      <section className="hero">
        <div className="badge">POWERED BY GEMMA 4</div>

        <h1>
          Turn confusing errors into
          <span> clear fixes.</span>
        </h1>

        <p className="subtitle">
          Upload a screenshot of your error. BugLens analyzes it and tells you
          what went wrong, why, and what to do next.
        </p>
      </section>

      <section className="workspace">
        <div
          className={`upload-box ${preview ? 'has-image' : ''}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Uploaded error screenshot" />

              <button
                className="change-btn"
                onClick={() => document.getElementById('fileInput').click()}
              >
                Change screenshot
              </button>
            </div>
          ) : (
            <>
              <div className="upload-icon">↑</div>

              <h2>Drop your error screenshot here</h2>

              <p>or</p>

              <label className="browse-btn">
                Browse files
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e.target.files[0])}
                  hidden
                />
              </label>

              <small>PNG, JPG or WEBP</small>
            </>
          )}

          {preview && (
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files[0])}
              hidden
            />
          )}
        </div>

        {file && (
          <button
            className="analyze-btn"
            onClick={analyzeScreenshot}
            disabled={loading}
          >
            {loading ? 'Analyzing with Gemma 4...' : 'Analyze Error →'}
          </button>
        )}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {analysis && (
          <section className="result">
            <div className="result-header">
              <span className="result-badge">GEMMA 4 ANALYSIS</span>
              <h2>Here's what BugLens found</h2>
            </div>

            <div className="analysis-box">
              {analysis.split('\n').map((line, index) => {
                const isHeading =
                  line.startsWith('PROBLEM:') ||
                  line.startsWith('LIKELY CAUSE:') ||
                  line.startsWith('FIX:') ||
                  line.startsWith('NEXT STEP:')

                return (
                  <p
                    key={index}
                    className={isHeading ? 'analysis-heading' : ''}
                  >
                    {line}
                  </p>
                )
              })}
            </div>
          </section>
        )}
      </section>

      <footer>
        BugLens · Built with React, Flask & Gemma 4
      </footer>
    </main>
  )
}

export default App