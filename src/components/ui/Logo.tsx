/**
 * FataFat Food — Brand Logo Component
 *
 * Renders the logo image + wordmark in different sizes.
 * The logo image is served from /logo.png (copied to public/).
 * Falls back to the SVG icon if image fails.
 */
import { clsx } from 'clsx';
import heroLogo from '../../assets/hero.png';

interface Props {
  /** sm = navbar, md = default, lg = auth/hero */
  size?: 'sm' | 'md' | 'lg';
  /** show just icon, or icon + wordmark */
  variant?: 'icon' | 'full' | 'wordmark';
  /** dark background variant */
  dark?: boolean;
  className?: string;
}

const SIZES = {
  sm: { img: 'h-8 w-8', text1: 'text-base', text2: 'text-base', sub: 'text-[9px]' },
  md: { img: 'h-10 w-10', text1: 'text-lg', text2: 'text-lg', sub: 'text-[10px]' },
  lg: { img: 'h-16 w-16', text1: 'text-3xl', text2: 'text-3xl', sub: 'text-xs' },
};

export default function Logo({ size = 'md', variant = 'full', dark = false, className }: Props) {
  const s = SIZES[size];

  return (
    <div className={clsx('flex items-center gap-2 select-none', className)}>
      {/* Logo image */}
      <img
        src={heroLogo}
        alt="FataFat Food"
        className={clsx(s.img, 'object-contain rounded-xl shrink-0')}
        onError={(e) => {
          // fallback: show coloured circle with dish icon
          (e.target as HTMLImageElement).style.display = 'none';
          const next = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
          if (next) next.style.display = 'flex';
        }}
      />
      {/* Fallback icon (hidden by default) */}
      <div
        className={clsx(
          s.img,
          'rounded-xl bg-primary items-center justify-center shrink-0 hidden',
        )}
        aria-hidden
      >
        <span className="text-white text-xl">🍽️</span>
      </div>

      {/* Wordmark */}
      {(variant === 'full' || variant === 'wordmark') && (
        <div className="leading-tight">
          <div className="flex items-baseline gap-0">
            <span className={clsx('font-black tracking-tight', s.text1, dark ? 'text-white' : 'text-charcoal')}>
              Fatafat
            </span>
            <span className={clsx('font-black tracking-tight', s.text2, 'text-primary')}>
              &nbsp;Food
            </span>
          </div>
          {size === 'lg' && (
            <p className={clsx(s.sub, 'text-charcoal-400 font-medium tracking-wide mt-0.5')}>
              Bhook lagii? Fatafat karo!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
