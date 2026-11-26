import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatPct, type SleeveRow } from '../engine'
import { TOOLTIP } from './ui'

const SHORT: Record<SleeveRow['sleeve'], string> = { equity: 'Stocks', bonds: 'Bonds', gold: 'Gold', crypto: 'Crypto', cash: 'Cash', loan: 'Loan' }

/** Grouped bars: current vs target weight per sleeve (the table next to it is the accessible version). */
export default function SleeveChart({ rows }: { rows: SleeveRow[] }) {
  const data = rows.map((r) => ({ name: SHORT[r.sleeve], Current: r.currentShare, Target: r.targetShare }))
  return (
    <div className="h-64 w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="#1E293B" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#A3AEC2' }} interval={0} stroke="#1E293B" tickLine={false} />
          <YAxis tickFormatter={(v: number) => `${Math.round(v * 100)}%`} tick={{ fontSize: 12, fill: '#7D8AA3' }} axisLine={false} tickLine={false} />
          <ReferenceLine y={0} stroke="#334155" />
          <Tooltip contentStyle={TOOLTIP} cursor={{ fill: '#141B2D' }} formatter={(v) => formatPct(Number(v))} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#A3AEC2' }} />
          <Bar dataKey="Current" fill="#7DD3FC" radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="Target" fill="#C8F560" radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
