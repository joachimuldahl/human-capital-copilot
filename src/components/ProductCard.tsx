import { formatPct, type Product } from '../engine'
import Badge, { IllustrativeBadge } from './Badge'

/** Example product (D-3): never a recommendation, no buy buttons. */
export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4">
      <p className="font-medium text-slate-900">{product.name}</p>
      <p className="text-sm text-slate-600">
        {product.ticker ?? 'Ticker to verify'} · {product.ter === null ? 'TER: see factsheet' : `TER ${formatPct(product.ter)}`}
      </p>
      <div className="flex flex-wrap gap-1.5">
        <Badge tone="neutral">Example, not advice</Badge>
        {product.illustrative && <IllustrativeBadge />}
      </div>
    </div>
  )
}
