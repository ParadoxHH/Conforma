type ContentHeadingLevel = 2 | 3;

export type ContentBlock =
  | { type: "paragraph"; content: string }
  | { type: "heading"; level: ContentHeadingLevel; content: string }
  | { type: "list"; style: "ordered" | "unordered"; items: string[] }
  | { type: "callout"; title: string; content: string };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  readingTime: string;
  content: ContentBlock[];
  keyTakeaways: string[];
  cta?: { label: string; href: string; description?: string };
};

const posts: BlogPost[] = [
  {
    slug: "escrow-101",
    title: "Escrow 101: How Conforma Keeps Projects Accountable",
    description:
      "Understand the mechanics of escrow for residential construction and how Conforma keeps every milestone transparent for Texas homeowners and contractors.",
    category: "Guides",
    publishedAt: "2024-08-12",
    readingTime: "6 min read",
    content: [
      {
        type: "paragraph",
        content:
          "Starting a renovation or repair project should not mean worrying about deposits, missed deadlines, or finger pointing when something slips. Escrow brings discipline to the transaction by holding funds with a neutral party until everyone agrees the work is complete.",
      },
      {
        type: "heading",
        level: 2,
        content: "Escrow creates a neutral checkpoint for every payment",
      },
      {
        type: "paragraph",
        content:
          "Conforma acts as the licensed escrow agent between the homeowner and the contractor. Funds are deposited once, and draws are released only after the agreed evidence of completion is provided.",
      },
      {
        type: "list",
        style: "unordered",
        items: [
          "Homeowner: Deposits the full project budget into a regulated escrow account and approves each milestone before funds move.",
          "Contractor: Sees that capital is locked in before mobilising crews and materials, so cash flow stays predictable.",
          "Conforma: Verifies approvals, maintains records, and transfers funds when both parties sign off or a mediator rules.",
        ],
      },
      {
        type: "heading",
        level: 2,
        content: "The Conforma milestone flow",
      },
      {
        type: "list",
        style: "ordered",
        items: [
          "Define scope: Align on project deliverables, timelines, and documentation required for each milestone.",
          "Fund once: The homeowner funds the account up front, eliminating mid-project payment uncertainty.",
          "Track progress: Contractors upload photos, invoices, or permits to demonstrate completion.",
          "Approve and release: Homeowners approve a milestone, and Conforma releases the exact draw within hours.",
          "Escalate when needed: If something stalls, Conforma coordinates communication or formal dispute review.",
        ],
      },
      {
        type: "callout",
        title: "Why it matters",
        content:
          "When expectations are documented and funds are reserved, projects stay on track. Escrow reduces the emotional friction that often derails renovations.",
      },
      {
        type: "heading",
        level: 2,
        content: "Shared accountability builds trust",
      },
      {
        type: "paragraph",
        content:
          "Escrow is not about distrust. It is about giving both sides the confidence to focus on quality work. Contractors know cash is ready. Homeowners see tangible progress before paying. Everyone benefits from a clear, auditable record.",
      },
      {
        type: "paragraph",
        content:
          "Ready to bring that accountability to your next project? Book a walkthrough with our team and we will tailor milestones that match your scope.",
      },
    ],
    keyTakeaways: [
      "Escrow keeps project funds neutral until both parties agree a milestone is complete.",
      "Conforma standardises documentation so approvals and releases happen quickly.",
      "Structured milestones protect cash flow for contractors and peace of mind for homeowners.",
    ],
    cta: {
      label: "Schedule a milestone planning session",
      href: "/contact",
      description: "Tell us about your project and we will suggest a milestone schedule in under 24 hours.",
    },
  },
  {
    slug: "milestone-templates",
    title: "Milestone Templates That Keep Residential Projects Moving",
    description:
      "Use Conforma milestone templates to align expectations, manage cash flow, and keep teams accountable from day one.",
    category: "Operations",
    publishedAt: "2024-07-02",
    readingTime: "5 min read",
    content: [
      {
        type: "paragraph",
        content:
          "Milestones transform a large renovation into manageable deliverables. When each step has a defined outcome, supporting documents, and a release percentage, both homeowner and contractor know exactly what success looks like before work begins.",
      },
      {
        type: "heading",
        level: 2,
        content: "What makes a strong milestone plan",
      },
      {
        type: "list",
        style: "unordered",
        items: [
          "Observable outcomes: Each milestone should be confirmed by a photo set, inspection report, or punch list.",
          "Balanced cash flow: Payment percentages should match labour or material intensity so contractors stay liquid.",
          "Clear dependencies: Everyone should know which inspections or approvals must occur before moving forward.",
        ],
      },
      {
        type: "heading",
        level: 2,
        content: "Bathroom remodel template",
      },
      {
        type: "list",
        style: "unordered",
        items: [
          "Milestone 1: Demolition and rough-in (25 percent) - Demolition complete, framing adjusted, plumbing and electrical rough-in inspected.",
          "Milestone 2: Surfaces installed (30 percent) - Tile, waterproofing, and flooring installed with photos of key areas.",
          "Milestone 3: Fixtures set (30 percent) - Vanity, lighting, shower hardware, and ventilation installed and tested.",
          "Milestone 4: Final delivery (15 percent) - Punch list resolved, site cleaned, warranties submitted.",
        ],
      },
      {
        type: "heading",
        level: 2,
        content: "Exterior painting template",
      },
      {
        type: "list",
        style: "unordered",
        items: [
          "Milestone 1: Surface prep (30 percent) - Pressure washing, scraping, and repairs documented.",
          "Milestone 2: Prime and mask (30 percent) - Primer applied, masking and protection verified.",
          "Milestone 3: Finish coats (25 percent) - Final coats completed with close-up finish photos.",
          "Milestone 4: Walkthrough (15 percent) - Punch list sign-off and clean site.",
        ],
      },
      {
        type: "paragraph",
        content:
          "Templates are a starting point. Conforma analysts adapt them to your scope, budget, and city inspection requirements so there are no surprises mid-project.",
      },
      {
        type: "callout",
        title: "Need a custom template?",
        content:
          "Share your plans and we will draft milestone language and evidence requirements you can review with your contractor.",
      },
    ],
    keyTakeaways: [
      "Milestones provide measurable checkpoints that keep projects aligned.",
      "Payment percentages should mirror actual effort so contractors remain funded.",
      "Conforma adapts baseline templates to fit your specific scope and local rules.",
    ],
    cta: {
      label: "Request a custom milestone template",
      href: "/contact",
      description: "Our analysts will prepare a draft schedule tailored to your project.",
    },
  },
  {
    slug: "dispute-tips",
    title: "Resolving Construction Disputes Without Derailing Your Project",
    description:
      "Most construction disagreements are solvable. Here is how Conforma helps teams address issues early, document facts, and keep projects moving.",
    category: "Risk Management",
    publishedAt: "2024-05-20",
    readingTime: "4 min read",
    content: [
      {
        type: "paragraph",
        content:
          "Disputes usually start small: a scheduling slip, a quality concern, an unexpected change order. With escrow, there is space to resolve the issue before money changes hands, but only if everyone stays organised and responsive.",
      },
      {
        type: "heading",
        level: 2,
        content: "Know the common triggers",
      },
      {
        type: "list",
        style: "unordered",
        items: [
          "Scope creep: Work requested that is outside the agreed scope or lacks documented approval.",
          "Communication gaps: Updates or decisions that are not recorded, leading to mismatched expectations.",
          "Quality concerns: Materials or workmanship not matching the specifications in the contract.",
        ],
      },
      {
        type: "heading",
        level: 2,
        content: "Conforma's dispute playbook",
      },
      {
        type: "list",
        style: "ordered",
        items: [
          "Pause the release: Funds stay in escrow while the issue is reviewed.",
          "Gather the record: Conforma compiles contracts, change orders, photos, and messages in one place.",
          "Facilitate dialogue: A neutral coordinator schedules a targeted review call to clarify expectations.",
          "Recommend next steps: Most issues resolve with a corrective plan; if not, Conforma escalates to a licensed mediator.",
        ],
      },
      {
        type: "callout",
        title: "Stay proactive",
        content:
          "Document progress with dated photos, note approvals in writing, and raise concerns as soon as they surface. Quick updates are easier to resolve than late surprises.",
      },
      {
        type: "paragraph",
        content:
          "The goal is not to win a dispute; it is to finish the project. Escrow gives both sides a structured process so disagreements do not derail timelines or relationships.",
      },
    ],
    keyTakeaways: [
      "Most disputes can be resolved quickly when documentation is centralised.",
      "Escrow pauses payments until both parties agree on a corrective plan.",
      "Clear communication and evidence prevent small issues from becoming stalemates.",
    ],
    cta: {
      label: "Talk through your risk plan",
      href: "/contact",
      description: "We will review your upcoming project and suggest documentation best practices.",
    },
  },
];

export const blogPosts = posts;

export const blogPostMap = posts.reduce<Record<string, BlogPost>>((acc, post) => {
  acc[post.slug] = post;
  return acc;
}, {});
