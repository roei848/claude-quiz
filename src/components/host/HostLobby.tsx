import { QRCodeSVG } from 'qrcode.react'
import type { PlayerPublic } from '../../../shared/types'

interface Props {
  roomCode: string
  players: PlayerPublic[]
  onStart: () => void
}

export default function HostLobby({ roomCode, players, onStart }: Props) {
  const joinUrl = `${window.location.origin}${window.location.pathname}#/play?room=${roomCode}`

  return (
    <div className="host-lobby">
      <p className="start-logo">Claude Code Bootcamp</p>
      <h2 className="host-lobby-title">Join the Quiz</h2>

      <div className="host-lobby-join">
        <div className="host-lobby-qr">
          <QRCodeSVG
            value={joinUrl}
            size={180}
            bgColor="transparent"
            fgColor="#00d4ff"
            level="M"
          />
        </div>

        <div className="host-lobby-code-section">
          <p className="host-lobby-code-label">Room Code</p>
          <div className="host-lobby-code">{roomCode}</div>
          <p className="host-lobby-url">{joinUrl}</p>
        </div>
      </div>

      <div className="host-lobby-players">
        <p className="host-lobby-players-label">
          Players ({players.length})
        </p>
        <div className="host-lobby-players-list">
          {players.map((p) => (
            <span key={p.id} className="host-lobby-player-tag">
              {p.nickname}
            </span>
          ))}
          {players.length === 0 && (
            <p className="host-lobby-waiting">Waiting for players to join...</p>
          )}
        </div>
      </div>

      <button
        className="btn-start"
        onClick={onStart}
        disabled={players.length === 0}
      >
        Start Quiz
        <span className="arrow">→</span>
      </button>
    </div>
  )
}
