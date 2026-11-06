import { useState, type ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ArrowLeftRight, BadgePercent, Building2, CalendarDays, Ellipsis, FileText, FolderInput, LayoutDashboard, Pill,
  Settings as SettingsIcon, ShieldCheck, Stethoscope, TrendingUp, type LucideIcon,
} from 'lucide-react';
import { go, type Route } from '../../lib/route';
import { updateSettings } from '../../lib/db';
import { countSamples } from '../../lib/sample';
import type { Unit } from '../../lib/format';
import { Badge, Segmented } from '../ui/basics';
import { Drawer } from '../ui/Drawer';
import { useUnit } from '../SettingsContext';

export const NAV: { route: Route; label: string; icon: LucideIcon; mobile: boolean }[] = [
  { route: 'dashboard', label: 'داشبورد', icon: LayoutDashboard, mobile: true },
  { route: 'cashflow', label: 'نقدینگی', icon: ArrowLeftRight, mobile: true },
  { route: 'offers', label: 'ارزیاب آفر', icon: BadgePercent, mobile: true },
  { route: 'invoices', label: 'فاکتورها', icon: FileText, mobile: true },
  { route: 'profit', label: 'سود اقلام', icon: TrendingUp, mobile: false },
  { route: 'cheques', label: 'تقویم چک‌ها', icon: CalendarDays, mobile: false },
  { route: 'drugs', label: 'بانک دارو', icon: Pill, mobile: false },
  { route: 'doctors', label: 'پزشکان', icon: Stethoscope, mobile: false },
  { route: 'insurers', label: 'بیمه‌ها', icon: ShieldCheck, mobile: false },
  { route: 'import', label: 'مرکز ورود داده', icon: FolderInput, mobile: false },
  { route: 'settings', label: 'تنظیمات', icon: SettingsIcon, mobile: false },
];

function UnitToggle() {
  const unit = useUnit();
  return (
    <Segmented<Unit>
      label="واحد نمایش پول"
      value={unit}
      onChange={(displayUnit) => updateSettings({ displayUnit })}
      options={[
        { value: 'toman', label: 'تومان' },
        { value: 'rial', label: 'ریال' },
      ]}
    />
  );
}

export function Shell({ route, children }: { route: Route; children: ReactNode }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const samples = useLiveQuery(countSamples) ?? 0;
  const inMore = !NAV.find((n) => n.route === route)?.mobile;

  return (
    <div className="min-h-dvh md:flex">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-e border-line bg-card p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2 pt-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-on-primary">
            <Building2 size={18} aria-hidden />
          </span>
          <span className="font-bold">مالی داروخانه</span>
        </div>
        <nav aria-label="منوی اصلی" className="flex flex-col gap-1">
          {NAV.map(({ route: target, label, icon: Icon }) => {
            const active = target === route;
            return (
              <a
                key={target}
                href={`#/${target}`}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-11 items-center gap-2 rounded-xl px-4 transition-colors duration-150 ${
                  active ? 'bg-primary/10 font-medium text-primary' : 'text-muted hover:text-ink'
                }`}
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden />
                {label}
              </a>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1200px] px-4 pt-4 pb-28 md:px-8 md:pt-6 md:pb-8">
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="font-bold md:hidden">مالی داروخانه</span>
            <span className="hidden md:block" />
            <div className="flex items-center gap-2">
              {samples > 0 && (
                <a href="#/settings" aria-label="داده‌های نمونه فعال است؛ رفتن به تنظیمات">
                  <Badge tone="warn">دادهٔ نمونه</Badge>
                </a>
              )}
              <UnitToggle />
            </div>
          </div>
          <main>{children}</main>
        </div>
      </div>

      <nav
        aria-label="منوی اصلی"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {NAV.filter((n) => n.mobile).map(({ route: target, label, icon: Icon }) => (
          <a
            key={target}
            href={`#/${target}`}
            aria-current={target === route ? 'page' : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 text-note ${
              target === route ? 'font-medium text-primary' : 'text-muted'
            }`}
          >
            <Icon size={20} strokeWidth={1.75} aria-hidden />
            {label}
          </a>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={`flex min-h-14 flex-col items-center justify-center gap-1 text-note ${
            inMore ? 'font-medium text-primary' : 'text-muted'
          }`}
        >
          <Ellipsis size={20} strokeWidth={1.75} aria-hidden />
          بیشتر
        </button>
      </nav>

      <Drawer open={moreOpen} onClose={() => setMoreOpen(false)} title="بیشتر">
        <div className="flex flex-col gap-1">
          {NAV.filter((n) => !n.mobile).map(({ route: target, label, icon: Icon }) => (
            <button
              key={target}
              type="button"
              onClick={() => {
                setMoreOpen(false);
                go(target);
              }}
              className={`flex min-h-12 items-center gap-2 rounded-xl px-2 ${target === route ? 'font-medium text-primary' : ''}`}
            >
              <Icon size={20} strokeWidth={1.75} aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
