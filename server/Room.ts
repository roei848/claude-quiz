import type { Server } from 'socket.io'
import type {
  Question,
  AnswerKey,
  PlayerPublic,
  GamePhase,
  QuestionForHost,
  RevealData,
  LeaderboardEntry,
  AnswerFeedback,
} from '../shared/types'

interface Player {
  id: string
  nickname: string
  score: number
  currentAnswer: AnswerKey | null
  answerTime: number | null
}

const TIME_PER_QUESTION = 20 // seconds
const BASE_POINTS = 1000
const SPEED_BONUS = 500

export class Room {
  roomCode: string
  hostSocketId: string
  players: Map<string, Player> = new Map()
  phase: GamePhase = 'lobby'
  questions: Question[]
  currentQuestionIndex = 0
  questionStartTime = 0
  timer: ReturnType<typeof setInterval> | null = null
  timeRemaining = 0
  private io: Server

  constructor(io: Server, roomCode: string, hostSocketId: string, questions: Question[]) {
    this.io = io
    this.roomCode = roomCode
    this.hostSocketId = hostSocketId
    this.questions = questions
  }

  private getPublicPlayers(): PlayerPublic[] {
    return Array.from(this.players.values())
      .map(p => ({ id: p.id, nickname: p.nickname, score: p.score }))
      .sort((a, b) => b.score - a.score)
  }

  private getLeaderboard(): LeaderboardEntry[] {
    const sorted = Array.from(this.players.values()).sort((a, b) => b.score - a.score)
    return sorted.map((p, i) => ({
      nickname: p.nickname,
      score: p.score,
      rank: i + 1,
      delta: 0,
    }))
  }

  addPlayer(socketId: string, nickname: string): { success: boolean; error?: string } {
    if (this.phase !== 'lobby') {
      return { success: false, error: 'Game already in progress' }
    }

    const nicknameTaken = Array.from(this.players.values()).some(
      p => p.nickname.toLowerCase() === nickname.toLowerCase()
    )
    if (nicknameTaken) {
      return { success: false, error: 'Nickname already taken' }
    }

    this.players.set(socketId, {
      id: socketId,
      nickname,
      score: 0,
      currentAnswer: null,
      answerTime: null,
    })

    this.io.to(this.hostSocketId).emit('room:playerJoined', {
      players: this.getPublicPlayers(),
    })

    return { success: true }
  }

  removePlayer(socketId: string) {
    this.players.delete(socketId)
    this.io.to(this.hostSocketId).emit('room:playerLeft', {
      players: this.getPublicPlayers(),
    })

    // If all players answered during question phase, end early
    if (this.phase === 'question' && this.allAnswered()) {
      this.endQuestion()
    }
  }

  startGame() {
    if (this.phase !== 'lobby' || this.players.size === 0) return
    this.currentQuestionIndex = 0
    this.startQuestion()
  }

  private startQuestion() {
    this.phase = 'question'
    this.timeRemaining = TIME_PER_QUESTION
    this.questionStartTime = Date.now()

    // Reset player answers for this question
    for (const player of this.players.values()) {
      player.currentAnswer = null
      player.answerTime = null
    }

    const q = this.questions[this.currentQuestionIndex]
    const questionData: QuestionForHost = {
      question: q.question,
      answers: q.answers,
      questionNumber: this.currentQuestionIndex + 1,
      totalQuestions: this.questions.length,
    }

    this.io.to(this.hostSocketId).emit('room:question', questionData)
    this.io.to(this.hostSocketId).emit('room:state', this.getState())

    // Tell clients a question started (no answer text)
    for (const player of this.players.values()) {
      this.io.to(player.id).emit('client:questionStart', {
        questionNumber: this.currentQuestionIndex + 1,
        totalQuestions: this.questions.length,
        timeLimit: TIME_PER_QUESTION,
      })
    }

    // Start countdown
    this.timer = setInterval(() => {
      this.timeRemaining--
      const answeredCount = this.getAnsweredCount()

      this.io.to(this.hostSocketId).emit('room:tick', {
        timeRemaining: this.timeRemaining,
        answeredCount,
      })

      for (const player of this.players.values()) {
        this.io.to(player.id).emit('client:tick', {
          timeRemaining: this.timeRemaining,
        })
      }

      if (this.timeRemaining <= 0) {
        this.endQuestion()
      }
    }, 1000)
  }

