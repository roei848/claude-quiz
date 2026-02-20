import type { QuestionForHost } from '../../../shared/types'

interface Props {
  question: QuestionForHost
  timeRemaining: number
  answeredCount: number
  totalPlayers: number
}

const KEYS = ['a', 'b', 'c', 'd'] as const
const KEY_COLORS = { a: '#E74C3C', b: '#3498DB', c: '#F39C12', d: '#2ECC71' }
const KEY_ICONS = { a: '>', b: '#', c: '$', d: '@' }

export default function HostQuestion({ question, timeRemaining, answeredCount, totalPlayers }: Props) {
  const progressPct = (question.questionNumber / question.totalQuestions) * 100
  const timerDanger = timeRemaining <= 5

  return (
    <div className="host-question">
      <div className="progress-header">
        <span className="progress-label">Question {question.questionNumber} of {question.totalQuestions}</span>
        <span className="progress-counter">{answeredCount} / {totalPlayers} answered</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className={`host-timer ${timerDanger ? 'host-timer-danger' : ''}`}>
        {timeRemaining}
      </div>

      <div className="question-panel" data-num={String(question.questionNumber).padStart(2, '0')}>
        <p className="question-text">{question.question}</p>
      </div>

      <div className="answers-grid">
        {KEYS.map((key) => (
          <div
            key={key}
            className="answer-btn host-answer"
            style={{ borderColor: KEY_COLORS[key] }}
          >
            <span
              className="answer-key"
              style={{ borderColor: KEY_COLORS[key], color: KEY_COLORS[key] }}
            >
              {KEY_ICONS[key]}
            </span>
            <span>{question.answers[key]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
