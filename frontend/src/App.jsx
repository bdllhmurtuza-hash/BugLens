import { useState } from 'react'
import './App.css'

const sections = [
  ['SUMMARY', 'summary'],
  ['ERROR DETECTED', 'error'],
  ['LIKELY ROOT CAUSE', 'root'],
  ['EVIDENCE', 'evidence'],
  ['EXPECTED BEHAVIOR', 'expected'],
  ['ACTUAL BEHAVIOR', 'actual'],
  ['REPRODUCTION STEPS', 'steps'],
  ['RECOMMENDED FIX', 'fix'],
  ['NEXT DEBUGGING STEP', 'next'],
  ['DEVELOPER NOTE', 'note'],
]

function parseReport(text) {
  const result = {
    title: 'Development Error',
  }

  const titleMatch = text.match(
    /BUG TITLE:\s*([\s\S]*?)(?=\n[A-Z][A-Z ]+:\s*|$)/
  )

  if (titleMatch) {
    result.title = titleMatch[1].trim()
  }

  sections.forEach(([label, key]) => {
    const regex = new RegExp(
      `${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z][A-Z ]+:\\s*|$)`
    )

    const match = text.match(regex)

    if (match) {
      result[key] = match[1].trim()
    }
  })

  return result
}

function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [rawAnalysis, setRawAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleFile = (selectedFile) => {
    if (!selectedFile || !selectedFile.type.startsWith('image/')) {
      setError('Please upload an image screenshot.')
      return
    }

    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
    setAnalysis(null)
    setRawAnalysis('')
    setError('')
    setCopied(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  const analyzeScreenshot = async () => {
    if (!file) return

    setLoading(true)
    setAnalysis(null)
    setError('')

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch(
        'http://127.0.0.1:5000/api/analyze',
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setRawAnalysis(data.analysis)
      setAnalysis(parseReport(data.analysis))
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const copyReport = async () => {
    if (!rawAnalysis) return

    await navigator.clipboard.writeText(rawAnalysis)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <main className="app">

      {/* HEADER */}

      <header className="header">
        <div className="brand">
          <div className="brand-mark">B</div>

          <div>
            <div className="logo">BugLens</div>
            <div className="brand-subtitle">
              Development error intelligence
            </div>
          </div>
        </div>

        <div className="gemma-pill">
          <span className="status-dot"></span>
          Powered by Gemma 4
        </div>
      </header>


      {/* HERO */}

      <section className="hero">

        <div className="eyebrow">
          SCREENSHOT → BUG REPORT
        </div>

        <h1>
          Turn development errors into
          <span> actionable reports.</span>
        </h1>

        <p className="hero-text">
          Upload a screenshot of an error from your IDE, terminal,
          browser or development environment. BugLens analyzes the
          visual evidence and turns it into a structured report
          developers can actually use.
        </p>

      </section>


      {/* WORKSPACE */}

      <section className="workspace">

        <div
          className={`upload-box ${preview ? 'has-image' : ''}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >

          {!preview ? (
            <>
              <div className="upload-symbol">
                ↑
              </div>

              <h2>
                Drop an error screenshot here
              </h2>

              <p>
                Drag & drop your screenshot or browse your files
              </p>

              <label className="browse-btn">
                Browse screenshot

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFile(e.target.files[0])
                  }
                  hidden
                />
              </label>

              <span className="file-types">
                PNG · JPG · WEBP
              </span>
            </>
          ) : (
            <div className="preview-container">

              <div className="preview-header">
                <span>UPLOADED SCREENSHOT</span>

                <button
                  className="change-btn"
                  onClick={() =>
                    document.getElementById('fileInput').click()
                  }
                >
                  Change
                </button>
              </div>

              <img
                src={preview}
                alt="Uploaded development error"
              />

              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFile(e.target.files[0])
                }
                hidden
              />

            </div>
          )}

        </div>


        {file && (
          <button
            className="analyze-btn"
            onClick={analyzeScreenshot}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Gemma 4 is analyzing...
              </>
            ) : (
              <>
                Analyze with Gemma 4
                <span>→</span>
              </>
            )}
          </button>
        )}


        {error && (
          <div className="error-box">
            <strong>Analysis failed</strong>
            <span>{error}</span>
          </div>
        )}


        {/* REPORT */}

        {analysis && (
          <section className="report">

            <div className="report-top">

              <div>
                <div className="report-label">
                  GEMMA 4 ANALYSIS
                </div>

                <h2>
                  {analysis.title}
                </h2>
              </div>

              <button
                className="copy-btn"
                onClick={copyReport}
              >
                {copied ? '✓ Copied' : 'Copy Report'}
              </button>

            </div>


            <div className="report-grid">

              {sections.map(([label, key]) => {

                if (!analysis[key]) return null

                const isCode =
                  key === 'error' || key === 'fix'

                return (
                  <article
                    className={`report-card ${
                      key === 'summary'
                        ? 'summary-card'
                        : ''
                    }`}
                    key={key}
                  >

                    <div className="card-label">
                      {label}
                    </div>

                    {isCode ? (
                      <pre className="code-block">
                        {analysis[key]}
                      </pre>
                    ) : (
                      <div className="card-content">
                        {analysis[key]}
                      </div>
                    )}

                  </article>
                )
              })}

            </div>

          </section>
        )}

      </section>


      {/* FOOTER */}

      <footer>
        <span>BugLens</span>
        <span>•</span>
        <span>React</span>
        <span>•</span>
        <span>Flask</span>
        <span>•</span>
        <span>Gemma 4</span>
      </footer>

    </main>
  )
}

export default App