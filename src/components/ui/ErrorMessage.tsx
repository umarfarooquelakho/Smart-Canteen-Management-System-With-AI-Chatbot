import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props { message?: string; onRetry?: () => void; }

export default function ErrorMessage({ message = 'Something went wrong.', onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertCircle className="h-12 w-12 text-primary mb-3" />
      <h3 className="text-lg font-semibold text-charcoal mb-1">Error</h3>
      <p className="text-sm text-charcoal-400 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline btn-sm flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Try Again
        </button>
      )}
    </div>
  );
}
