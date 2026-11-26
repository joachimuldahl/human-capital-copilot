import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatPct, type SleeveRow } from '../engine'

const SHORT: Record<SleeveRow['sleeve'], string> = { equity: 'Stocks', bonds: 'Bonds', gold: 'Gold', crypto: 'Crypto', cash: 'Cash', loan: 'Loan' }

/** Grouped bars: current vs target weight per sleeve (the table next to it is the accessible version). */
export default function SleeveChart({ rows }: { rows: SleeveRow[] }) {
  const data = rows.map((r) => ({ name: SHORT[r.sleeve], Current: r.currentShare, Target: r.targetShare }))
  return (
    <div className="h-64 w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} interval={0} />
          <YAxis tickFormatter={(v: number) => `${Math.round(v * 100)}%`} tick={{ fontSize: 12, fill: '#475569' }} />
          <ReferenceLine y={0} stroke="#94a3b8" />
          <Tooltip formatter={(v) => formatPct(Number(v))} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Current" fill="#94a3b8" radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="Target" fill="#0f766e" radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
