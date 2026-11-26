import { formatEUR, formatPct } from '../engine'

/** Horizontal percentage bars (region / sector look-through). */
export default function SplitBars({ items, label }: { items: { name: string; share: number; valueEUR: number }[]; label: string }) {
  return (
    <ul aria-label={label} className="space-y-2.5">
      {items.map((s) => (
        <li key={s.name} className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-3 text-sm sm:grid-cols-[10rem_1fr_4rem]">
          <span className="truncate text-slate-700" title={s.name}>
            {s.name}
          </span>
          <span className="h-3 rounded-full bg-slate-100" aria-hidden>
            <span className="block h-3 rounded-full bg-accent-600" style={{ width: `${Math.max(s.share * 100, 0.5)}%` }} />
          </span>
          <span className="text-right tabular-nums font-medium text-slate-900" title={formatEUR(s.valueEUR)}>
            {formatPct(s.share)}
          </span>
        </li>
      ))}
    </ul>
  )
}
