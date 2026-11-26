import { Link, NavLink } from 'react-router-dom'
import { NAV_ROUTES } from '../routes'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700'

/** 64px header: wordmark with a teal dot, nav links with a 2px teal underline on the active page. */
export default function Nav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav aria-label="Main" className="mx-auto flex min-h-16 max-w-[1120px] flex-wrap items-center justify-between gap-x-6 px-4 sm:px-6">
        <Link to="/" className={`flex items-center gap-2 rounded py-2 text-base font-semibold text-slate-900 ${focusRing}`}>
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-accent-700" />
          Human Capital Copilot
        </Link>
        <ul className="-mb-px flex gap-4 self-stretch text-sm font-medium sm:gap-6">
          {NAV_ROUTES.map((r) => (
            <li key={r.path} className="flex">
              <NavLink
                to={r.path}
                className={({ isActive }) =>
                  `flex items-center border-b-2 py-3 ${focusRing} ${
                    isActive ? 'border-accent-700 text-accent-700' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`
                }
              >
                {r.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
