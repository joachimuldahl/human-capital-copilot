import { Link, NavLink } from 'react-router-dom'
import { NAV_ROUTES } from '../routes'

export default function Nav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3"
      >
        <Link
          to="/"
          className="rounded text-lg font-semibold text-accent-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
        >
          Human Capital Copilot
        </Link>
        <ul className="flex flex-wrap gap-1 text-sm">
          {NAV_ROUTES.map((r) => (
            <li key={r.path}>
              <NavLink
                to={r.path}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 ${
                    isActive ? 'bg-accent-50 text-accent-800' : 'text-slate-700 hover:bg-slate-100'
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
