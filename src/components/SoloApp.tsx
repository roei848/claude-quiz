import { useState, useEffect } from 'react'
import type { Question, QuizData } from '../types'
import StartScreen from './StartScreen'
import QuestionCard from './QuestionCard'
import ResultsScreen from './ResultsScreen'

type Phase = 'idle' | 'answering' | 'feedback' | 'done'

export default function SoloApp() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [title, setTitle] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/questions.json')
      .then(res => res.json())
      .then((data: QuizData) => {
        setTitle(data.title)
        setQuestions(data.questions)
        setLoading(false)
      })
  }, [])

  const handleStart = () => {
    setCurrentIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setPhase('answering')
  }

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    if (answer === questions[currentIndex].correct) {
      setScore(s => s + 1)
    }
    setPhase('feedback')
  }

  const handleNext = () => {
    const nextIndex = currentIndex + 1
    if (nextIndex >= questions.length) {
      setPhase('done')
    } else {
      setCurrentIndex(nextIndex)
      setSelectedAnswer(null)
      setPhase('answering')
    }
  }

  const handleRestart = () => {
    setPhase('idle')
    setCurrentIndex(0)
    setScore(0)
    setSelectedAnswer(null)
  }

  if (loading) {
    return <div className="loading">Loading quiz...</div>
  }

  return (
    <div className="app">
      {phase === 'idle' && (
        <StartScreen
          title={title}
          questionCount={questions.length}
          onStart={handleStart}
        />
      )}
      {(phase === 'answering' || phase === 'feedback') && questions.length > 0 && (
        <QuestionCard
          question={questions[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          phase={phase}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswer}
          onNext={handleNext}
          isLast={currentIndex === questions.length - 1}
        />
      )}
      {phase === 'done' && (
        <ResultsScreen
          score={score}
          total={questions.length}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}
