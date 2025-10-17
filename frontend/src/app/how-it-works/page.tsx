'use client';

import { MilestoneTimeline } from '@/components/milestone-timeline';
import { PageHero } from '@/components/page-hero';
import { ScrollLinkedStepper } from '@/components/scroll-linked-stepper';
import { useTranslation } from '@/i18n/translation-context';

export default function HowItWorks() {
  const { t, get } = useTranslation();

  const overview = get<{ title: string; description: string }[]>('howItWorks.overview') ?? [];
  const highlights = get<{ title: string; description: string }[]>('howItWorks.highlights.items') ?? [];

  return (
    <main className="flex flex-col gap-0">
      <PageHero
        eyebrow={t('howItWorks.hero.eyebrow')}
        title={t('howItWorks.hero.title')}
        description={t('howItWorks.hero.description')}
        align="left"
        actions={[{ href: '/register', label: t('howItWorks.hero.action') }]}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {overview.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/60 bg-white/80 p-5 text-left shadow-sm shadow-slate-900/5"
            >
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="bg-white/80 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="surface-card rounded-3xl border border-white/60 bg-white/90 p-10 shadow-lg shadow-slate-900/10 backdrop-blur">
            <h2 className="text-3xl font-semibold text-slate-900">{t('howItWorks.milestones.title')}</h2>
            <p className="mt-3 text-base text-slate-600">{t('howItWorks.milestones.description')}</p>
            <div className="mt-12">
              <ScrollLinkedStepper />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-section-muted py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900">{t('howItWorks.timeline.title')}</h2>
            <p className="mt-3 text-base text-slate-600">{t('howItWorks.timeline.description')}</p>
          </div>
          <div className="mt-12">
            <MilestoneTimeline />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900">{t('howItWorks.highlights.title')}</h2>
            <p className="mt-3 text-base text-slate-600">{t('howItWorks.highlights.description')}</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {highlights.map((highlight) => (
              <div
                key={highlight.title}
                className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 text-left shadow-sm shadow-slate-900/5"
              >
                <h3 className="text-lg font-semibold text-slate-900">{highlight.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-section-muted py-16">
        <div className="container px-4 md:px-6">
          <div className="surface-card rounded-3xl border border-white/60 bg-white/90 p-8 text-sm text-slate-600 shadow-lg shadow-slate-900/10 backdrop-blur">
            <p>{t('howItWorks.cta.text')}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
