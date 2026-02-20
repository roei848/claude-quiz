import { useNavigate } from 'react-router-dom'

export default function ModeSelect() {
  const navigate = useNavigate()

  return (
    <div className="start-screen">
      <p className="start-logo">Claude Code Bootcamp</p>
      <h1 className="start-title">Quiz Arena</h1>
      <p className="start-subtitle">Host a multiplayer quiz or join one from your phone</p>

      <div className="mode-buttons">
        <button className="btn-mode btn-mode-host" onClick={() => navigate('/host')}>
          <span className="mode-icon">{'>'}_</span>
          <span className="mode-label">Host a Game</span>
          <span className="mode-desc">Project on big screen</span>
        </button>

        <button className="btn-mode btn-mode-join" onClick={() => navigate('/play')}>
          <span className="mode-icon">#</span>
          <span className="mode-label">Join a Game</span>
          <span className="mode-desc">Play from your phone</span>
        </button>
      </div>

      <button className="btn-solo" onClick={() => navigate('/solo')}>
        Play Solo
        <span className="arrow">→</span>
      </button>
    </div>
  )
}
