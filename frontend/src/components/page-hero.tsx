import Link from "next/link";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type HeroAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: HeroAction[];
  align?: "left" | "center";
  children?: ReactNode;
  className?: string;
};

const primaryActionClasses =
  "inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary";

const secondaryActionClasses =
  "inline-flex h-12 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 px-8 text-base font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60";

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  align = "center",
  children,
  className,
}: PageHeroProps) {
  const alignmentClass = align === "left" ? "text-left" : "text-center";
  const actionsAlignmentClass =
    align === "left"
      ? "items-start justify-start sm:flex-row sm:items-center"
      : "items-center justify-center sm:flex-row sm:items-center";

  return (
    <section className={cn("relative overflow-hidden bg-hero-gradient", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/16 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-sky-200/35 blur-3xl"
      />
      <div className="container relative z-10 px-4 pb-16 pt-20 md:pt-28 lg:pb-20 lg:pt-32">
        <div className={cn("mx-auto max-w-4xl", alignmentClass)}>
          {eyebrow ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary shadow-sm ring-1 ring-inset ring-primary/20">
              {eyebrow}
            </span>
          ) : null}
          <h1
            className={cn(
              "mt-6 text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-[44px] md:leading-[1.05]",
              align === "left" ? "text-left" : "text-center",
            )}
          >
            {title}
          </h1>
          <p
            className={cn(
              "mt-4 text-lg text-slate-600 md:text-xl",
              align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
            )}
          >
            {description}
          </p>
          {actions?.length ? (
            <div className={cn("mt-8 flex flex-col gap-4", actionsAlignmentClass)}>
              {actions.map((action) => {
                const actionClass =
                  action.variant === "secondary" ? secondaryActionClasses : primaryActionClasses;
                return (
                  <Link key={action.href} href={action.href} className={actionClass}>
                    {action.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
        {children ? (
          <div
            className={cn(
              "relative mt-12",
              align === "center" ? "mx-auto max-w-4xl" : "max-w-5xl",
            )}
          >
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
