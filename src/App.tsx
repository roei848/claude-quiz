import { Routes, Route } from 'react-router-dom'
import ModeSelect from './components/ModeSelect'
import SoloApp from './components/SoloApp'
import HostApp from './components/host/HostApp'
import ClientApp from './components/client/ClientApp'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ModeSelect />} />
      <Route path="/host" element={<HostApp />} />
      <Route path="/play" element={<ClientApp />} />
      <Route path="/solo" element={<SoloApp />} />
    </Routes>
  )
}
