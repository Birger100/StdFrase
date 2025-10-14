import { useState, useEffect } from 'react'
import './FlowManager.css'
import config from './config'

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
  activityOrder: number
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
  const [showFlowEditor, setShowFlowEditor] = useState(false)
  const [editingFlow, setEditingFlow] = useState<Flow | null>(null)
  const [flowForm, setFlowForm] = useState({ title: '', sks: '' })
  const [activities, setActivities] = useState<any[]>([])
  const [availableCuestas, setAvailableCuestas] = useState<Cuesta[]>([])
  const [availableActivities, setAvailableActivities] = useState<Activity[]>([])

  const apiUrl = config.API_URL
  const apiKey = config.ApiKey

  useEffect(() => {
    fetchFlows()
  }, [])

  const fetchFlows = async () => {
    try {
      console.log('Fetching flows with API key: ' + apiKey)
      setLoading(true)
      const response = await fetch(`${apiUrl}/rpa`, {
        credentials: 'include',
        headers: {
          'apikey': `${apiKey}`
        }
      })
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
        credentials: 'include',
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
      const response = await fetch(`${apiUrl}/flows/export?sks=${exportSks}`, {
        credentials: 'include'
      })
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
        credentials: 'include',
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

  const fetchCuestas = async (search = '') => {
    try {
      const response = await fetch(`${apiUrl}/cuestas${search ? `?search=${search}` : ''}`, {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch cuestas')
      const data = await response.json()
      setAvailableCuestas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const fetchActivities = async (search = '') => {
    try {
      const response = await fetch(`${apiUrl}/flows/activities${search ? `?search=${search}` : ''}`, {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch activities')
      const data = await response.json()
      setAvailableActivities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const openCreateFlow = () => {
    setEditingFlow(null)
    setFlowForm({ title: '', sks: '' })
    setActivities([])
    setShowFlowEditor(true)
    fetchCuestas()
    fetchActivities()
  }

  const openEditFlow = (flow: Flow) => {
    setEditingFlow(flow)
    setFlowForm({ title: flow.title, sks: flow.sks || '' })
    setActivities(flow.activities.map(a => ({
      name: a.name,
      moId: a.moId || '',
      activityOrder: a.activityOrder || 0,
      fields: a.fields.map(f => ({
        cuestaId: f.cuesta.path,
        fieldOrder: f.fieldOrder,
        fieldType: f.fieldType,
        standardphrase: f.standardPhrase || ''
      }))
    })))
    setShowFlowEditor(true)
    fetchCuestas()
    fetchActivities()
  }

  const saveFlow = async () => {
    try {
      const flowData = {
        title: flowForm.title,
        sks: flowForm.sks || null,
        activity: activities.map(a => ({
          name: a.name,
          moId: a.moId || null,
          activityOrder: a.activityOrder || 0,
          field: a.fields && a.fields.length > 0 ? a.fields : null
        }))
      }

      const url = editingFlow ? `${apiUrl}/flows/${editingFlow.id}` : `${apiUrl}/flows`
      const method = editingFlow ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(flowData)
      })

      if (!response.ok) throw new Error(`Failed to ${editingFlow ? 'update' : 'create'} flow`)

      await fetchFlows()
      setShowFlowEditor(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const addActivity = () => {
    setActivities([...activities, { name: '', moId: '', activityOrder: activities.length + 1, fields: [] }])
  }

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index))
  }

  const updateActivity = (index: number, field: string, value: any) => {
    const updated = [...activities]
    updated[index][field] = value
    setActivities(updated)
  }

  const addFieldToActivity = (activityIndex: number) => {
    const updated = [...activities]
    if (!updated[activityIndex].fields) {
      updated[activityIndex].fields = []
    }
    updated[activityIndex].fields.push({
      cuestaId: '',
      fieldOrder: updated[activityIndex].fields.length + 1,
      fieldType: 0,
      standardphrase: ''
    })
    setActivities(updated)
  }

  const removeFieldFromActivity = (activityIndex: number, fieldIndex: number) => {
    const updated = [...activities]
    updated[activityIndex].fields = updated[activityIndex].fields.filter((_: any, i: number) => i !== fieldIndex)
    setActivities(updated)
  }

  const updateField = (activityIndex: number, fieldIndex: number, field: string, value: any) => {
    const updated = [...activities]
    updated[activityIndex].fields[fieldIndex][field] = value
    setActivities(updated)
  }

  const useExistingActivity = (activity: Activity, activityIndex: number) => {
    const updated = [...activities]
    updated[activityIndex] = {
      name: activity.name,
      moId: activity.moId || '',
      activityOrder: updated[activityIndex].activityOrder,
      fields: activity.fields.map(f => ({
        cuestaId: f.cuesta.path,
        fieldOrder: f.fieldOrder,
        fieldType: f.fieldType,
        standardphrase: f.standardPhrase || ''
      }))
    }
    setActivities(updated)
  }

  const getFieldTypeName = (type: number) => {
    switch (type) {
      case 0: return 'TextField'
      case 1: return 'RadioButton'
      case 2: return 'CheckField'
      default: return 'Unknown'
    }
  }

  return (
    <div className="flow-manager">
      <div className="header">
        <h1>Flow Manager</h1>
        <div className="header-actions">
          <button onClick={openCreateFlow} className="create-btn">
            Create Flow
          </button>
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
                <div className="flow-item-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditFlow(flow)
                    }}
                    className="edit-btn-small"
                  >
                    Edit
                  </button>
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

      {showFlowEditor && (
        <div className="modal-overlay" onClick={() => setShowFlowEditor(false)}>
          <div className="modal flow-editor-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingFlow ? 'Edit Flow' : 'Create Flow'}</h2>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={flowForm.title}
                onChange={(e) => setFlowForm({ ...flowForm, title: e.target.value })}
                placeholder="Flow title"
              />
            </div>

            <div className="form-group">
              <label>SKS Code</label>
              <input
                type="text"
                value={flowForm.sks}
                onChange={(e) => setFlowForm({ ...flowForm, sks: e.target.value })}
                placeholder="SKS code (optional)"
              />
            </div>

            <div className="form-group">
              <label>Activities</label>
              <button onClick={addActivity} className="add-btn">Add Activity</button>

              {activities.map((activity, actIndex) => (
                <div key={actIndex} className="activity-editor">
                  <div className="activity-header">
                    <h4>Activity {actIndex + 1}</h4>
                    <button onClick={() => removeActivity(actIndex)} className="remove-btn">Remove</button>
                  </div>

                  <div className="form-row">
                    <div className="form-group-small">
                      <label>Order</label>
                      <input
                        type="number"
                        value={activity.activityOrder}
                        onChange={(e) => updateActivity(actIndex, 'activityOrder', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label>Name *</label>
                      <input
                        type="text"
                        value={activity.name}
                        onChange={(e) => {
                          updateActivity(actIndex, 'name', e.target.value)
                          // Auto-set moId when selecting from datalist
                          const selectedActivity = availableActivities.find(a => a.name === e.target.value)
                          if (selectedActivity && selectedActivity.moId) {
                            updateActivity(actIndex, 'moId', selectedActivity.moId)
                          }
                        }}
                        placeholder="Activity name"
                        list={`activities-${actIndex}`}
                      />
                      <datalist id={`activities-${actIndex}`}>
                        {availableActivities.map((a) => (
                          <option key={a.id} value={a.name} />
                        ))}
                      </datalist>
                    </div>

                    <div className="form-group">
                      <label>MoId</label>
                      <input
                        type="text"
                        value={activity.moId}
                        onChange={(e) => updateActivity(actIndex, 'moId', e.target.value)}
                        placeholder="MoId (optional)"
                      />
                    </div>
                  </div>

                  <div className="reuse-section">
                    <label>Or reuse existing activity:</label>
                    <select onChange={(e) => {
                      const selectedActivity = availableActivities.find(a => a.id === e.target.value)
                      if (selectedActivity) useExistingActivity(selectedActivity, actIndex)
                      e.target.value = ''
                    }}>
                      <option value="">Select an activity...</option>
                      {availableActivities.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="fields-section">
                    <label>Fields</label>
                    <button onClick={() => addFieldToActivity(actIndex)} className="add-field-btn">Add Field</button>

                    {activity.fields && activity.fields.map((field: any, fieldIndex: number) => (
                      <div key={fieldIndex} className="field-editor">
                        <div className="field-header">
                          <span>Field {fieldIndex + 1}</span>
                          <button onClick={() => removeFieldFromActivity(actIndex, fieldIndex)} className="remove-field-btn">×</button>
                        </div>

                        <div className="form-row">
                          <div className="form-group-small">
                            <label>Order</label>
                            <input
                              type="number"
                              value={field.fieldOrder}
                              onChange={(e) => updateField(actIndex, fieldIndex, 'fieldOrder', parseInt(e.target.value))}
                              min="1"
                            />
                          </div>

                          <div className="form-group-small">
                            <label>Type</label>
                            <select
                              value={field.fieldType}
                              onChange={(e) => updateField(actIndex, fieldIndex, 'fieldType', parseInt(e.target.value))}
                            >
                              <option value={0}>TextField</option>
                              <option value={1}>RadioButton</option>
                              <option value={2}>CheckField</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Cuesta Path *</label>
                            <input
                              type="text"
                              value={field.cuestaId}
                              onChange={(e) => updateField(actIndex, fieldIndex, 'cuestaId', e.target.value)}
                              placeholder="Cuesta path"
                              list={`cuestas-${actIndex}-${fieldIndex}`}
                            />
                            <datalist id={`cuestas-${actIndex}-${fieldIndex}`}>
                              {availableCuestas.map((c) => (
                                <option key={c.id} value={c.path} />
                              ))}
                            </datalist>
                          </div>

                          <div className="form-group">
                            <label>Standard Phrase</label>
                            <input
                              type="text"
                              value={field.standardphrase}
                              onChange={(e) => updateField(actIndex, fieldIndex, 'standardphrase', e.target.value)}
                              placeholder="Standard phrase (optional)"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button onClick={addActivity} className="add-btn">Add Activity</button>
            </div>

            <div className="modal-actions">
              <button onClick={saveFlow} className="save-btn" disabled={!flowForm.title}>
                {editingFlow ? 'Update' : 'Create'}
              </button>
              <button onClick={() => setShowFlowEditor(false)} className="cancel-btn">
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
