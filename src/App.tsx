import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CreatePaperPage from './pages/CreatePaperPage'
import ResultPage from './pages/ResultPage'
import UploadPage from './pages/UploadPage'
import Sidebar from './components/Sidebar'
import { Circle } from 'lucide-react'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { PublicOnlyRoute, RequireAuth } from './components/AuthRoute'
import { API_BASE_URL } from './config/api'

const getShellMeta = (pathname: string) => {
  if (pathname === '/upload') {
    return {
      eyebrow: 'Upload flow',
      title: 'Add one paper and move into focus.',
    }
  }

  if (pathname === '/workspace') {
    return {
      eyebrow: 'Paper workspace',
      title: 'Review, question, and recap one saved paper.',
    }
  }

  if (pathname === '/create-paper') {
    return {
      eyebrow: 'Paper builder',
      title: 'Turn your sections into a clean downloadable paper.',
    }
  }

  return {
    eyebrow: 'Workspace home',
    title: 'Minimal research desk for uploads, summaries, and study tools.',
  }
}

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
  const shellMeta = getShellMeta(location.pathname)

  return (
    <div className="min-h-screen bg-[var(--bg)] text-main transition-colors duration-300">
      {isAuthPage ? (
        <div>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      ) : (
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <main className="min-w-0 flex-1 bg-[var(--bg)] pt-16 md:pt-0">
            <div className="workspace-panel flex min-h-screen flex-col overflow-hidden">
              <header className="shell-topbar">
                <div className="shell-topbar-inner">
                  <div>
                    <p className="shell-kicker">{shellMeta.eyebrow}</p>
                    <p className="shell-title">{shellMeta.title}</p>
                  </div>
                  <button type="button" aria-label={statusLabel} title={statusLabel} className="status-pill">
                    <Circle size={12} className={`fill-current ${statusClasses}`} />
                    <span className="hidden md:inline">{statusLabel}</span>
                  </button>
                </div>
              </header>
              <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
                <div className="mx-auto w-full max-w-[1380px]">
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
