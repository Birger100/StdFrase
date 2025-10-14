import { useState, useEffect } from 'react'
import './CuestaManager.css'
import config from './config'

interface Cuesta {
  id: string
  path: string
}

function CuestaManager() {
  const [cuestas, setCuestas] = useState<Cuesta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingCuesta, setEditingCuesta] = useState<Cuesta | null>(null)
  const [newCuestaPath, setNewCuestaPath] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const apiUrl = config.API_URL + '/cuestas'

  useEffect(() => {
    fetchCuestas()
  }, [searchQuery])

  const fetchCuestas = async () => {
    try {
      setLoading(true)
      const url = searchQuery
        ? `${apiUrl}?search=${encodeURIComponent(searchQuery)}`
        : apiUrl
      const response = await fetch(url, {
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error('Failed to fetch cuestas')
      }
      const data = await response.json()
      setCuestas(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createCuesta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCuestaPath.trim()) return

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ path: newCuestaPath }),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to create cuesta')
      }
      await fetchCuestas()
      setNewCuestaPath('')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const updateCuesta = async () => {
    if (!editingCuesta || !editingCuesta.path.trim()) return

    try {
      const response = await fetch(`${apiUrl}/${editingCuesta.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ path: editingCuesta.path }),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to update cuesta')
      }
      await fetchCuestas()
      setEditingCuesta(null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const deleteCuesta = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cuesta?')) return

    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to delete cuesta')
      }
      await fetchCuestas()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <div className="cuesta-manager">
      <div className="header">
        <h1>Cuesta Manager</h1>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="search-section">
        <input
          type="text"
          placeholder="Search cuestas by path..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="add-cuesta-section">
        <h2>Add New Cuesta</h2>
        <form onSubmit={createCuesta} className="add-form">
          <input
            type="text"
            placeholder="Cuesta path (e.g., /path/to/cuesta)"
            value={newCuestaPath}
            onChange={(e) => setNewCuestaPath(e.target.value)}
            className="path-input"
          />
          <button type="submit" className="add-btn">Add Cuesta</button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Loading cuestas...</div>
      ) : (
        <div className="cuestas-section">
          <h2>Cuestas ({cuestas.length})</h2>
          <div className="cuestas-grid">
            {cuestas.map((cuesta) => (
              <div key={cuesta.id} className="cuesta-card">
                <div className="cuesta-path">{cuesta.path}</div>
                <div className="cuesta-actions">
                  <button
                    onClick={() => setEditingCuesta(cuesta)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCuesta(cuesta.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {cuestas.length === 0 && (
              <div className="no-cuestas">No cuestas found</div>
            )}
          </div>
        </div>
      )}

      {editingCuesta && (
        <div className="modal-overlay" onClick={() => setEditingCuesta(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Cuesta</h2>
            <input
              type="text"
              value={editingCuesta.path}
              onChange={(e) => setEditingCuesta({ ...editingCuesta, path: e.target.value })}
              className="edit-input"
              placeholder="Cuesta path"
            />
            <div className="modal-actions">
              <button onClick={updateCuesta} className="save-btn">
                Save
              </button>
              <button onClick={() => setEditingCuesta(null)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CuestaManager
