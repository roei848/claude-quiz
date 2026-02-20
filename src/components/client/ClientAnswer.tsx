import { useState } from 'react'
import type { AnswerKey } from '../../../shared/types'

interface Props {
  onAnswer: (answer: AnswerKey) => void
  disabled: boolean
  timeRemaining: number
  questionNumber: number
  totalQuestions: number
}

const BUTTONS: { key: AnswerKey; icon: string; color: string }[] = [
  { key: 'a', icon: '>', color: '#E74C3C' },
  { key: 'b', icon: '#', color: '#3498DB' },
  { key: 'c', icon: '$', color: '#F39C12' },
  { key: 'd', icon: '@', color: '#2ECC71' },
]

export default function ClientAnswer({ onAnswer, disabled, timeRemaining, questionNumber, totalQuestions }: Props) {
  const [selected, setSelected] = useState<AnswerKey | null>(null)

  const handleTap = (key: AnswerKey) => {
    if (disabled || selected) return
    setSelected(key)
    onAnswer(key)
  }

  return (
    <div className="client-answer">
      <div className="client-answer-header">
        <span className="client-answer-qnum">Q{questionNumber}/{totalQuestions}</span>
        <span className={`client-answer-timer ${timeRemaining <= 5 ? 'client-answer-timer-danger' : ''}`}>
          {timeRemaining}s
        </span>
      </div>
      <div className="client-answer-grid">
        {BUTTONS.map(({ key, icon, color }) => (
          <button
            key={key}
            className={`client-answer-btn ${selected === key ? 'client-answer-btn-selected' : ''} ${disabled && selected !== key ? 'client-answer-btn-disabled' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => handleTap(key)}
            disabled={disabled}
          >
            <span className="client-answer-icon">{icon}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
