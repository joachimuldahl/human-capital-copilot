import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Nav from './components/Nav'
import Landing from './pages/Landing'

// Pages with charts load on demand, so the landing page doesn't wait for the chart library.
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Results = lazy(() => import('./pages/Results'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const Plan = lazy(() => import('./pages/Plan'))
const Method = lazy(() => import('./pages/Method'))

export default function App() {
  // Onboarding has its own top bar (logo, progress, "Save and finish later") instead of the main nav.
  const { pathname } = useLocation()
  const onboarding = pathname === '/onboarding'
  return (
    <div className="flex min-h-screen flex-col">
      {!onboarding && <Nav />}
      <main className="w-full flex-1">
        <Suspense fallback={<p className="mx-auto max-w-[1240px] px-4 py-12 text-ink-2 sm:px-8">Loading…</p>}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/results" element={<Results />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/method" element={<Method />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
