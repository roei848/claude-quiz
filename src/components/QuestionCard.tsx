import { Question } from '../types'

interface Props {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  phase: 'answering' | 'feedback';
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  isLast: boolean;
}

const KEYS = ['a', 'b', 'c', 'd'] as const

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  phase,
  selectedAnswer,
  onAnswer,
  onNext,
  isLast,
}: Props) {
  const progressPct = (questionNumber / totalQuestions) * 100

  const getButtonClass = (key: string) => {
    if (phase !== 'feedback') return 'answer-btn'
    if (key === question.correct) return 'answer-btn correct'
    if (key === selectedAnswer) return 'answer-btn wrong'
    return 'answer-btn dimmed'
  }

  return (
    <div className="question-card">
      <div className="progress-header">
        <span className="progress-label">Progress</span>
        <span className="progress-counter">{questionNumber} / {totalQuestions}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="question-panel" data-num={String(questionNumber).padStart(2, '0')}>
        <p className="question-text">{question.question}</p>
      </div>

      <div className="answers-grid">
        {KEYS.map((key) => (
          <button
            key={key}
            className={getButtonClass(key)}
            onClick={() => phase === 'answering' && onAnswer(key)}
            disabled={phase === 'feedback'}
          >
            <span className="answer-key">{key}</span>
            <span>{question.answers[key]}</span>
          </button>
        ))}
      </div>

      {phase === 'feedback' && (
        <>
          <div className="explanation">
            <p className="explanation-label">// Explanation</p>
            <p className="explanation-text">{question.explanation}</p>
          </div>
          <button className="btn-next" onClick={onNext}>
            {isLast ? 'View Results' : 'Next Question'}
            <span>→</span>
          </button>
        </>
      )}
    </div>
  )
}
