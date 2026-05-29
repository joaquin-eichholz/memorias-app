import { useState } from 'react'
import { isSetupComplete, isSessionActive } from './utils/auth'
import Onboarding from './components/Onboarding'
import Login from './components/Login'
import Layout from './components/Layout'

function getInitialScreen() {
  if (!isSetupComplete()) return 'onboarding'
  if (!isSessionActive()) return 'login'
  return 'app'
}

export default function App() {
  const [screen, setScreen] = useState(getInitialScreen)

  return (
    <>
      {screen === 'onboarding' && (
        <Onboarding onComplete={() => setScreen('app')} />
      )}
      {screen === 'login' && (
        <Login onSuccess={() => setScreen('app')} />
      )}
      {screen === 'app' && (
        <Layout onLogout={() => setScreen('login')} />
      )}
    </>
  )
}
