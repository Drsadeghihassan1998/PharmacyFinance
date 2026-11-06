import { BadgePercent, type LucideIcon } from 'lucide-react';
import { go, type Route } from '../lib/route';
import { Button, EmptyState, PageHeader } from './ui/basics';

const PAGES: Partial<Record<Route, { title: string; note: string; icon: LucideIcon; stage: string }>> = {
  offers: {
    title: 'ارزیاب آفر', note: 'آیا خرید با این آفر به صرفه است؟', icon: BadgePercent,
    stage: 'این صفحه در مرحلهٔ ۶ ساخته می‌شود.',
  },
};

export function Placeholder({ route }: { route: Route }) {
  const page = PAGES[route]!;
  return (
    <>
      <PageHeader title={page.title} note={page.note} />
      <EmptyState
        icon={page.icon}
        text={page.stage}
        action={
          <Button variant="primary" onClick={() => go('import')}>
            رفتن به مرکز ورود داده
          </Button>
        }
      />
    </>
  );
}
