import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { blogPosts } from "@/lib/blog-posts";

type CardPost = typeof blogPosts[number];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(date: string) {
  return dateFormatter.format(new Date(date));
}

function FeaturedArticle({ post }: { post: CardPost }) {
  return (
    <article className="surface-card flex h-full flex-col justify-between gap-6 rounded-3xl border border-white/60 bg-white/90 p-10 shadow-lg shadow-slate-900/10 backdrop-blur">
      <div className="space-y-4">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {post.category}
        </span>
        <div>
          <h2 className="text-3xl font-semibold leading-tight text-slate-900">{post.title}</h2>
          <p className="mt-3 text-base text-slate-600">{post.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
        <span>{formatDate(post.publishedAt)}</span>
        <span aria-hidden>•</span>
        <span>{post.readingTime}</span>
      </div>
      <div>
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
        >
          Read the full analysis
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}

function ArticleCard({ post }: { post: CardPost }) {
  return (
    <article className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10">
      <span className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        {post.category}
      </span>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">{post.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{post.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>{formatDate(post.publishedAt)}</span>
        <span aria-hidden>•</span>
        <span>{post.readingTime}</span>
      </div>
      <div className="mt-6">
        <Link
          href={`/blog/${post.slug}`}
          className="text-sm font-semibold text-primary hover:text-primary/80"
        >
          Read more
        </Link>
      </div>
    </article>
  );
}

export default function Blog() {
  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const [featured, ...others] = sortedPosts;
  const categories = Array.from(new Set(sortedPosts.map((post) => post.category)));

  return (
    <main className="flex flex-col gap-0">
      <PageHero
        eyebrow="Insights"
        title="Expert guidance for every project milestone"
        description="Templates, playbooks, and lessons from the Conforma escrow team to keep Texas residential projects transparent."
        align="left"
        actions={[
          { href: "/register", label: "Create your escrow" },
          { href: "/contact", label: "Talk with our team", variant: "secondary" },
        ]}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category}
              className="rounded-3xl border border-white/60 bg-white/80 p-4 text-sm shadow-sm shadow-slate-900/5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Focus area
              </p>
              <p className="mt-2 font-semibold text-slate-900">{category}</p>
              <p className="mt-1 text-slate-600">
                Articles curated for {category.toLowerCase()} teams.
              </p>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="bg-white/80 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
            {featured ? <FeaturedArticle post={featured} /> : null}
            <div className="space-y-6">
              {others.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-section-muted py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="surface-card flex flex-col items-start gap-6 rounded-3xl border border-white/60 bg-white/90 p-8 shadow-lg shadow-slate-900/10 backdrop-blur md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Need help shaping the plan for your next project?
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                Conforma analysts will review your scope, recommend milestone evidence, and configure escrow in a single session.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              Talk to Conforma
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
