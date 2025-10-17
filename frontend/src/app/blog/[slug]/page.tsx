import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/page-hero";
import type { BlogPost, ContentBlock } from "@/lib/blog-posts";
import { blogPostMap, blogPosts } from "@/lib/blog-posts";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function renderBlock(block: ContentBlock) {
  switch (block.type) {
    case "paragraph":
      return <p className="text-base text-slate-600">{block.content}</p>;
    case "heading":
      if (block.level === 2) {
        return <h2 className="text-2xl font-semibold text-slate-900">{block.content}</h2>;
      }
      return <h3 className="text-xl font-semibold text-slate-900">{block.content}</h3>;
    case "list":
      if (block.style === "ordered") {
        return (
          <ol className="ml-4 list-decimal space-y-2 text-base text-slate-600">
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="ml-4 list-disc space-y-2 text-base text-slate-600">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6">
          <h3 className="text-lg font-semibold text-primary">{block.title}</h3>
          <p className="mt-2 text-base text-slate-600">{block.content}</p>
        </div>
      );
    default:
      return null;
  }
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post: BlogPost | undefined = blogPostMap[params.slug];

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
        actions={post.cta ? [{ href: post.cta.href, label: post.cta.label }] : undefined}
      >
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span>{dateFormatter.format(new Date(post.publishedAt))}</span>
          <span>•</span>
          <span>{post.readingTime}</span>
        </div>
      </PageHero>

      <section className="bg-white py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-8">
            {post.content.map((block, index) => (
              <div key={index}>{renderBlock(block)}</div>
            ))}
            {post.keyTakeaways.length ? (
              <aside className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-900/10">
                <h2 className="text-xl font-semibold text-slate-900">Key takeaways</h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
                  {post.keyTakeaways.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </aside>
            ) : null}
            {post.cta ? (
              <div className="space-y-4 rounded-3xl border border-primary/30 bg-primary/5 p-6">
                {post.cta.description ? (
                  <p className="text-sm text-slate-600">{post.cta.description}</p>
                ) : null}
                <Link
                  href={post.cta.href}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                >
                  {post.cta.label}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}