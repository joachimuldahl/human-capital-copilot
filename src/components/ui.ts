/** Shared class strings for the v1.3 dark design (BUILD_SPEC section 15). */

/** 2px lime focus ring with a 2px offset. */
export const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime'

const btnBase = `inline-flex items-center justify-center gap-2 rounded-control text-[15px] transition-colors ${focusRing}`

/** Lime button with dark text. */
export const btnPrimary = `${btnBase} bg-lime px-6 py-3.5 font-semibold text-on-lime hover:bg-lime-hover`
/** Transparent button with a 1px border. */
export const btnSecondary = `${btnBase} border border-line px-5 py-3 font-medium text-ink hover:border-line-strong hover:bg-surface`
/** Small secondary button (dialogs, toolbars). */
export const btnSmall = `inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-line px-3.5 py-2 text-[13px] font-medium text-ink-2 hover:text-ink hover:border-line-strong ${focusRing}`
/** Inline text link in lime. */
export const textLink = `rounded font-medium text-lime hover:text-lime-hover ${focusRing}`

/** Card surface: 20px radius, 1px border, no shadow. */
export const card = 'rounded-card border border-line bg-surface'

/** Page container: content max 1240px, 32px side padding (16px on phones). */
export const pageWrap = 'mx-auto w-full max-w-[1240px] px-4 sm:px-8'

/** Recharts tooltip box in the dark theme. */
export const TOOLTIP = { background: '#141B2D', border: '1px solid #1E293B', borderRadius: 12, fontSize: 12, color: '#F1F5F9' }
