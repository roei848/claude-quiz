interface Props {
  nickname: string
  roomCode: string
}

export default function ClientWaiting({ nickname, roomCode }: Props) {
  return (
    <div className="client-waiting">
      <p className="client-waiting-room">Room: {roomCode}</p>
      <div className="client-waiting-content">
        <p className="client-waiting-welcome">Welcome, {nickname}!</p>
        <p className="client-waiting-msg">Waiting for host to start<span className="blink-cursor">_</span></p>
      </div>
    </div>
  )
}
