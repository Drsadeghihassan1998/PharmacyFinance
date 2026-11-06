import { useLiveQuery } from 'dexie-react-hooks';
import { Check } from 'lucide-react';
import { dueCheques } from '../lib/calc';
import { CAUSE_TEXT, firstWarning } from '../lib/cashflow';
import { db } from '../lib/db';
import { faDate, faNumber, fullMoney } from '../lib/format';
import { addDays, currentMonthKey, monthLabel, todayISO } from '../lib/jalali';
import { go, type Route } from '../lib/route';
import { useCashModel } from '../lib/useCashModel';
import { Badge, Button, Card, CardTitle, KeyCard, PageHeader, PageSkeleton, SampleBadge } from './ui/basics';
import { HowCalculated } from './ui/HowCalculated';
import { Money } from './ui/Money';
import { useSettings, useUnit } from './SettingsContext';

const HORIZON_DAYS = 30;

export function Dashboard() {
  const settings = useSettings();
  const unit = useUnit();
  const model = useCashModel(settings);
  const imported = useLiveQuery(() => db.importSlots.filter((s) => s.status === 'imported').count());

  if (!model || imported === undefined) return <PageSkeleton />;

  const { data, input, months } = model;
  const today = todayISO();
  const { items, total } = dueCheques(data.cheques, addDays(today, HORIZON_DAYS));
  const nameOf = (id: number) => data.distributors.find((d) => d.id === id)?.name ?? '—';

  const hasForecast = input.streams.length > 0 || input.fixed.length > 0;
  // اگر فعالیت هنوز شروع نشده، ماه اول پیش‌بینی نشان داده می‌شود.
  const month = months.find((m) => m.key === currentMonthKey()) ?? months[0];
  const warning = firstWarning(months, input);

  const steps: { label: string; done: boolean; route: Route; action: string }[] = [
    { label: 'موجودی نقد و حق فنی را در تنظیمات وارد کنید', done: settings.openingCash > 0, route: 'settings', action: 'رفتن به تنظیمات' },
    { label: 'فایل تعهد بیمه‌ها را وارد کنید', done: imported > 0, route: 'import', action: 'ورود فایل' },
    { label: 'پزشکان را وارد کنید', done: data.doctors.length > 0, route: 'doctors', action: 'رفتن به پزشکان' },
    { label: 'یک پشتیبان بگیرید', done: Boolean(settings.lastBackupAt), route: 'settings', action: 'پشتیبان‌گیری' },
  ];
  const nextStep = steps.find((s) => !s.done);

  return (
    <>
      <PageHeader title="داشبورد" note="سود، نقدینگی و چک‌های نزدیک در یک نگاه." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KeyCard
          label="این ماه چقدر سود کردم؟"
          note={hasForecast ? `پیش‌بینی ${monthLabel(month.key)}` : 'با ثبت پزشکان و هزینه‌ها حساب می‌شود.'}
          aside={
            hasForecast ? (
              <HowCalculated
                title={`سود خالص ${monthLabel(month.key)}`}
                formula="فروش + حق فنی − بهای تمام‌شده − کسورات بیمه − هزینه‌های ثابت"
                inputs={[
                  ['فروش', <Money rial={month.sales} exact />],
                  ['حق فنی', <Money rial={month.feeTotal} exact />],
                  ['بهای تمام‌شده', <Money rial={month.cogs} exact />],
                  ['کسورات بیمه', <Money rial={month.deductions} exact />],
                  ['هزینه‌های ثابت و پزشکان', <Money rial={month.fixed + month.doctorCosts} exact />],
                ]}
                result={['سود خالص', <Money rial={month.netProfit} exact />]}
              />
            ) : undefined
          }
        >
          {hasForecast ? <Money rial={month.netProfit} big /> : <span className="text-muted">—</span>}
        </KeyCard>

        <KeyCard label="موجودی نقد" note={`پایان ${monthLabel(month.key)}`}>
          <Money rial={month.end} big />
        </KeyCard>

        <KeyCard
          label="پولم کی کم می‌آید؟"
          note={
            warning
              ? `حدود ${fullMoney(Math.round(warning.gap), unit)}؛ ${CAUSE_TEXT[warning.cause]}`
              : hasForecast
                ? `تا ${faNumber(input.policy.horizon)} ماه آینده کمبودی نیست.`
                : 'با ثبت پزشکان و هزینه‌ها حساب می‌شود.'
          }
        >
          {warning ? (
            <span className="flex flex-wrap items-center gap-2 text-cardtitle">
              {monthLabel(warning.month.key)}
              <Badge tone={warning.level === 'short' ? 'bad' : 'warn'}>{warning.level === 'short' ? 'کسری' : 'هشدار'}</Badge>
            </span>
          ) : hasForecast ? (
            <Badge tone="good">امن</Badge>
          ) : (
            <span className="text-muted">—</span>
          )}
        </KeyCard>

        <KeyCard label="طلب از بیمه‌ها" note={`پایان ${monthLabel(month.key)}`}>
          <Money rial={month.receivableTotal} big />
        </KeyCard>

        <KeyCard
          label="چه چک‌هایی نزدیک است؟"
          aside={
            <HowCalculated
              title="چک‌های ۳۰ روز آینده"
              formula="جمع مبلغ چک‌های پرداخت‌نشده که سررسیدشان تا ۳۰ روز آینده است؛ چک‌های عقب‌افتاده هم حساب می‌شوند."
              inputs={items.map((c) => [faDate(c.dueDate), <Money rial={c.amount} />])}
              result={['جمع', <Money rial={total} />]}
            />
          }
          note={items.length ? `${faNumber(items.length)} چک تا ۳۰ روز آینده` : 'چکی تا ۳۰ روز آینده نیست.'}
        >
          <Money rial={total} big />
        </KeyCard>
      </div>

      {items.length > 0 && (
        <Card className="mt-6">
          <CardTitle>چک‌های نزدیک</CardTitle>
          <ul>
            {items.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-4 last:border-0">
                <span className="flex items-center gap-2">
                  {nameOf(c.distributorId)}
                  {c.sample && <SampleBadge />}
                </span>
                <span className="flex items-center gap-4">
                  <span className="text-note text-muted">سررسید {faDate(c.dueDate)}</span>
                  <Money rial={c.amount} />
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {nextStep && (
        <Card className="mt-6">
          <CardTitle note="چند قدم تا آماده شدن برنامه.">شروع کار</CardTitle>
          <ol>
            {steps.map((step) => (
              <li key={step.label} className="flex min-h-11 items-center gap-2">
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                    step.done ? 'border-good text-good' : 'border-line text-transparent'
                  }`}
                >
                  <Check size={14} aria-hidden />
                </span>
                <span className={step.done ? 'text-muted line-through' : ''}>{step.label}</span>
              </li>
            ))}
          </ol>
          <Button variant="primary" className="mt-4" onClick={() => go(nextStep.route)}>
            {nextStep.action}
          </Button>
        </Card>
      )}
    </>
  );
}
