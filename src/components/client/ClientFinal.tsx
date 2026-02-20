import { useNavigate } from 'react-router-dom'

interface Props {
  result: {
    rank: number
    score: number
    totalPlayers: number
  }
}

function getRankMessage(rank: number): string {
  if (rank === 1) return 'Champion!'
  if (rank <= 3) return 'On the Podium!'
  if (rank <= 5) return 'Top 5!'
  return 'Well Played!'
}

export default function ClientFinal({ result }: Props) {
  const navigate = useNavigate()

  return (
    <div className="client-final">
      <p className="client-final-label">// Quiz Complete</p>

      <div className="client-final-rank">#{result.rank}</div>
      <p className="client-final-of">of {result.totalPlayers} players</p>

      <p className="client-final-message">{getRankMessage(result.rank)}</p>

      <p className="client-final-score">{result.score.toLocaleString()} pts</p>

      <button className="btn-restart" onClick={() => navigate('/play')}>
        Play Again
      </button>
    </div>
  )
}
