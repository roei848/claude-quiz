import type { LeaderboardEntry } from '../../../shared/types'

interface Props {
  leaderboard: LeaderboardEntry[]
  onNext: () => void
}

export default function HostLeaderboard({ leaderboard, onNext }: Props) {
  const top5 = leaderboard.slice(0, 5)

  return (
    <div className="host-leaderboard">
      <p className="host-leaderboard-label">// Leaderboard</p>

      <div className="host-leaderboard-list">
        {top5.map((entry, i) => (
          <div
            key={entry.nickname}
            className={`host-leaderboard-entry ${i === 0 ? 'host-leaderboard-first' : ''}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <span className="host-leaderboard-rank">#{entry.rank}</span>
            <span className="host-leaderboard-name">{entry.nickname}</span>
            <span className="host-leaderboard-score">{entry.score.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <button className="btn-next" onClick={onNext}>
        Next Question
        <span>→</span>
      </button>
    </div>
  )
}
