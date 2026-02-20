import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LeaderboardEntry } from '../../../shared/types'

interface Props {
  leaderboard: LeaderboardEntry[]
}

export default function HostFinal({ leaderboard }: Props) {
  const navigate = useNavigate()
  const [revealed, setRevealed] = useState(0) // 0=none, 1=#3, 2=#2, 3=#1
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const third = leaderboard[2] ?? null
  const second = leaderboard[1] ?? null
  const first = leaderboard[0] ?? null
  const rest = leaderboard.slice(3)

  // Staggered reveal: #3 at 1s, #2 at 5s, #1 at 9s (4s gaps)
  useEffect(() => {
    const t1 = setTimeout(() => setRevealed(1), 1000)
    const t2 = setTimeout(() => setRevealed(2), 5000)
    const t3 = setTimeout(() => setRevealed(3), 9000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  // Confetti burst after #1 is revealed
  useEffect(() => {
    if (revealed < 3) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.5,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 4 + 2,
      color: ['#00d4ff', '#00ff87', '#ffffff', '#ffd700'][Math.floor(Math.random() * 4)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      alpha: 1,
    }))

    let frame: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.1
        p.rotation += p.rotationSpeed
        p.alpha -= 0.008
        if (p.alpha > 0) {
          alive = true
          ctx.save()
          ctx.globalAlpha = p.alpha
          ctx.fillStyle = p.color
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
          ctx.restore()
        }
      }
      if (alive) frame = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(frame)
  }, [revealed])

  return (
    <div className="host-final">
      <canvas ref={canvasRef} className="host-final-confetti" />

      <p className="host-final-label">// Quiz Complete</p>

      <div className="host-final-podium-stage">
        {/* #2 - Left */}
        <div className={`host-final-slot host-final-slot-2 ${revealed >= 2 ? 'revealed' : ''}`}>
          {second && (
            <>
              <p className="host-final-slot-name">{second.nickname}</p>
              <p className="host-final-slot-score">{second.score.toLocaleString()}</p>
            </>
          )}
          <div className="host-final-block host-final-block-2">
            <span className="host-final-block-rank">#2</span>
          </div>
        </div>

        {/* #1 - Center */}
        <div className={`host-final-slot host-final-slot-1 ${revealed >= 3 ? 'revealed' : ''}`}>
          {first && (
            <>
              <p className="host-final-slot-name host-final-slot-name-1">{first.nickname}</p>
              <p className="host-final-slot-score host-final-slot-score-1">{first.score.toLocaleString()}</p>
            </>
          )}
          <div className="host-final-block host-final-block-1">
            <span className="host-final-block-rank">#1</span>
          </div>
        </div>

        {/* #3 - Right */}
        <div className={`host-final-slot host-final-slot-3 ${revealed >= 1 ? 'revealed' : ''}`}>
          {third && (
            <>
              <p className="host-final-slot-name">{third.nickname}</p>
              <p className="host-final-slot-score">{third.score.toLocaleString()}</p>
            </>
          )}
          <div className="host-final-block host-final-block-3">
            <span className="host-final-block-rank">#3</span>
          </div>
        </div>
      </div>

      {rest.length > 0 && revealed >= 3 && (
        <div className="host-final-rest">
          {rest.map((entry) => (
            <div key={entry.nickname} className="host-leaderboard-entry">
              <span className="host-leaderboard-rank">#{entry.rank}</span>
              <span className="host-leaderboard-name">{entry.nickname}</span>
              <span className="host-leaderboard-score">{entry.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {revealed >= 3 && (
        <button className="btn-restart" onClick={() => navigate('/')}>
          Back to Menu
        </button>
      )}
    </div>
  )
}
