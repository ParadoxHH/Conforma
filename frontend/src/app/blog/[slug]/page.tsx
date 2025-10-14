const posts: { [key: string]: { title: string; content: string } } = {
  "escrow-101": { 
    title: "Escrow 101: A Beginner's Guide", 
    content: `
      <p class="lead">Embarking on a home improvement project can be both exciting and daunting. One of the biggest concerns for both homeowners and contractors is ensuring that payments are handled securely and fairly. This is where escrow comes in. In this guide, we'll break down the basics of escrow and explain how Conforma uses it to bring peace of mind to your next home project.</p>

      <h2>What is Escrow?</h2>
      <p>In simple terms, escrow is a financial arrangement where a neutral third party holds and regulates payment of the funds required for two parties in a given transaction. It's like having a trusted referee for your money. The funds are kept in a secure escrow account and are only released when all the terms of an agreement are met.</p>

      <h3>Key Players in an Escrow Transaction</h3>
      <ul>
        <li><strong>The Buyer (Homeowner):</strong> The party paying for goods or services.</li>
        <li><strong>The Seller (Contractor):</strong> The party providing the goods or services.</li>
        <li><strong>The Escrow Agent (Conforma):</strong> The neutral third party that holds the funds.</li>
      </ul>

      <h2>How Conforma Streamlines the Escrow Process</h2>
      <p>At Conforma, we've tailored the escrow process specifically for home improvement projects in Texas. Here’s how it works:</p>
      <ol>
        <li><strong>Agreement:</strong> The homeowner and contractor agree on the project scope and milestones.</li>
        <li><strong>Funding:</strong> The homeowner funds the project into a secure Conforma escrow account.</li>
        <li><strong>Work Begins:</strong> The contractor begins work, knowing that the funds are secured.</li>
        <li><strong>Milestone Approval:</strong> As each milestone is completed, the homeowner reviews and approves the work.</li>
        <li><strong>Payment Release:</strong> Upon approval, Conforma releases the funds for that milestone to the contractor.</li>
      </ol>

      <h2>Conclusion</h2>
      <p>Using an escrow service like Conforma for your home project provides a safety net for everyone involved. It ensures that homeowners get the work they paid for and contractors get paid for the work they do. It's a simple, transparent, and secure way to manage your next project.</p>
      <p>Ready to start your next project with confidence? <a href="/register">Get started with Conforma today!</a></p>
    ` 
  },
  "milestone-templates": { 
    title: "Milestone Templates for Your Next Project", 
    content: `
      <p class="lead">Breaking down a large home improvement project into smaller, manageable milestones is one of the best ways to ensure a successful outcome. Milestones provide clarity, improve communication, and reduce the risk of disputes. In this post, we'll explain why milestones are so important and provide some templates to get you started.</p>

      <h2>The Power of Milestones</h2>
      <p>Milestones are more than just a to-do list. They are a powerful tool for project management. Here are a few benefits of using milestones:</p>
      <ul>
        <li><strong>Clarity and Alignment:</strong> Milestones ensure that both the homeowner and the contractor are on the same page about the project deliverables and timeline.</li>
        <li><strong>Improved Cash Flow:</strong> For contractors, getting paid at each milestone improves cash flow and reduces financial risk.</li>
        <li><strong>Reduced Risk:</strong> For homeowners, paying for work as it's completed reduces the risk of paying for unfinished or unsatisfactory work.</li>
      </ul>

      <h2>Example Milestone Template: Bathroom Remodel</h2>
      <p>Here is a sample milestone template for a standard bathroom remodel:</p>
      <ul>
        <li><strong>Milestone 1: Demolition and Rough-in (25%)</strong> - Demolition of existing fixtures, framing, and rough-in of plumbing and electrical.</li>
        <li><strong>Milestone 2: Tile and Flooring (30%)</strong> - Installation of tile in the shower and on the floor.</li>
        <li><strong>Milestone 3: Fixture Installation (30%)</strong> - Installation of the vanity, toilet, and shower fixtures.</li>
        <li><strong>Milestone 4: Final Touches (15%)</strong> - Painting, installation of accessories, and final cleanup.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Creating a clear milestone plan is a critical step in any home improvement project. It sets clear expectations, reduces risk, and helps ensure a successful outcome for both homeowners and contractors.</p>
      <p>Need help creating a milestone plan for your project? <a href="/contact">Contact the Conforma team today!</a></p>
    `
  },
  "dispute-tips": { 
    title: "Tips for a Smooth Dispute Resolution", 
    content: `
      <p class="lead">In an ideal world, every home improvement project would go smoothly. However, disputes can sometimes arise. The good news is that most disputes can be resolved quickly and amicably. In this post, we'll share some tips for a smooth dispute resolution process.</p>

      <h2>Common Causes of Disputes</h2>
      <p>Understanding the common causes of disputes can help you avoid them in the first place. Some common causes include:</p>
      <ul>
        <li><strong>Miscommunication:</strong> A lack of clear communication about the project scope, timeline, or budget.</li>
        <li><strong>Unforeseen Issues:</strong> Unexpected problems that arise during the project, such as hidden water damage.</li>
        <li><strong>Quality of Work:</strong> Disagreements about the quality of the work performed.</li>
      </ul>

      <h2>Tips for a Smooth Resolution</h2>
      <p>If a dispute does arise, here are some tips to help you navigate the process:</p>
      <ol>
        <li><strong>Stay Calm and Professional:</strong> It's important to keep a level head and communicate respectfully, even if you are frustrated.</li>
        <li><strong>Gather Your Documentation:</strong> Collect all relevant documents, including your contract, change orders, photos, and communication records.</li>
        <li><strong>Communicate Directly:</strong> Try to resolve the issue directly with the other party before escalating it.</li>
        <li><strong>Use Conforma's Dispute Resolution Process:</strong> If you can't resolve the issue on your own, Conforma's dispute resolution process can help you find a fair and efficient solution.</li>
      </ol>

      <h2>Conclusion</h2>
      <p>While disputes can be stressful, they don't have to derail your project. By communicating clearly, documenting everything, and using a trusted platform like Conforma, you can resolve disputes quickly and get your project back on track.</p>
    `
  },
};

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = posts[params.slug];

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="container mx-auto py-12">
      <article className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="prose lg:prose-xl" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </div>
  );
}