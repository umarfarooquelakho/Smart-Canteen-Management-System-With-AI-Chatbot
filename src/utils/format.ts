export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK')}`;
}

export function formatTime(isoString?: string): string {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function timeAgo(isoString: string): string {
  const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function minutesUntil(isoString: string): number {
  return Math.round((new Date(isoString).getTime() - Date.now()) / 60000);
}

export function addMinutes(isoString: string, mins: number): string {
  return new Date(new Date(isoString).getTime() + mins * 60000).toISOString();
}
