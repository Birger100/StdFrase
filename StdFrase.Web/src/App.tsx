import { useState, useEffect } from 'react'
import './App.css'

interface Phrase {
  id: number
  text: string
  category: string
  createdAt: string
  updatedAt?: string
}

function App() {
  const [phrases, setPhrases] = useState<Phrase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPhrase, setNewPhrase] = useState({ text: '', category: '' })

  const apiUrl = 'http://localhost:5000/api/phrases'

  useEffect(() => {
    fetchPhrases()
  }, [])

  const fetchPhrases = async () => {
    try {
      setLoading(true)
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch phrases')
      }
      const data = await response.json()
      setPhrases(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addPhrase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPhrase.text || !newPhrase.category) return

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPhrase),
      })
      if (!response.ok) {
        throw new Error('Failed to add phrase')
      }
      await fetchPhrases()
      setNewPhrase({ text: '', category: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const deletePhrase = async (id: number) => {
    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete phrase')
      }
      await fetchPhrases()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <div className="container">
      <h1>StdFrase - Standard Phrases Manager</h1>
      
      {error && <div className="error">{error}</div>}
      
      <div className="add-phrase-section">
        <h2>Add New Phrase</h2>
        <form onSubmit={addPhrase}>
          <input
            type="text"
            placeholder="Phrase text"
            value={newPhrase.text}
            onChange={(e) => setNewPhrase({ ...newPhrase, text: e.target.value })}
          />
          <input
            type="text"
            placeholder="Category"
            value={newPhrase.category}
            onChange={(e) => setNewPhrase({ ...newPhrase, category: e.target.value })}
          />
          <button type="submit">Add Phrase</button>
        </form>
      </div>

      <div className="phrases-section">
        <h2>Phrases</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="phrases-grid">
            {phrases.map((phrase) => (
              <div key={phrase.id} className="phrase-card">
                <div className="phrase-category">{phrase.category}</div>
                <div className="phrase-text">{phrase.text}</div>
                <div className="phrase-date">
                  {new Date(phrase.createdAt).toLocaleDateString()}
                </div>
                <button onClick={() => deletePhrase(phrase.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
