import { useNavigate } from 'react-router-dom'
import type { LeaderboardEntry } from '../../../shared/types'

interface Props {
  leaderboard: LeaderboardEntry[]
}

export default function HostFinal({ leaderboard }: Props) {
  const navigate = useNavigate()
  const winner = leaderboard[0]
  const podium = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <div className="host-final">
      <p className="host-final-label">// Quiz Complete</p>

      {winner && (
        <div className="host-final-winner">
          <p className="host-final-winner-tag">Champion</p>
          <p className="host-final-winner-name">{winner.nickname}</p>
          <p className="host-final-winner-score">{winner.score.toLocaleString()} pts</p>
        </div>
      )}

      <div className="host-final-podium">
        {podium.map((entry, i) => (
          <div
            key={entry.nickname}
            className={`host-final-podium-entry host-final-podium-${i + 1}`}
          >
            <span className="host-leaderboard-rank">#{entry.rank}</span>
            <span className="host-leaderboard-name">{entry.nickname}</span>
            <span className="host-leaderboard-score">{entry.score.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {rest.length > 0 && (
        <div className="host-final-rest">
          {rest.map((entry) => (
            <div key={entry.nickname} className="host-leaderboard-entry">
              <span className="host-leaderboard-rank">#{entry.rank}</span>
              <span className="host-leaderboard-name">{entry.nickname}</span>
              <span className="host-leaderboard-score">{entry.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      <button className="btn-restart" onClick={() => navigate('/')}>
        Back to Menu
      </button>
    </div>
  )
}