  submitAnswer(socketId: string, answer: AnswerKey) {
    if (this.phase !== 'question') return

    const player = this.players.get(socketId)
    if (!player || player.currentAnswer !== null) return

    player.currentAnswer = answer
    player.answerTime = Date.now()

    // Notify host of updated answer count
    this.io.to(this.hostSocketId).emit('room:tick', {
      timeRemaining: this.timeRemaining,
      answeredCount: this.getAnsweredCount(),
    })

    if (this.allAnswered()) {
      this.endQuestion()
    }
  }

  private getAnsweredCount(): number {
    let count = 0
    for (const p of this.players.values()) {
      if (p.currentAnswer !== null) count++
    }
    return count
  }

  private allAnswered(): boolean {
    if (this.players.size === 0) return false
    for (const p of this.players.values()) {
      if (p.currentAnswer === null) return false
    }
    return true
  }

  private endQuestion() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    this.phase = 'reveal'
    const q = this.questions[this.currentQuestionIndex]
    const timeLimit = TIME_PER_QUESTION * 1000

    // Calculate scores and distribution
    const distribution = { a: 0, b: 0, c: 0, d: 0 }

    // Store previous ranks for delta calculation
    const prevRanks = new Map<string, number>()
    const prevSorted = Array.from(this.players.values()).sort((a, b) => b.score - a.score)
    prevSorted.forEach((p, i) => prevRanks.set(p.id, i + 1))

    for (const player of this.players.values()) {
      if (player.currentAnswer) {
        distribution[player.currentAnswer]++
      }

      if (player.currentAnswer === q.correct && player.answerTime) {
        const elapsed = player.answerTime - this.questionStartTime
        const speedRatio = Math.max(0, 1 - elapsed / timeLimit)
        const points = BASE_POINTS + Math.round(SPEED_BONUS * speedRatio)
        player.score += points
      }
    }

    // Send reveal to host
    const revealData: RevealData = {
      correctAnswer: q.correct,
      explanation: q.explanation,
      distribution,
      questionText: q.question,
      answers: q.answers,
    }
    this.io.to(this.hostSocketId).emit('room:reveal', revealData)

    // Send individual feedback to each client
    const sorted = Array.from(this.players.values()).sort((a, b) => b.score - a.score)
    for (let i = 0; i < sorted.length; i++) {
      const player = sorted[i]
      let pointsEarned = 0
      if (player.currentAnswer === q.correct && player.answerTime) {
        const elapsed = player.answerTime - this.questionStartTime
        const speedRatio = Math.max(0, 1 - elapsed / timeLimit)
        pointsEarned = BASE_POINTS + Math.round(SPEED_BONUS * speedRatio)
      }

      const feedback: AnswerFeedback = {
        correct: player.currentAnswer === q.correct,
        pointsEarned,
        totalScore: player.score,
        rank: i + 1,
        totalPlayers: this.players.size,
        correctAnswer: q.correct,
      }
      this.io.to(player.id).emit('client:feedback', feedback)
    }
  }

  showLeaderboard() {
    this.phase = 'leaderboard'
    const leaderboard = this.getLeaderboard()
    this.io.to(this.hostSocketId).emit('room:leaderboard', { leaderboard })

    // Also notify clients of phase change
    for (const player of this.players.values()) {
      this.io.to(player.id).emit('client:phase', { phase: 'leaderboard' })
    }
  }

  nextFromLeaderboard() {
    const nextIndex = this.currentQuestionIndex + 1
    if (nextIndex >= this.questions.length) {
      this.finishGame()
    } else {
      this.currentQuestionIndex = nextIndex
      this.startQuestion()
    }
  }

  private finishGame() {
    this.phase = 'finished'
    const leaderboard = this.getLeaderboard()

    this.io.to(this.hostSocketId).emit('room:finished', { leaderboard })

    for (const player of this.players.values()) {
      const entry = leaderboard.find(e => e.nickname === player.nickname)
      this.io.to(player.id).emit('client:finished', {
        rank: entry?.rank ?? 0,
        score: player.score,
        totalPlayers: this.players.size,
      })
    }
  }

  advanceFromReveal() {
    this.showLeaderboard()
  }

  getState() {
    return {
      roomCode: this.roomCode,
      phase: this.phase,
      players: this.getPublicPlayers(),
      currentQuestionIndex: this.currentQuestionIndex,
      totalQuestions: this.questions.length,
      timeRemaining: this.timeRemaining,
      answeredCount: this.getAnsweredCount(),
    }
  }

  cleanup() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}
