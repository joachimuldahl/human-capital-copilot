import { Link } from 'react-router-dom'
import { textLink } from './ui'

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-3 px-4 py-6 text-[13px] text-muted sm:flex-row sm:px-8">
        <p>Educational demo. Not investment advice. Data is illustrative.</p>
        <Link to="/method" className={textLink}>
          Method and research
        </Link>
      </div>
    </footer>
  )
}
