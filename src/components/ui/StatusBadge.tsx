import { clsx } from 'clsx';
import type { OrderStatus, ItemStatus } from '../../types';

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string; dot: string }> = {
  placed:         { label: 'Placed',         cls: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500' },
  accepted:       { label: 'Accepted',       cls: 'bg-violet-100 text-violet-700',   dot: 'bg-violet-500' },
  preparing:      { label: 'Preparing',      cls: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500' },
  ready:          { label: 'Ready',          cls: 'bg-seagreen-100 text-seagreen-600', dot: 'bg-seagreen-500' },
  collected:      { label: 'Collected',      cls: 'bg-seagreen-200 text-seagreen-700', dot: 'bg-seagreen-600' },
  completed:      { label: 'Completed',      cls: 'bg-seagreen-100 text-seagreen-600', dot: 'bg-seagreen-400' },
  cancelled:      { label: 'Cancelled',      cls: 'bg-charcoal-100 text-charcoal-500', dot: 'bg-charcoal-400' },
  rejected:       { label: 'Rejected',       cls: 'bg-red-100 text-red-600',         dot: 'bg-red-500' },
  delayed:        { label: 'Delayed ⚠',      cls: 'bg-primary/10 text-primary',      dot: 'bg-primary' },
  not_collected:  { label: 'Not Collected',  cls: 'bg-charcoal-100 text-charcoal-500', dot: 'bg-charcoal-300' },
};

const ITEM_STATUS_CONFIG: Record<ItemStatus, { label: string; cls: string }> = {
  available:              { label: 'Available',            cls: 'bg-seagreen-100 text-seagreen-600' },
  limited:                { label: 'Limited',              cls: 'bg-amber-100 text-amber-700' },
  sold_out:               { label: 'Sold Out',             cls: 'bg-charcoal-100 text-charcoal-500' },
  temporarily_unavailable:{ label: 'Unavailable',          cls: 'bg-charcoal-100 text-charcoal-400' },
};

interface OrderProps { status: OrderStatus; showDot?: boolean; className?: string; }
interface ItemProps  { status: ItemStatus;  className?: string; }

export function OrderStatusBadge({ status, showDot = false, className }: OrderProps) {
  const cfg = ORDER_STATUS_CONFIG[status];
  return (
    <span className={clsx('badge', cfg.cls, className)}>
      {showDot && <span className={clsx('h-1.5 w-1.5 rounded-full', cfg.dot)} />}
      {cfg.label}
    </span>
  );
}

export function ItemStatusBadge({ status, className }: ItemProps) {
  const cfg = ITEM_STATUS_CONFIG[status];
  return <span className={clsx('badge', cfg.cls, className)}>{cfg.label}</span>;
}

export function PriorityBadge({ score, className }: { score: number; className?: string }) {
  const label = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
  const cls = score >= 70 ? 'badge-high' : score >= 40 ? 'badge-medium' : 'badge-low';
  return <span className={clsx('badge', cls, className)}>{label}</span>;
}
