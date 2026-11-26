import { useRef } from 'react'
import { assumptions as A } from '../engine'

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
        className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700"
      >
        Assumptions
      </button>
      <dialog
        ref={ref}
        aria-labelledby="assumptions-title"
        onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="m-auto max-h-[85vh] w-[min(42rem,calc(100vw-2rem))] rounded-xl p-0 shadow-xl backdrop:bg-slate-900/40"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
          <h2 id="assumptions-title" className="font-semibold">
            Assumptions
          </h2>
          <button type="button" onClick={() => ref.current?.close()} className="rounded-lg px-2 py-1 text-sm font-medium text-accent-700 focus-visible:outline-2 focus-visible:outline-accent-700" aria-label="Close assumptions">
            Close
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="mb-3 text-sm text-slate-600">Every number the app uses. All are assumptions and can be changed in src/engine/assumptions.ts. Rates are real (after inflation) unless marked nominal.</p>
          <table className="w-full text-sm">
            <tbody>
              {rows().map(([k, v]) => (
                <tr key={k} className="border-b border-slate-100 align-top last:border-0">
                  <th scope="row" className="py-1.5 pr-4 text-left font-normal text-slate-600">
                    {k}
                  </th>
                  <td className="py-1.5 font-mono text-xs text-slate-900">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </dialog>
    </>
  )
}
