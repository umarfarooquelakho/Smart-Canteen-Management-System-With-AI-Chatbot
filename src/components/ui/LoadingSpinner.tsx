import { clsx } from 'clsx';

interface Props { size?: 'sm' | 'md' | 'lg'; className?: string; }

export default function LoadingSpinner({ size = 'md', className }: Props) {
  const s = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-[3px]' }[size];
  return (
    <span
      className={clsx('inline-block rounded-full border-primary/20 border-t-primary animate-spin', s, className)}
      role="status" aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-charcoal-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton h-40 w-full mb-4" />
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-4 w-1/2" />
    </div>
  );
}
