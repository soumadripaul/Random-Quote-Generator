import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchQuote = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('https://dummyjson.com/quotes/random')
      if (!response.ok) {
        throw new Error('Failed to fetch quote')
      }
      const data = await response.json()
      setQuote(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuote()
  }, [])

  return (
    <div className="app">
      <div className="quote-container">
        <h1 className="title">Random Quote Generator</h1>
        
        {loading && <p className="loading">Loading...</p>}
        
        {error && <p className="error">Error: {error}</p>}
        
        {quote && !loading && (
          <div className="quote-content">
            <div className="quote-text">
              <span className="quote-mark">"</span>
              {quote.quote}
              <span className="quote-mark">"</span>
            </div>
            <div className="quote-author">— {quote.author}</div>
          </div>
        )}
        
        <button 
          className="new-quote-btn" 
          onClick={fetchQuote}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'New Quote'}
        </button>
      </div>
    </div>
  )
}

export default App
