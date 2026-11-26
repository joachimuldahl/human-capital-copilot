import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Nav from './components/Nav'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Plan from './pages/Plan'
import Portfolio from './pages/Portfolio'
import Results from './pages/Results'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/results" element={<Results />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
