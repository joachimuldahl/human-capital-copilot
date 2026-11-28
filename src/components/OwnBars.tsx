import { formatPct, type OwnSegment, type OwnSegmentKey } from '../engine'

const SEG: Record<OwnSegmentKey, { label: string; cls: string }> = {
  equity: { label: 'Stocks', cls: 'bg-lime' },
  bonds: { label: 'Bonds', cls: 'bg-sky' },
  gold: { label: 'Gold', cls: 'bg-ink-2' },
  crypto: { label: 'Crypto', cls: 'bg-muted' },
  cash: { label: 'Cash', cls: 'bg-line-strong' },
  borrowed: { label: 'Borrowed', cls: 'bg-hatch-lime' },
}

function Bar({ label, segments, scale }: { label: string; segments: OwnSegment[]; scale: number }) {
  const text = segments.map((s) => `${SEG[s.key].label} ${formatPct(s.share)}`).join(', ')
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-right text-xs text-ink-2">{text}</span>
      </div>
      <div className="relative h-6 w-full rounded-md bg-surface-2" role="img" aria-label={`${label}: ${text}`}>
        <div className="flex h-full overflow-hidden rounded-md" style={{ width: `${(segments.reduce((a, s) => a + s.share, 0) / scale) * 100}%` }}>
          {segments.map((s) => (
            <div key={s.key} className={`${SEG[s.key].cls} h-full border-r border-bg last:border-r-0`} style={{ flexGrow: s.share, flexBasis: 0 }} />
          ))}
        </div>
        {scale > 1 && <div aria-hidden className="absolute inset-y-[-4px] w-px bg-ink" style={{ left: `${(1 / scale) * 100}%` }} />}
      </div>
    </div>
  )
}

/** "What you'd own": Today vs Plan as stacked bars; a loan shows as a hatched "borrowed" segment beyond 100%. */
export default function OwnBars({ today, plan }: { today: OwnSegment[]; plan: OwnSegment[] }) {
  const sum = (s: OwnSegment[]) => s.reduce((a, x) => a + x.share, 0)
  const scale = Math.max(1, sum(today), sum(plan))
  const keys = Array.from(new Set([...today, ...plan].map((s) => s.key)))
  return (
    <div className="space-y-4">
      {today.length > 0 && <Bar label="Today" segments={today} scale={scale} />}
      <Bar label="Plan" segments={plan} scale={scale} />
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-2" aria-label="Legend">
        {keys.map((k) => (
          <li key={k} className="flex items-center gap-1.5">
            <span aria-hidden className={`h-2.5 w-2.5 rounded-sm ${SEG[k].cls}`} />
            {SEG[k].label}
          </li>
        ))}
        {scale > 1 && (
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="h-3 w-px bg-ink" />
            100% of your own money
          </li>
        )}
      </ul>
    </div>
  )
}
