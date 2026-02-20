import type { AnswerFeedback } from '../../../shared/types'

interface Props {
  feedback: AnswerFeedback
}

export default function ClientFeedback({ feedback }: Props) {
  return (
    <div className={`client-feedback ${feedback.correct ? 'client-feedback-correct' : 'client-feedback-wrong'}`}>
      <div className="client-feedback-icon">
        {feedback.correct ? '✓' : '✗'}
      </div>
      <p className="client-feedback-result">
        {feedback.correct ? 'Correct!' : 'Wrong!'}
      </p>
      {feedback.pointsEarned > 0 && (
        <p className="client-feedback-points">+{feedback.pointsEarned.toLocaleString()} pts</p>
      )}
      <div className="client-feedback-stats">
        <div className="client-feedback-stat">
          <span className="client-feedback-stat-value">{feedback.totalScore.toLocaleString()}</span>
          <span className="client-feedback-stat-label">Total Score</span>
        </div>
        <div className="client-feedback-stat">
          <span className="client-feedback-stat-value">#{feedback.rank}</span>
          <span className="client-feedback-stat-label">of {feedback.totalPlayers}</span>
        </div>
      </div>
    </div>
  )
}
