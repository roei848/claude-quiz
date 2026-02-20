import { useState } from 'react'

interface Props {
  initialRoom: string
  onJoin: (roomCode: string, nickname: string) => void
  error: string
}

export default function ClientJoin({ initialRoom, onJoin, error }: Props) {
  const [roomCode, setRoomCode] = useState(initialRoom)
  const [nickname, setNickname] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = roomCode.trim().toUpperCase()
    const name = nickname.trim()
    if (code && name) {
      onJoin(code, name)
    }
  }

  return (
    <div className="client-join">
      <p className="start-logo">Claude Code Bootcamp</p>
      <h2 className="client-join-title">Join Quiz</h2>

      <form className="client-join-form" onSubmit={handleSubmit}>
        <div className="client-join-field">
          <label className="client-join-label">Room Code</label>
          <input
            className="client-join-input"
            type="text"
            value={roomCode}
            onChange={e => setRoomCode(e.target.value.toUpperCase())}
            placeholder="ABCDEF"
            maxLength={6}
            autoFocus={!initialRoom}
          />
        </div>

        <div className="client-join-field">
          <label className="client-join-label">Nickname</label>
          <input
            className="client-join-input"
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="Your name"
            maxLength={16}
            autoFocus={!!initialRoom}
          />
        </div>

        {error && <p className="client-join-error">{error}</p>}

        <button
          className="btn-start"
          type="submit"
          disabled={!roomCode.trim() || !nickname.trim()}
        >
          Join
          <span className="arrow">→</span>
        </button>
      </form>
    </div>
  )
}
