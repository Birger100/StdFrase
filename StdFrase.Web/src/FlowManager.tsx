import { useState, useEffect } from 'react'
import './FlowManager.css'

interface Cuesta {
  id: string
  path: string
}

interface Field {
  id: string
  fieldOrder: number
  fieldType: number
  standardPhrase: string | null
  cuesta: Cuesta
}

interface Activity {
  id: string
  name: string
  moId: string | null
  fields: Field[]
}

interface Flow {
  id: string
  title: string
  sks: string | null
  activities: Activity[]
}

function FlowManager() {
  const [flows, setFlows] = useState<Flow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importJson, setImportJson] = useState('')
  const [exportSks, setExportSks] = useState('')

  const apiUrl = 'http://localhost:5000/api'

  useEffect(() => {
    fetchFlows()
  }, [])

  const fetchFlows = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${apiUrl}/flows`)
      if (!response.ok) {
        throw new Error('Failed to fetch flows')
      }
      const data = await response.json()
      setFlows(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const importFlow = async () => {
    try {
      const flowData = JSON.parse(importJson)
      const response = await fetch(`${apiUrl}/flows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flowData),
      })
      if (!response.ok) {
        throw new Error('Failed to import flow')
      }
      await fetchFlows()
      setImportJson('')
      setShowImportModal(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const exportFlowsBySks = async () => {
    try {
      const response = await fetch(`${apiUrl}/flows/export?sks=${exportSks}`)
      if (!response.ok) {
        throw new Error('Failed to export flows')
      }
      const data = await response.json()
      const jsonString = JSON.stringify(data, null, 2)
      
      // Download as file
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `flows-${exportSks}.json`
      a.click()
      URL.revokeObjectURL(url)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const deleteFlow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flow?')) return
    
    try {
      const response = await fetch(`${apiUrl}/flows/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete flow')
      }
      await fetchFlows()
      if (selectedFlow?.id === id) {
        setSelectedFlow(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const getFieldTypeName = (type: number) => {
    switch (type) {
      case 0: return 'Text'
      case 1: return 'Boolean'
      case 2: return 'Choice'
      default: return 'Unknown'
    }
  }

  return (
    <div className="flow-manager">
      <div className="header">
        <h1>Flow Manager</h1>
        <div className="header-actions">
          <button onClick={() => setShowImportModal(true)} className="import-btn">
            Import Flow
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="export-section">
        <h2>Export Flows by SKS</h2>
        <div className="export-form">
          <input
            type="text"
            placeholder="Enter SKS code"
            value={exportSks}
            onChange={(e) => setExportSks(e.target.value)}
          />
          <button onClick={exportFlowsBySks} disabled={!exportSks}>
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading flows...</div>
      ) : (
        <div className="flows-container">
          <div className="flows-list">
            <h2>Flows ({flows.length})</h2>
            {flows.map((flow) => (
              <div
                key={flow.id}
                className={`flow-item ${selectedFlow?.id === flow.id ? 'selected' : ''}`}
                onClick={() => setSelectedFlow(flow)}
              >
                <div className="flow-title">{flow.title}</div>
                {flow.sks && <div className="flow-sks">SKS: {flow.sks}</div>}
                <div className="flow-stats">
                  {flow.activities.length} activities
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteFlow(flow.id)
                  }}
                  className="delete-btn-small"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="flow-details">
            {selectedFlow ? (
              <>
                <h2>{selectedFlow.title}</h2>
                {selectedFlow.sks && <p className="sks-code">SKS: {selectedFlow.sks}</p>}
                
                <h3>Activities</h3>
                {selectedFlow.activities.map((activity) => (
                  <div key={activity.id} className="activity-card">
                    <h4>{activity.name}</h4>
                    {activity.moId && <p className="mo-id">MoId: {activity.moId}</p>}
                    
                    {activity.fields.length > 0 && (
                      <>
                        <h5>Fields</h5>
                        <table className="fields-table">
                          <thead>
                            <tr>
                              <th>Order</th>
                              <th>Type</th>
                              <th>Standard Phrase</th>
                              <th>Cuesta Path</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activity.fields.map((field) => (
                              <tr key={field.id}>
                                <td>{field.fieldOrder}</td>
                                <td>{getFieldTypeName(field.fieldType)}</td>
                                <td>{field.standardPhrase || '-'}</td>
                                <td className="cuesta-path">{field.cuesta.path}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="no-selection">Select a flow to view details</div>
            )}
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Import Flow</h2>
            <textarea
              placeholder="Paste JSON here..."
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              rows={15}
            />
            <div className="modal-actions">
              <button onClick={importFlow} className="import-confirm-btn">
                Import
              </button>
              <button onClick={() => setShowImportModal(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FlowManager
