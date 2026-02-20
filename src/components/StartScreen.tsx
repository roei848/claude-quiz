interface Props {
  title: string;
  questionCount: number;
  onStart: () => void;
}

export default function StartScreen({ title, questionCount, onStart }: Props) {
  return (
    <div className="start-screen">
      <p className="start-logo">Claude Code Bootcamp</p>
      <h1 className="start-title">{title}</h1>
      <p className="start-subtitle">Test your knowledge of Claude Code and the agentic loop</p>

      <div className="start-stats">
        <div className="stat-block">
          <span className="stat-value">{questionCount}</span>
          <span className="stat-label">Questions</span>
        </div>
        <div className="start-divider" />
        <div className="stat-block">
          <span className="stat-value">~5</span>
          <span className="stat-label">Minutes</span>
        </div>
        <div className="start-divider" />
        <div className="stat-block">
          <span className="stat-value">4</span>
          <span className="stat-label">Choices</span>
        </div>
      </div>

      <button className="btn-start" onClick={onStart}>
        Initialize Quiz
        <span className="arrow">→</span>
      </button>
    </div>
  )
}
