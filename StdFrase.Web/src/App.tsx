import { useState } from 'react'
import './App.css'
import FlowManager from './FlowManager'
import CuestaManager from './CuestaManager'
import { createSparkles } from './sparkles'

function App() {
  const [activeTab, setActiveTab] = useState<'flows' | 'cuestas'>('flows')

  const handleTabClick = (tab: 'flows' | 'cuestas', e: React.MouseEvent<HTMLButtonElement>) => {
    createSparkles(e)
    setActiveTab(tab)
  }

  return (
    <div className="app">
      <nav className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'flows' ? 'active' : ''}`}
          onClick={(e) => handleTabClick('flows', e)}
        >
          Flows
        </button>
        <button 
          className={`nav-tab ${activeTab === 'cuestas' ? 'active' : ''}`}
          onClick={(e) => handleTabClick('cuestas', e)}
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
