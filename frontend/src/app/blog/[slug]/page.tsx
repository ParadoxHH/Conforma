import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/page-hero";
import { blogPostMap, type BlogPost, type ContentBlock } from "@/lib/blog-posts";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(date: string) {
  return dateFormatter.format(new Date(date));
}

function renderContentBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={index} className="text-base leading-7 text-slate-600">
          {block.content}
        </p>
      );
    case "heading":
      if (block.level === 2) {
        return (
          <h2 key={index} className="text-2xl font-semibold text-slate-900">
            {block.content}
          </h2>
        );
      }
      return (
        <h3 key={index} className="text-xl font-semibold text-slate-900">
          {block.content}
        </h3>
      );
    case "list":
      if (block.style === "ordered") {
        return (
          <ol key={index} className="list-decimal space-y-2 pl-5 text-base leading-7 text-slate-600">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ol>
        );
      }
      return (
        <ul key={index} className="list-disc space-y-2 pl-5 text-base leading-7 text-slate-600">
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{item}</li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <div
          key={index}
          className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-base leading-7 text-slate-700"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{block.title}</p>
          <p className="mt-2">{block.content}</p>
        </div>
      );
    default:
      return null;
  }
}

function ArticleContent({ post }: { post: BlogPost }) {
  return (
    <article className="surface-card mx-auto max-w-3xl space-y-8 rounded-3xl border border-white/60 bg-white/90 p-10 shadow-lg shadow-slate-900/10 backdrop-blur">
      {post.content.map((block, index) => renderContentBlock(block, index))}
    </article>
  );
}

function KeyTakeaways({ post }: { post: BlogPost }) {
  if (!post.keyTakeaways.length) {
    return null;
  }

  return (
    <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-sm shadow-slate-900/5">
      <h3 className="text-lg font-semibold text-slate-900">Key takeaways</h3>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
        {post.keyTakeaways.map((takeaway, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-primary" aria-hidden />
            <span>{takeaway}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = blogPostMap[params.slug];

  if (!post) {
    notFound();
  }

  return (
    <main className="flex flex-col gap-0">
      <PageHero
        eyebrow={post.category}
        title={post.title}
        description={post.description}
        align="left"
        actions={[
          { href: "/register", label: "Create your escrow" },
          { href: "/contact", label: "Consult the Conforma team", variant: "secondary" },
        ]}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/60 bg-white/80 p-4 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Published</p>
            <p className="mt-2 font-semibold text-slate-900">{formatDate(post.publishedAt)}</p>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/80 p-4 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Reading time</p>
            <p className="mt-2 font-semibold text-slate-900">{post.readingTime}</p>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/80 p-4 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Next step</p>
            <p className="mt-2 text-slate-900">
              Share this playbook with your project team or request a guided review.
            </p>
          </div>
        </div>
      </PageHero>

      <section className="bg-white/80 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <ArticleContent post={post} />
          <KeyTakeaways post={post} />
          {post.cta ? (
            <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-primary/20 bg-primary/5 p-8 text-sm leading-6 text-slate-700 shadow-sm shadow-primary/10">
              <h3 className="text-lg font-semibold text-slate-900">{post.cta.label}</h3>
              {post.cta.description ? <p className="mt-2">{post.cta.description}</p> : null}
              <Link
                href={post.cta.href}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              >
                Connect with Conforma
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
