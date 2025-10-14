# Conforma

This is a Next.js project for Conforma, a Texas-only escrow platform for home projects.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Add a New Section

To add a new section to the landing page, you can create a new component and add it to the `src/app/page.tsx` file. 

1.  Create a new component file in the `src/components` directory (e.g., `src/components/my-new-section.tsx`).
2.  Build your component using React and Tailwind CSS.
3.  Import your new component into `src/app/page.tsx`.
4.  Add your component to the `Home` component's JSX in the desired order.

## Component Usage

This project uses `shadcn/ui` for the component library. You can find the documentation for the components [here](https://ui.shadcn.com/).

Here are some of the custom components created for this project:

-   `TrustBadgeRow`: Displays a row of trust badges with tooltips.
-   `StatsCounter`: An animated number counter.
-   `FeatureTabs`: A tabbed interface to display features.
-   `HowItWorksStepper`: A stepper component to show a process.
-   `ScrollLinkedStepper`: A scroll-linked version of the stepper.
-   `MilestoneTimeline`: A vertical timeline for milestones.
-   `FAQAccordion`: An accordion for frequently asked questions.
-   `TestimonialCarousel`: A carousel for testimonials.
-   `FloatingHelp`: A floating help button with a drawer.
-   `LeadForm`: A lead capture form with validation.