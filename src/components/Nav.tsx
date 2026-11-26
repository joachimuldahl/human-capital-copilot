import { Link, NavLink } from 'react-router-dom'
import { NAV_ROUTES } from '../routes'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700'

/** 64px header: wordmark with a teal dot, nav links with a 2px teal underline on the active page. */
export default function Nav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6">
        <Link to="/" className={`flex shrink-0 items-center gap-2 rounded py-2 text-base font-semibold text-slate-900 ${focusRing}`}>
          <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-700" />
          {/* Short wordmark on phones so the header stays one 64px row (BUILD_SPEC 15). */}
          <span className="sm:hidden" aria-label="Human Capital Copilot">HC Copilot</span>
          <span className="hidden sm:inline">Human Capital Copilot</span>
        </Link>
        <ul className="-mb-px flex gap-3 self-stretch text-[13px] font-medium sm:gap-6 sm:text-sm">
          {NAV_ROUTES.map((r) => (
            <li key={r.path} className="flex">
              <NavLink
                to={r.path}
                className={({ isActive }) =>
                  `flex items-center border-b-2 ${focusRing} ${
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
