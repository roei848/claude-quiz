import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import socket from '../../socket'
import type { GamePhase, AnswerFeedback } from '../../../shared/types'
import ClientJoin from './ClientJoin'
import ClientWaiting from './ClientWaiting'
import ClientAnswer from './ClientAnswer'
import ClientFeedback from './ClientFeedback'
import ClientFinal from './ClientFinal'

type ClientPhase = 'join' | 'waiting' | 'question' | 'answered' | 'feedback' | 'leaderboard' | 'finished'

export default function ClientApp() {
  const [searchParams] = useSearchParams()
  const [clientPhase, setClientPhase] = useState<ClientPhase>('join')
  const [roomCode, setRoomCode] = useState(searchParams.get('room') ?? '')
  const [nickname, setNickname] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null)
  const [finalResult, setFinalResult] = useState<{ rank: number; score: number; totalPlayers: number } | null>(null)
  const [error, setError] = useState('')
  const [questionNumber, setQuestionNumber] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)

  useEffect(() => {
    socket.connect()

    socket.on('client:joined', (data: { roomCode: string; nickname: string }) => {
      setRoomCode(data.roomCode)
      setNickname(data.nickname)
      setClientPhase('waiting')
      setError('')
    })

    socket.on('client:questionStart', (data: { questionNumber: number; totalQuestions: number; timeLimit: number }) => {
      setQuestionNumber(data.questionNumber)
      setTotalQuestions(data.totalQuestions)
      setTimeRemaining(data.timeLimit)
      setClientPhase('question')
    })

    socket.on('client:tick', (data: { timeRemaining: number }) => {
      setTimeRemaining(data.timeRemaining)
    })

    socket.on('client:feedback', (data: AnswerFeedback) => {
      setFeedback(data)
      setClientPhase('feedback')
    })

    socket.on('client:phase', (data: { phase: GamePhase }) => {
      if (data.phase === 'leaderboard') {
        setClientPhase('leaderboard')
      }
    })

    socket.on('client:finished', (data: { rank: number; score: number; totalPlayers: number }) => {
      setFinalResult(data)
      setClientPhase('finished')
    })

    socket.on('error', (data: { message: string }) => {
      setError(data.message)
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [])

  const handleJoin = (code: string, name: string) => {
    setError('')
    socket.emit('client:join', { roomCode: code, nickname: name })
  }

  const handleAnswer = (answer: 'a' | 'b' | 'c' | 'd') => {
    socket.emit('client:answer', { roomCode, answer })
    setClientPhase('answered')
  }

  return (
    <div className="client-app">
      {clientPhase === 'join' && (
        <ClientJoin
          initialRoom={roomCode}
          onJoin={handleJoin}
          error={error}
        />
      )}
      {clientPhase === 'waiting' && (
        <ClientWaiting nickname={nickname} roomCode={roomCode} />
      )}
      {(clientPhase === 'question' || clientPhase === 'answered') && (
        <ClientAnswer
          onAnswer={handleAnswer}
          disabled={clientPhase === 'answered'}
          timeRemaining={timeRemaining}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />
      )}
      {(clientPhase === 'feedback' || clientPhase === 'leaderboard') && feedback && (
        <ClientFeedback feedback={feedback} />
      )}
      {clientPhase === 'finished' && finalResult && (
        <ClientFinal result={finalResult} />
      )}
    </div>
  )
}
