import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatEUR, formatRatio, type GlidePoint } from '../engine'

interface GlideChartProps {
  points: GlidePoint[]
  currentAge: number
}

function GlideTooltip({ active, payload }: { active?: boolean; payload?: { payload: GlidePoint }[] }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow">
      <p className="font-semibold text-slate-900">
        Age {p.age}: {formatRatio(p.final)}
      </p>
      <p className="text-slate-600">Invested (F): {formatEUR(p.F)}</p>
      <p className="text-slate-600">Future savings (H): {formatEUR(p.H)}</p>
    </div>
  )
}

/** Risk Capacity by age (expected path), with the 1.0× "no borrowing" line and today's age marked. */
export default function GlideChart({ points, currentAge }: GlideChartProps) {
  const first = points[0]
  const last = points[points.length - 1]
  return (
    <figure>
      <div className="h-64 w-full" role="img" aria-label={`Line chart: Risk Capacity falls from ${formatRatio(first.final)} at age ${first.age} to ${formatRatio(last.final)} at age ${last.age}.`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 16, right: 16, bottom: 4, left: -8 }}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="age" type="number" domain={['dataMin', 'dataMax']} tick={{ fontSize: 12, fill: '#475569' }} tickCount={8} />
            <YAxis domain={[0, 1.6]} ticks={[0, 0.5, 1, 1.5]} tickFormatter={(v: number) => `${v.toFixed(1)}×`} tick={{ fontSize: 12, fill: '#475569' }} />
            <ReferenceLine y={1} stroke="#64748b" strokeDasharray="5 4" label={{ value: 'no borrowing', position: 'insideBottomRight', fontSize: 11, fill: '#475569' }} />
            <ReferenceLine x={currentAge} stroke="#0f766e" label={{ value: 'Today', position: 'insideTopLeft', fontSize: 11, fill: '#0f766e' }} />
            <Tooltip content={<GlideTooltip />} />
            <Line type="monotone" dataKey="final" stroke="#0f766e" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-2 text-xs text-slate-500">Expected path if markets deliver average returns.</figcaption>
    </figure>
  )
}
