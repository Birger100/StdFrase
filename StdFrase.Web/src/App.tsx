import { useState } from 'react'
import './App.css'
import FlowManager from './FlowManager'
import CuestaManager from './CuestaManager'

function App() {
  const [activeTab, setActiveTab] = useState<'flows' | 'cuestas'>('flows')

  return (
    <div className="app">
      <nav className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'flows' ? 'active' : ''}`}
          onClick={() => setActiveTab('flows')}
        >
          Flows
        </button>
        <button 
          className={`nav-tab ${activeTab === 'cuestas' ? 'active' : ''}`}
          onClick={() => setActiveTab('cuestas')}
        >
          Cuestas
        </button>
      </nav>

      {activeTab === 'flows' ? (
        <FlowManager />
      ) : (
        <CuestaManager />
      )}
    </div>
  )
}

export default App
