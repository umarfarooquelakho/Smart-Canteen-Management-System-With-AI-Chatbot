import { clsx } from 'clsx';

interface Props {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: Props) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {icon && <div className="text-5xl mb-4 opacity-60">{icon}</div>}
      <h3 className="text-lg font-semibold text-charcoal mb-1">{title}</h3>
      {description && <p className="text-sm text-charcoal-400 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
