import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteQuotes')
    return saved ? JSON.parse(saved) : []
  })
  const [showFavorites, setShowFavorites] = useState(false)
  const [copied, setCopied] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [countdown, setCountdown] = useState(10)

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

  const copyToClipboard = async () => {
    if (quote) {
      const text = `"${quote.quote}" - ${quote.author}`
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const toggleFavorite = () => {
    if (!quote) return
    
    const isFavorite = favorites.some(fav => fav.id === quote.id)
    let newFavorites
    
    if (isFavorite) {
      newFavorites = favorites.filter(fav => fav.id !== quote.id)
    } else {
      newFavorites = [...favorites, quote]
    }
    
    setFavorites(newFavorites)
    localStorage.setItem('favoriteQuotes', JSON.stringify(newFavorites))
  }

  const loadFavoriteQuote = (fav) => {
    setQuote(fav)
    setShowFavorites(false)
  }

  const removeFavorite = (id) => {
    const newFavorites = favorites.filter(fav => fav.id !== id)
    setFavorites(newFavorites)
    localStorage.setItem('favoriteQuotes', JSON.stringify(newFavorites))
  }

  useEffect(() => {
    fetchQuote()
  }, [])

  useEffect(() => {
    let interval
    if (autoRefresh && !showFavorites) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            fetchQuote()
            return 10
          }
          return prev - 1
        })
      }, 1000)
    } else {
      setCountdown(10)
    }
    return () => clearInterval(interval)
  }, [autoRefresh, showFavorites])

  return (
    <div className="app">
      <div className="quote-container">
        <h1 className="title">Random Quote Generator</h1>
        
        <div className="controls">
          <button 
            className={`control-btn ${showFavorites ? 'active' : ''}`}
            onClick={() => setShowFavorites(!showFavorites)}
          >
            ❤️ Favorites ({favorites.length})
          </button>
          <button 
            className={`control-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            ⏱️ Auto {autoRefresh ? `(${countdown}s)` : 'Off'}
          </button>
        </div>

        {showFavorites ? (
          <div className="favorites-list">
            {favorites.length === 0 ? (
              <p className="empty-favorites">No favorite quotes yet. Add some!</p>
            ) : (
              favorites.map(fav => (
                <div key={fav.id} className="favorite-item">
                  <div onClick={() => loadFavoriteQuote(fav)} className="favorite-content">
                    <div className="favorite-text">"{fav.quote}"</div>
                    <div className="favorite-author">— {fav.author}</div>
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => removeFavorite(fav.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
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
                
                <div className="action-buttons">
                  <button 
                    className="action-btn copy-btn"
                    onClick={copyToClipboard}
                    title="Copy to clipboard"
                  >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <button 
                    className={`action-btn favorite-btn ${favorites.some(fav => fav.id === quote.id) ? 'favorited' : ''}`}
                    onClick={toggleFavorite}
                    title={favorites.some(fav => fav.id === quote.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {favorites.some(fav => fav.id === quote.id) ? '❤️ Favorited' : '🤍 Favorite'}
                  </button>
                </div>
              </div>
            )}
            
            <button 
              className="new-quote-btn" 
              onClick={fetchQuote}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'New Quote'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default App
