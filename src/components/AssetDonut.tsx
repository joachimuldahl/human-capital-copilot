import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import { TOOLTIP } from './ui'
import { ASSET_CLASS_LABEL, formatEUR, formatPct, type AssetClass, type ClassValue } from '../engine'

const CLASS_COLOR: Record<AssetClass, string> = {
  equity: '#C8F560',
  bonds: '#7DD3FC',
  gold: '#FBBF24',
  btc: '#F87171',
  cash: '#475569',
}

/** Donut of value by asset class, with a legend table that also serves as the accessible version. */
export default function AssetDonut({ values }: { values: ClassValue[] }) {
  return (
    <div className="grid items-center gap-6 sm:grid-cols-[220px_1fr]">
      {/* Fixed size (not ResponsiveContainer): the chart sits in a tab panel that can be hidden, and a hidden
          responsive chart measures 0×0 and logs a warning. */}
      <div className="mx-auto h-52 w-52" aria-hidden>
        <PieChart width={208} height={208} accessibilityLayer={false}>
            <Pie data={values} dataKey="valueEUR" nameKey="assetClass" innerRadius="58%" outerRadius="95%" paddingAngle={1} stroke="#0E1422" strokeWidth={2} isAnimationActive={false} rootTabIndex={-1}>
              {values.map((v) => (
                <Cell key={v.assetClass} fill={CLASS_COLOR[v.assetClass]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP} itemStyle={{ color: '#F1F5F9' }} formatter={(value, _name, item) => [formatEUR(Number(value)), ASSET_CLASS_LABEL[(item.payload as ClassValue).assetClass]]} />
        </PieChart>
      </div>
      <table className="w-full text-sm">
        <caption className="sr-only">Portfolio by asset class</caption>
        <tbody>
          {values.map((v) => (
            <tr key={v.assetClass} className="border-b border-line last:border-0">
              <th scope="row" className="py-2 text-left font-normal text-ink-2">
                <span className="mr-2 inline-block h-3 w-3 rounded-sm align-middle" style={{ background: CLASS_COLOR[v.assetClass] }} aria-hidden />
                {ASSET_CLASS_LABEL[v.assetClass]}
              </th>
              <td className="py-2 text-right tabular-nums text-ink-2">{formatEUR(v.valueEUR)}</td>
              <td className="w-16 py-2 text-right tabular-nums font-medium text-ink">{formatPct(v.share)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
