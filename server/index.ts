import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Room } from './Room.js'
import type { QuizData, ClientJoinPayload, ClientAnswerPayload, HostStartPayload, HostNextPayload } from '../shared/types'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' },
})

// Load questions
const questionsPath = resolve(__dirname, '..', 'questions.json')
const quizData: QuizData = JSON.parse(readFileSync(questionsPath, 'utf-8'))

// Room storage
const rooms = new Map<string, Room>()
const socketToRoom = new Map<string, string>()

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no O/0/I/1
  let code: string
  do {
    code = ''
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
  } while (rooms.has(code))
  return code
}

io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id}`)

  // Host creates a room
  socket.on('host:create', () => {
    const roomCode = generateRoomCode()
    const room = new Room(io, roomCode, socket.id, [...quizData.questions])
    rooms.set(roomCode, room)
    socketToRoom.set(socket.id, roomCode)
    socket.join(roomCode)

    socket.emit('room:created', { roomCode })
    console.log(`[room:created] ${roomCode} by ${socket.id}`)
  })

  // Host starts the quiz
  socket.on('host:start', (payload: HostStartPayload) => {
    const room = rooms.get(payload.roomCode)
    if (!room || room.hostSocketId !== socket.id) return
    room.startGame()
  })

  // Host advances phase
  socket.on('host:next', (payload: HostNextPayload) => {
    const room = rooms.get(payload.roomCode)
    if (!room || room.hostSocketId !== socket.id) return

    if (room.phase === 'reveal') {
      room.advanceFromReveal()
    } else if (room.phase === 'leaderboard') {
      room.nextFromLeaderboard()
    }
  })

  // Client joins a room
  socket.on('client:join', (payload: ClientJoinPayload) => {
    const room = rooms.get(payload.roomCode)
    if (!room) {
      socket.emit('error', { message: 'Room not found' })
      return
    }

    const result = room.addPlayer(socket.id, payload.nickname)
    if (!result.success) {
      socket.emit('error', { message: result.error })
      return
    }

    socketToRoom.set(socket.id, payload.roomCode)
    socket.join(payload.roomCode)
    socket.emit('client:joined', { roomCode: payload.roomCode, nickname: payload.nickname })
  })

  // Client submits answer
  socket.on('client:answer', (payload: ClientAnswerPayload) => {
    const room = rooms.get(payload.roomCode)
    if (!room) return
    room.submitAnswer(socket.id, payload.answer)
  })

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`[disconnect] ${socket.id}`)
    const roomCode = socketToRoom.get(socket.id)
    if (!roomCode) return

    const room = rooms.get(roomCode)
    if (!room) return

    if (room.hostSocketId === socket.id) {
      // Host disconnected — destroy room
      console.log(`[room:destroyed] ${roomCode} (host left)`)
      room.cleanup()
      // Notify all players
      for (const player of room.players.values()) {
        io.to(player.id).emit('error', { message: 'Host disconnected' })
      }
      rooms.delete(roomCode)
    } else {
      room.removePlayer(socket.id)
    }

    socketToRoom.delete(socket.id)
  })
})

const PORT = 3001
httpServer.listen(PORT, () => {
  console.log(`Quiz server running on http://localhost:${PORT}`)
})
