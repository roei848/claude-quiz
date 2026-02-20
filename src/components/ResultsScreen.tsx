interface Props {
  score: number;
  total: number;
  onRestart: () => void;
}

function getMessage(pct: number): string {
  if (pct === 100) return 'Perfect Score'
  if (pct >= 80) return 'Expert'
  if (pct >= 60) return 'Proficient'
  if (pct >= 40) return 'Keep Studying'
  return 'Beginner Mode'
}

export default function ResultsScreen({ score, total, onRestart }: Props) {
  const pct = Math.round((score / total) * 100)
  const message = getMessage(pct)

  return (
    <div className="results-screen">
      <p className="results-label">// Quiz Complete</p>

      <div className="score-display">
        <div className="score-number">{score}</div>
        <p className="score-total">out of {total} correct</p>
      </div>

      <p className="score-percent">{pct}% accuracy</p>
      <div className="score-message">{message}</div>

      <div className="results-bar-track">
        <div
          className="results-bar-fill"
          style={{ '--pct': `${pct}%` } as React.CSSProperties}
        />
      </div>

      <button className="btn-restart" onClick={onRestart}>
        ↺ Restart Quiz
      </button>
    </div>
  )
}
