import './AccessDenied.css'

interface AccessDeniedProps {
  userName?: string | null
}

function AccessDenied({ userName }: AccessDeniedProps) {
  return (
    <div className="access-denied-container">
      <div className="access-denied-card">
        <div className="access-denied-icon">
          <svg 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h1>Access Denied</h1>
        <div className="access-denied-message">
          <p>
            You do not have permission to access this application.
          </p>
          {userName && (
            <p className="user-info">
              Currently logged in as: <strong>{userName}</strong>
            </p>
          )}
          <div className="access-denied-details">
            <h3>Why am I seeing this?</h3>
            <ul>
              <li>Your Windows account is not in the list of allowed users for this application.</li>
              <li>Access is restricted to authorized personnel only.</li>
            </ul>
            <h3>What should I do?</h3>
            <ul>
              <li>Contact your system administrator to request access.</li>
              <li>Verify you are logged in with the correct Windows account.</li>
              <li>If you believe this is an error, please contact IT support.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessDenied
