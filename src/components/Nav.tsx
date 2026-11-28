import { NavLink, useLocation } from 'react-router-dom'
import { NAV_ROUTES } from '../routes'
import Logo from './Logo'
import PersonaSwitcher from './PersonaSwitcher'
import { focusRing } from './ui'

/** Pages that show the persona segmented control in the header (BUILD_SPEC 7, 15). */
const PERSONA_PAGES = ['/results', '/portfolio', '/plan']

/** Sticky header: lime logo tile + wordmark, nav with a 2px lime underline, persona control on Results/Portfolio/Plan. */
export default function Nav() {
  const { pathname } = useLocation()
  const showPersonas = PERSONA_PAGES.includes(pathname)
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 sm:gap-x-6 py-3.5 sm:px-8 sm:py-[18px]">
        <Logo compact />
        <nav aria-label="Main" className="min-w-0">
          <ul className="flex gap-3 text-[13px] font-medium sm:gap-7 sm:text-sm">
            {NAV_ROUTES.map((r) => (
              <li key={r.path} className="flex">
                <NavLink
                  to={r.path}
                  className={({ isActive }) =>
                    `rounded-sm border-b-2 pb-1 pt-1 ${focusRing} ${isActive ? 'border-lime text-ink' : 'border-transparent text-ink-2 hover:text-ink'}`
                  }
                >
                  {r.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {showPersonas && (
          <div className="w-full lg:w-auto">
            <PersonaSwitcher />
          </div>
        )}
      </div>
    </header>
  )
}
