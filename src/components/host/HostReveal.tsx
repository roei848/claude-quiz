import type { RevealData, AnswerKey } from '../../../shared/types'

interface Props {
  data: RevealData
  onNext: () => void
}

const KEYS: AnswerKey[] = ['a', 'b', 'c', 'd']
const KEY_COLORS = { a: '#E74C3C', b: '#3498DB', c: '#F39C12', d: '#2ECC71' }
const KEY_ICONS = { a: '>', b: '#', c: '$', d: '@' }

export default function HostReveal({ data, onNext }: Props) {
  const maxCount = Math.max(...KEYS.map(k => data.distribution[k]), 1)

  return (
    <div className="host-reveal">
      <div className="question-panel">
        <p className="question-text">{data.questionText}</p>
      </div>

      <div className="host-reveal-answers">
        {KEYS.map((key) => {
          const isCorrect = key === data.correctAnswer
          const count = data.distribution[key]
          const pct = (count / maxCount) * 100

          return (
            <div key={key} className={`host-reveal-row ${isCorrect ? 'host-reveal-correct' : ''}`}>
              <div className="host-reveal-label">
                <span className="host-reveal-icon" style={{ color: KEY_COLORS[key] }}>
                  {KEY_ICONS[key]}
                </span>
                <span className="host-reveal-text">{data.answers[key]}</span>
              </div>
              <div className="host-reveal-bar-track">
                <div
                  className="host-reveal-bar"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: KEY_COLORS[key],
                  }}
                />
              </div>
              <span className="host-reveal-count">{count}</span>
            </div>
          )
        })}
      </div>

      <div className="explanation">
        <p className="explanation-label">// Explanation</p>
        <p className="explanation-text">{data.explanation}</p>
      </div>

      <button className="btn-next" onClick={onNext}>
        Leaderboard
        <span>→</span>
      </button>
    </div>
  )
}
