import { formatPct } from '../engine'
import { useCurrency } from '../store/hooks'

/** Horizontal percentage bars (region / sector look-through). */
export default function SplitBars({ items, label }: { items: { name: string; share: number; valueEUR: number }[]; label: string }) {
  const { money } = useCurrency()
  return (
    <ul aria-label={label} className="space-y-2.5">
      {items.map((s) => (
        <li key={s.name} className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-3 text-sm sm:grid-cols-[10rem_1fr_4rem]">
          <span className="truncate text-ink-2" title={s.name}>
            {s.name}
          </span>
          <span className="h-3 rounded-full bg-line" aria-hidden>
            <span className="block h-3 rounded-full bg-lime" style={{ width: `${Math.max(s.share * 100, 0.5)}%` }} />
          </span>
          <span className="text-right tabular-nums font-medium text-ink" title={money(s.valueEUR)}>
            {formatPct(s.share)}
          </span>
        </li>
      ))}
    </ul>
  )
}
