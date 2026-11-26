import { useRef } from 'react'
import { assumptions as A } from '../engine'
import { btnSecondary, btnSmall } from './ui'

const fmt = (v: number) => String(Number(v.toFixed(4)))
const rec = (r: Record<string, number>) =>
  Object.entries(r)
    .map(([k, v]) => `${k.replace(/_/g, ' ')} ${fmt(v)}`)
    .join(' · ')

/** Rows built from src/engine/assumptions.ts, so the table always matches the engine. */
function rows(): [string, string][] {
  const out: [string, string][] = []
  for (const [k, v] of Object.entries(A)) {
    if (typeof v === 'number') out.push([k, fmt(v)])
  }
  out.push(['GAMMA (risk aversion by band)', rec(A.GAMMA)])
  out.push(['SPREAD (income-risk discount spread)', rec(A.SPREAD)])
  out.push(['BETA_BASE (how stock-like income is, by sector)', rec(A.BETA_BASE)])
  out.push(['VOL (volatility)', rec(A.VOL)])
  out.push(['CORR (equity, bonds, gold, btc)', A.CORR.map((r) => `[${r.join(', ')}]`).join(' ')])
  out.push(['STRESS SHOCK (2008-style crash)', rec(A.STRESS_SHOCK)])
  return out
}

/** "Assumptions" button + dialog with every value from assumptions.ts. */
export default function AssumptionsDialog() {
  const ref = useRef<HTMLDialogElement>(null)
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className={btnSecondary}
      >
        Assumptions
      </button>
      <dialog
        ref={ref}
        aria-labelledby="assumptions-title"
        onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="m-auto max-h-[85vh] w-[min(42rem,calc(100vw-2rem))] rounded-card border border-line bg-surface p-0 text-ink backdrop:bg-black/60"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-surface px-5 py-3">
          <h2 id="assumptions-title" className="text-h2">
            Assumptions
          </h2>
          <button type="button" onClick={() => ref.current?.close()} className={btnSmall} aria-label="Close assumptions">
            Close
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="mb-3 text-help text-ink-2">Every number the app uses. All are assumptions and can be changed in src/engine/assumptions.ts. Rates are real (after inflation) unless marked nominal.</p>
          <table className="w-full text-sm">
            <tbody>
              {rows().map(([k, v]) => (
                <tr key={k} className="border-b border-line align-top last:border-0">
                  <th scope="row" className="py-1.5 pr-4 text-left font-normal text-ink-2">
                    {k}
                  </th>
                  <td className="py-1.5 font-mono text-xs text-ink">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </dialog>
    </>
  )
}
