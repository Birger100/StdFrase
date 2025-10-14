import { useState, useEffect } from 'react'
import './App.css'
import FlowManager from './FlowManager'
import CuestaManager from './CuestaManager'
import AccessDenied from './AccessDenied'
import { AuthProvider, useAuth } from './AuthContext'

const API_URL = 'https://sfApi.test.it.rn.dk/api'

function AppContent() {
  const [activeTab, setActiveTab] = useState<'flows' | 'cuestas'>('flows')
  const { user, loading, checkAccess } = useAuth()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    const verifyAccess = async () => {
      if (user?.isAuthenticated) {
        const access = await checkAccess()
        setHasAccess(access)
      } else {
        setHasAccess(false)
      }
    }
    
    if (!loading) {
      verifyAccess()
    }
  }, [user, loading, checkAccess])

  if (loading || hasAccess === null) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Authenticating...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return <AccessDenied userName={user?.userName} />
  }

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
        {user?.userName && (
          <div className="user-info-nav">
            Logged in as: <strong>{user.userName}</strong>
          </div>
        )}
      </nav>

      {activeTab === 'flows' ? (
        <FlowManager />
      ) : (
        <CuestaManager />
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider apiUrl={API_URL}>
      <AppContent />
    </AuthProvider>
  )
}

export default App
