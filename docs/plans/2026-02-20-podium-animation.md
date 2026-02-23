# Podium Animation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the `HostFinal` results screen with an animated Olympic-style podium that reveals #3, #2, then #1 with 4-second delays, followed by a confetti burst.

**Architecture:** Rework `HostFinal.tsx` to use a timed reveal sequence driven by `useState` + `useEffect`. Replace vertical list layout with a horizontal podium layout (CSS flexbox: #2 left, #1 center tallest, #3 right). Add confetti via a small canvas-based particle system rendered in a `useEffect`. All styling goes in `index.css`.

**Tech Stack:** React (useState, useEffect, useRef), CSS animations/keyframes, HTML5 Canvas for confetti.

---

### Task 1: Rewrite `HostFinal.tsx` with staggered reveal logic

**Files:**
- Modify: `src/components/host/HostFinal.tsx`

**Step 1: Replace the component with reveal-state logic**

Replace the full file contents with:

```tsx
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
```

**Step 2: Verify the file saved correctly**

Open `src/components/host/HostFinal.tsx` and confirm the `revealed` state and three timeout logic is present.

---

### Task 2: Replace host-final CSS with podium styles

**Files:**
- Modify: `src/index.css` (lines ~964–1046, the `/* ── HOST FINAL ── */` block)

**Step 1: Replace the entire HOST FINAL CSS block**

Find the block starting at `/* ── HOST FINAL ── */` and ending before `/* ── CLIENT APP ── */` and replace it with:

```css
/* ── HOST FINAL ── */
.host-final {
  width: 100%;
  text-align: center;
  animation: fadeSlideUp 0.6s ease forwards;
  position: relative;
  padding: 24px;
}

.host-final-confetti {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
}

.host-final-label {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 48px;
}

/* Podium stage: #2 left, #1 center, #3 right */
.host-final-podium-stage {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  margin-bottom: 40px;
  min-height: 320px;
}

/* Each slot = name/score above + block below */
.host-final-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 160px;
}

/* Name + score above the block — hidden until revealed */
.host-final-slot-name,
.host-final-slot-score {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.5s ease, transform 0.5s ease;
  margin-bottom: 4px;
}

.host-final-slot.revealed .host-final-slot-name,
.host-final-slot.revealed .host-final-slot-score {
  opacity: 1;
  transform: translateY(0);
}

.host-final-slot-name {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
  transition-delay: 0.3s;
}

.host-final-slot-score {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  transition-delay: 0.4s;
}

.host-final-slot-name-1 {
  font-size: 20px;
  background: linear-gradient(135deg, var(--cyan) 0%, var(--green) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.6));
}

.host-final-slot-score-1 {
  font-size: 15px;
  color: var(--green);
}

/* The rising block */
.host-final-block {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 16px;
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-top: 2px solid var(--border);
  background: var(--bg-card);
}

.host-final-slot.revealed .host-final-block {
  transform: scaleY(1);
}

.host-final-block-rank {
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  font-size: 18px;
}

/* Block heights */
.host-final-block-1 {
  height: 180px;
  border-color: #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3), 0 0 60px rgba(255, 215, 0, 0.1);
}
.host-final-block-1 .host-final-block-rank { color: #ffd700; }

.host-final-block-2 {
  height: 130px;
  border-color: #b0b8c8;
  box-shadow: 0 0 20px rgba(176, 184, 200, 0.2);
}
.host-final-block-2 .host-final-block-rank { color: #b0b8c8; }

.host-final-block-3 {
  height: 90px;
  border-color: #cd7f32;
  box-shadow: 0 0 20px rgba(205, 127, 50, 0.2);
}
.host-final-block-3 .host-final-block-rank { color: #cd7f32; }

/* Rest of leaderboard */
.host-final-rest {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 32px;
  opacity: 0.7;
  animation: fadeSlideUp 0.5s ease forwards;
}
```

**Step 2: Verify no duplicate `.host-final` classes remain**

Check that the old `.host-final-winner`, `.host-final-podium-entry`, `.host-final-podium-1/2/3` classes are fully removed.

---

### Task 3: Manual smoke test

**Step 1: Start the dev server**

```bash
npm run dev
```

**Step 2: Host a game and finish it, OR temporarily hard-code leaderboard data**

In `HostApp.tsx` or wherever `HostFinal` is rendered, check it receives `leaderboard` with at least 3 entries.

**Step 3: Verify the sequence**
- At 1s: #3 block rises, name/score fade in
- At 5s: #2 block rises, name/score fade in
- At 9s: #1 block rises with gold glow, confetti fires
- "Back to Menu" button appears after #1 is revealed

**Step 4: Commit**

```bash
git add src/components/host/HostFinal.tsx src/index.css
git commit -m "feat: animated podium reveal on quiz completion"
```
