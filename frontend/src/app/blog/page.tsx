import Link from "next/link";

const posts = [
  { slug: "escrow-101", title: "Escrow 101: A Beginner's Guide", description: "Learn the basics of escrow and how it can protect you in your next home project." },
  { slug: "milestone-templates", title: "Milestone Templates for Your Next Project", description: "Get started with our pre-made milestone templates for common home improvement projects." },
  { slug: "dispute-tips", title: "Tips for a Smooth Dispute Resolution", description: "Learn how to navigate the dispute resolution process and get the best outcome for your project." },
];

export default function Blog() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Conforma Blog</h1>
      <div className="max-w-3xl mx-auto">
        {posts.map((post) => (
          <div key={post.slug} className="mb-8 border-b pb-4">
            <h2 className="text-2xl font-bold mb-2">
              <Link href={`/blog/${post.slug}`} className="hover:underline">{post.title}</Link>
            </h2>
            <p className="text-slate-600 mb-4">{post.description}</p>
            <Link href={`/blog/${post.slug}`} className="text-primary hover:underline">Read More</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
