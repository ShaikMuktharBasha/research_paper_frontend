import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CreatePaperPage from './pages/CreatePaperPage'
import ResultPage from './pages/ResultPage'
import UploadPage from './pages/UploadPage'
import Sidebar from './components/Sidebar'
import Silk from './components/Silk'
import { Circle } from 'lucide-react'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { PublicOnlyRoute, RequireAuth } from './components/AuthRoute'
import { API_BASE_URL } from './config/api'

function AppLayout() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const location = useLocation()

  useEffect(() => {
    let isMounted = true

    const checkBackend = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`)
        if (!isMounted) {
          return
        }
        setBackendStatus(response.ok ? 'online' : 'offline')
      } catch (_error) {
        if (isMounted) {
          setBackendStatus('offline')
        }
      }
    }

    void checkBackend()
    const intervalId = window.setInterval(() => {
      void checkBackend()
    }, 30000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  const statusClasses =
    backendStatus === 'online'
      ? 'text-emerald-500'
      : backendStatus === 'offline'
        ? 'text-red-500'
        : 'text-amber-500'

  const statusLabel =
    backendStatus === 'online'
      ? 'Backend online'
      : backendStatus === 'offline'
      ? 'Backend offline'
        : 'Checking backend'

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  return (
    <div className="relative min-h-screen overflow-hidden text-main transition-colors duration-300">
      <div className="pointer-events-none fixed inset-0">
        <Silk
          className="silk-canvas h-full w-full"
          speed={5}
          scale={1}
          color="#7B7481"
          noiseIntensity={1.5}
          rotation={0}
        />
        <div className="silk-overlay absolute inset-0" />
      </div>

      {isAuthPage ? (
        <div className="relative z-10">
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      ) : (
        <div className="relative z-10 flex min-h-screen w-full bg-transparent">
          <Sidebar />
          <main className="min-w-0 flex-1 pt-16 md:pt-0">
            <div className="workspace-panel flex h-full min-h-screen flex-col overflow-hidden">
              <header className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4 md:px-8">
                <div className="text-base font-semibold text-[var(--text-strong)]">Research Paper Workspace</div>
                <button
                  type="button"
                  aria-label={statusLabel}
                  title={statusLabel}
                  className="inline-flex h-8 items-center gap-2 rounded-full px-3 text-soft transition-colors hover:bg-[var(--surface-subtle)] hover:text-main"
                >
                  <Circle size={12} className={`fill-current ${statusClasses}`} />
                  <span className="hidden text-xs font-medium md:inline">{statusLabel}</span>
                </button>
              </header>
              <div className="h-[calc(100vh-3.5rem)] overflow-y-auto px-4 py-6 md:px-8 md:py-8">
                <Routes>
                  <Route element={<RequireAuth />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/create-paper" element={<CreatePaperPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/workspace" element={<ResultPage />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  )
}

export default App
