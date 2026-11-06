import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'text' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary font-medium hover:opacity-90',
  secondary: 'border border-line bg-card text-ink hover:border-muted',
  text: 'text-primary hover:underline',
  danger: 'text-bad hover:underline',
};

export function Button({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-body transition-opacity duration-150 disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    />
  );
}

export function Card({
  children,
  className = '',
  flush = false,
}: {
  children: ReactNode;
  className?: string;
  /** کارت بدون فاصلهٔ داخلی، برای جدول‌ها */
  flush?: boolean;
}) {
  return (
    <section className={`rounded-xl border border-line bg-card shadow-card ${flush ? 'overflow-clip' : 'p-6'} ${className}`}>
      {children}
    </section>
  );
}

export function CardTitle({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-cardtitle font-medium">{children}</h2>
      {note && <p className="text-note text-muted">{note}</p>}
    </div>
  );
}

export function PageHeader({ title, note, action }: { title: string; note: string; action?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-title font-bold">{title}</h1>
        <p className="text-muted">{note}</p>
      </div>
      {action}
    </header>
  );
}

/** کارت عدد کلیدی */
export function KeyCard({
  label,
  children,
  note,
  aside,
}: {
  label: string;
  children: ReactNode;
  note?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <Card className="min-w-0">
      <div className="flex min-h-6 items-center justify-between gap-2">
        <span className="text-note text-muted">{label}</span>
        {aside}
      </div>
      <div className="mt-2 text-key font-bold">{children}</div>
      {note && <p className="mt-2 text-note text-muted">{note}</p>}
    </Card>
  );
}

export type Tone = 'good' | 'warn' | 'bad' | 'neutral';

const TONES: Record<Tone, string> = {
  good: 'var(--good)',
  warn: 'var(--warn)',
  bad: 'var(--bad)',
  neutral: 'var(--muted)',
};

/** برچسب کوچک گرد. رنگ متن با رنگ اصلی نوشته ترکیب شده تا خوانا بماند. */
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  const color = TONES[tone];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 text-note font-medium whitespace-nowrap"
      style={{
        color: `color-mix(in srgb, ${color} 72%, var(--text))`,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

export const SampleBadge = () => <Badge tone="warn">نمونه</Badge>;

export function EmptyState({
  icon: Icon,
  text,
  action,
}: {
  icon: LucideIcon;
  text: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-4 py-16 text-center">
      <span className="flex size-24 items-center justify-center rounded-full border border-line text-muted">
        <Icon size={40} strokeWidth={1.25} aria-hidden />
      </span>
      <p className="max-w-sm text-muted">{text}</p>
      {action}
    </Card>
  );
}

/** تأیید داخل خود صفحه قبل از کار برگشت‌ناپذیر */
export function ConfirmButton({
  label,
  question,
  confirmLabel,
  onConfirm,
}: {
  label: string;
  question: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <Button variant="danger" className="px-0" onClick={() => setAsking(true)}>
        {label}
      </Button>
    );
  }
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-note text-muted">{question}</span>
      <Button variant="danger" onClick={onConfirm}>
        {confirmLabel}
      </Button>
      <Button variant="text" onClick={() => setAsking(false)}>
        انصراف
      </Button>
    </span>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-xl border border-line bg-card p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`min-h-9 rounded-lg px-4 text-note transition-colors duration-150 ${
              active ? 'bg-primary font-medium text-on-primary' : 'text-muted'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className="skeleton h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="skeleton h-32" />
        <div className="skeleton h-32" />
        <div className="skeleton h-32" />
      </div>
      <div className="skeleton h-64" />
    </div>
  );
}
