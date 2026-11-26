import { formatPct, type Product } from '../engine'
import Badge, { IllustrativeBadge } from './Badge'
import { card } from './ui'

/** Example product (D-3): never a recommendation, no buy buttons. */
export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className={`${card} flex flex-col gap-2.5 p-4`}>
      <p className="font-medium text-ink">{product.name}</p>
      <p className="text-[13px] text-ink-2">
        {product.ticker ?? 'Ticker to verify'} · {product.ter === null ? 'TER: see factsheet' : `TER ${formatPct(product.ter)}`}
      </p>
      <div className="flex flex-wrap gap-1.5">
        <Badge tone="neutral">Example, not advice</Badge>
        {product.illustrative && <IllustrativeBadge />}
      </div>
    </div>
  )
}
