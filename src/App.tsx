import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Nav from './components/Nav'
import Landing from './pages/Landing'

// Pages with charts load on demand, so the landing page doesn't wait for the chart library.
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Results = lazy(() => import('./pages/Results'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const Plan = lazy(() => import('./pages/Plan'))

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Suspense fallback={<p className="text-slate-500">Loading…</p>}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/results" element={<Results />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
