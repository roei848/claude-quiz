import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import socket from '../../socket'
import type { GamePhase, AnswerFeedback, RejoinState } from '../../../shared/types'
import ClientJoin from './ClientJoin'
import ClientWaiting from './ClientWaiting'
import ClientAnswer from './ClientAnswer'
import ClientFeedback from './ClientFeedback'
import ClientFinal from './ClientFinal'

const SESSION_KEY = 'quiz_session'

type ClientPhase = 'join' | 'waiting' | 'question' | 'answered' | 'feedback' | 'leaderboard' | 'finished'

function saveSession(roomCode: string, nickname: string) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ roomCode, nickname }))
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

function loadSession(): { roomCode: string; nickname: string } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

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
      saveSession(data.roomCode, data.nickname)
    })

    socket.on('client:rejoined', (state: RejoinState) => {
      setRoomCode(state.roomCode)
      setNickname(state.nickname)
      setError('')

      if (state.phase === 'question') {
        setQuestionNumber(state.questionNumber ?? 0)
        setTotalQuestions(state.totalQuestions ?? 0)
        setTimeRemaining(state.timeRemaining ?? 0)
        setClientPhase(state.alreadyAnswered ? 'answered' : 'question')
      } else if (state.phase === 'reveal' || state.phase === 'leaderboard') {
        if (state.lastFeedback) {
          setFeedback(state.lastFeedback)
          setClientPhase(state.phase === 'leaderboard' ? 'leaderboard' : 'feedback')
        } else {
          setClientPhase('waiting')
        }
      } else if (state.phase === 'finished' && state.finalResult) {
        setFinalResult(state.finalResult)
        setClientPhase('finished')
      } else {
        setClientPhase('waiting')
      }
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
      clearSession()
    })

    socket.on('error', (data: { message: string }) => {
      setError(data.message)
      if (data.message === 'Room not found' || data.message === 'Host disconnected') {
        clearSession()
      }
    })

    // Attempt to rejoin a previous session on mount
    socket.on('connect', () => {
      const session = loadSession()
      if (session) {
        socket.emit('client:rejoin', session)
      }
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
