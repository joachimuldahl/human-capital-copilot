import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMoneyCompact, type ProjectionPoint } from '../engine'
import { useCurrency } from '../store/hooks'

const LIME = '#C8F560'
const SKY = '#7DD3FC'
const SLATE = '#64748B'
const MUTED = '#7D8AA3'

interface Row {
  year: number
  planBand: [number, number]
  planP50: number
  planP10: number
  planP90: number
  cmpBand: [number, number]
  cmpP50: number
  paidIn: number
}

interface FanChartProps {
  plan: ProjectionPoint[]
  compare: ProjectionPoint[]
  compareLabel: string
  showCompareRange: boolean
  /** Short accessible summary written from the data. */
  summary: string
}

function FanTooltip({ active, payload, compareLabel }: { active?: boolean; payload?: { payload: Row }[]; compareLabel: string }) {
  const { money } = useCurrency()
  if (!active || !payload?.length) return null
  const r = payload[0].payload
  return (
    <div className="rounded-control border border-line bg-surface-2 px-3 py-2 text-xs">
      <p className="font-semibold text-ink">Year {r.year}</p>
      <p className="text-lime">Plan, likely: {money(r.planP50)}</p>
      <p className="text-ink-2">
        Range: {money(r.planP10)} – {money(r.planP90)}
      </p>
      <p className="text-sky">
        {compareLabel}, likely: {money(r.cmpP50)}
      </p>
      <p className="text-ink-2">Paid in: {money(r.paidIn)}</p>
    </div>
  )
}

/** Fan chart: lime p10–p90 band and p50 line for the plan, dashed sky p50 (optional band) for the comparison, slate paid-in line. */
export default function FanChart({ plan, compare, compareLabel, showCompareRange, summary }: FanChartProps) {
  const { currency } = useCurrency()
  const data: Row[] = plan.map((p, i) => ({
    year: p.year,
    planBand: [p.p10, p.p90],
    planP50: p.p50,
    planP10: p.p10,
    planP90: p.p90,
    cmpBand: [compare[i].p10, compare[i].p90],
    cmpP50: compare[i].p50,
    paidIn: p.paidIn,
  }))
  const years = plan.length - 1
  const ticks = years <= 3 ? data.map((d) => d.year) : [0, Math.round(years / 3), Math.round((2 * years) / 3), years]
  return (
    <div className="h-64 w-full sm:h-72" role="img" aria-label={summary}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 4 }}>
          <CartesianGrid stroke="#1E293B" vertical={false} />
          <XAxis dataKey="year" type="number" domain={[0, years]} ticks={ticks} tickFormatter={(v: number) => (v === 0 ? 'Now' : `${v}y`)} tick={{ fontSize: 11, fill: MUTED }} stroke="#1E293B" tickLine={false} />
          <YAxis tickFormatter={(v: number) => formatMoneyCompact(v, currency)} tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} width={56} />
          <Tooltip content={<FanTooltip compareLabel={compareLabel} />} cursor={{ stroke: '#334155' }} />
          <Area dataKey="planBand" stroke="none" fill={LIME} fillOpacity={0.16} isAnimationActive={false} activeDot={false} />
          {showCompareRange && <Area dataKey="cmpBand" stroke="none" fill={SKY} fillOpacity={0.1} isAnimationActive={false} activeDot={false} />}
          <Line dataKey="paidIn" stroke={SLATE} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Line dataKey="cmpP50" stroke={SKY} strokeWidth={2} strokeDasharray="6 5" dot={false} isAnimationActive={false} />
          <Line dataKey="planP50" stroke={LIME} strokeWidth={3} dot={false} activeDot={{ r: 5, fill: LIME, stroke: '#070B14' }} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Legend under the fan chart (colour key, no maths). */
export function FanLegend({ compareLabel }: { compareLabel: string }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ink-2" aria-label="Chart legend">
      <li className="flex items-center gap-2">
        <span aria-hidden className="h-2.5 w-5 rounded-sm bg-lime/20" />
        <span aria-hidden className="-ml-6 h-0.5 w-5 bg-lime" />
        Plan: likely value and range
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden className="w-5 border-t-2 border-dashed border-sky" />
        {compareLabel}: likely value
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden className="h-0.5 w-5 bg-[#64748B]" />
        Money you put in
      </li>
    </ul>
  )
}
