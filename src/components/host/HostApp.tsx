import { useState, useEffect } from 'react'
import socket from '../../socket'
import type {
  GamePhase,
  PlayerPublic,
  QuestionForHost,
  RevealData,
  LeaderboardEntry,
} from '../../../shared/types'
import HostLobby from './HostLobby'
import HostQuestion from './HostQuestion'
import HostReveal from './HostReveal'
import HostLeaderboard from './HostLeaderboard'
import HostFinal from './HostFinal'

export default function HostApp() {
  const [roomCode, setRoomCode] = useState('')
  const [phase, setPhase] = useState<GamePhase>('lobby')
  const [players, setPlayers] = useState<PlayerPublic[]>([])
  const [questionData, setQuestionData] = useState<QuestionForHost | null>(null)
  const [revealData, setRevealData] = useState<RevealData | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)

  useEffect(() => {
    socket.connect()
    const limit = new URLSearchParams(window.location.search).get('q')
    socket.emit('host:create', limit ? { limit: Number(limit) } : {})

    socket.on('room:created', (data: { roomCode: string }) => {
      setRoomCode(data.roomCode)
    })

    socket.on('room:playerJoined', (data: { players: PlayerPublic[] }) => {
      setPlayers(data.players)
    })

    socket.on('room:playerLeft', (data: { players: PlayerPublic[] }) => {
      setPlayers(data.players)
    })

    socket.on('room:question', (data: QuestionForHost) => {
      setQuestionData(data)
      setPhase('question')
      setAnsweredCount(0)
    })

    socket.on('room:tick', (data: { timeRemaining: number; answeredCount: number }) => {
      setTimeRemaining(data.timeRemaining)
      setAnsweredCount(data.answeredCount)
    })

    socket.on('room:reveal', (data: RevealData) => {
      setRevealData(data)
      setPhase('reveal')
    })

    socket.on('room:leaderboard', (data: { leaderboard: LeaderboardEntry[] }) => {
      setLeaderboard(data.leaderboard)
      setPhase('leaderboard')
    })

    socket.on('room:finished', (data: { leaderboard: LeaderboardEntry[] }) => {
      setLeaderboard(data.leaderboard)
      setPhase('finished')
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [])

  const handleStart = () => {
    socket.emit('host:start', { roomCode })
  }

  const handleNext = () => {
    socket.emit('host:next', { roomCode })
  }

  if (!roomCode) {
    return (
      <div className="app">
        <div className="loading">Creating room...</div>
      </div>
    )
  }

  return (
    <div className="app host-app">
      {phase === 'lobby' && (
        <HostLobby
          roomCode={roomCode}
          players={players}
          onStart={handleStart}
        />
      )}
      {phase === 'question' && questionData && (
        <HostQuestion
          question={questionData}
          timeRemaining={timeRemaining}
          answeredCount={answeredCount}
          totalPlayers={players.length}
        />
      )}
      {phase === 'reveal' && revealData && (
        <HostReveal
          data={revealData}
          onNext={handleNext}
        />
      )}
      {phase === 'leaderboard' && (
        <HostLeaderboard
          leaderboard={leaderboard}
          onNext={handleNext}
        />
      )}
      {phase === 'finished' && (
        <HostFinal leaderboard={leaderboard} />
      )}
    </div>
  )
}
