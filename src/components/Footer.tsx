import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-2 px-4 py-5 text-help text-slate-600 sm:flex-row sm:px-6">
        <p>Educational demo. Not investment advice. Data is illustrative.</p>
        <Link to="/method" className="font-medium text-accent-700 hover:text-accent-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700">
          Method and research
        </Link>
      </div>
    </footer>
  )
}
