import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatEUR, formatRatio, type GlidePoint } from '../engine'

interface GlideChartProps {
  points: GlidePoint[]
  currentAge: number
}

const LIME = '#C8F560'
const MUTED = '#7D8AA3'

function GlideTooltip({ active, payload }: { active?: boolean; payload?: { payload: GlidePoint }[] }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-control border border-line bg-surface-2 px-3 py-2 text-xs">
      <p className="font-semibold text-ink">
        Age {p.age}: {formatRatio(p.final)}
      </p>
      <p className="text-ink-2">Invested (F): {formatEUR(p.F)}</p>
      <p className="text-ink-2">Future savings (H): {formatEUR(p.H)}</p>
    </div>
  )
}

/** Risk Capacity by age (expected path): lime line, dashed 1.0× "no borrowing" line, today's dot and where it reaches 1.0×. */
export default function GlideChart({ points, currentAge }: GlideChartProps) {
  const first = points[0]
  const last = points[points.length - 1]
  const today = points.find((p) => p.age === currentAge) ?? first
  // First age at or below 1.0× after borrowing (picked from the engine's path, no maths here).
  const noBorrow = first.final > 1 ? points.find((p) => p.final <= 1) : undefined
  return (
    <figure>
      <div
        className="h-60 w-full"
        role="img"
        aria-label={`Line chart: Risk Capacity goes from ${formatRatio(first.final)} at age ${first.age} to ${formatRatio(last.final)} at age ${last.age}${
          noBorrow ? `, reaching 1.0× (no borrowing) at ${noBorrow.age}` : ''
        }.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 22, right: 18, bottom: 0, left: -14 }}>
            <CartesianGrid stroke="#1E293B" vertical={false} />
            <XAxis dataKey="age" type="number" domain={['dataMin', 'dataMax']} tick={{ fontSize: 11, fill: MUTED }} tickCount={8} stroke="#1E293B" tickLine={false} />
            <YAxis domain={[0, 1.6]} ticks={[0, 0.5, 1, 1.5]} tickFormatter={(v: number) => `${v.toFixed(1)}×`} tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
            <ReferenceLine y={1} stroke="#334155" strokeDasharray="4 4" label={{ value: '1.0× · no borrowing', position: 'insideTopLeft', fontSize: 11, fill: MUTED, dx: 8 }} />
            <Tooltip content={<GlideTooltip />} cursor={{ stroke: '#334155' }} />
            <Line type="monotone" dataKey="final" stroke={LIME} strokeWidth={3} dot={false} activeDot={{ r: 5, fill: LIME, stroke: '#070B14' }} isAnimationActive={false} />
            <ReferenceDot x={today.age} y={today.final} r={6} fill={LIME} stroke="none" label={{ value: `You, ${today.age}`, position: 'top', fontSize: 12, fill: '#F1F5F9', fontWeight: 600, offset: 10 }} />
            {noBorrow && (
              <ReferenceDot x={noBorrow.age} y={noBorrow.final} r={4} fill="#070B14" stroke={LIME} strokeWidth={2} label={{ value: `${noBorrow.age}: ${formatRatio(noBorrow.final)}`, position: 'top', fontSize: 11, fill: '#A3AEC2', offset: 10 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-2 text-[13px] text-muted">Expected path if markets deliver average returns.</figcaption>
    </figure>
  )
}
