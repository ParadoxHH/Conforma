import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Conforma',
  description:
    'Learn how Conforma collects, uses, and safeguards personal information for homeowners and contractors on our escrow platform.',
};

const sections: Array<{ title: string; content: ReactNode }> = [
  {
    title: '1. Overview',
    content: (
      <>
        <p>
          This Privacy Policy explains how Conforma (&quot;Conforma,&quot; &quot;we,&quot; &quot;us,&quot; or
          &quot;our&quot;) collects, uses, discloses, and safeguards personal information when you use our platform for
          Texas home service projects. By accessing or using the Services, you consent to the practices described in
          this Privacy Policy.
        </p>
      </>
    ),
  },
  {
    title: '2. Information We Collect',
    content: (
      <>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Account Information:</strong> Name, email address, phone number, company details, trade
            specializations, and profile content provided during registration or account updates.
          </li>
          <li>
            <strong>Project and Escrow Data:</strong> Milestone descriptions, pricing, invoices, evidence uploads, and
            communication related to projects managed through Conforma.
          </li>
          <li>
            <strong>Verification Documents:</strong> Licenses, insurance certificates, government-issued identification,
            and associated metadata required for contractor vetting.
          </li>
          <li>
            <strong>Usage Data:</strong> Log files, IP address, browser type, operating system, referring URLs, device
            identifiers, page views, and timestamps collected via cookies and analytics tools.
          </li>
          <li>
            <strong>Communications:</strong> Support requests, dispute submissions, invites, reviews, and messaging
            content sent through the platform.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '3. How We Use Information',
    content: (
      <>
        <ul className="list-disc space-y-2 pl-6">
          <li>To provide, maintain, and improve the Services;</li>
          <li>To facilitate escrow transactions through Escrow.com and other payment partners;</li>
          <li>To verify contractor credentials and risk indicators;</li>
          <li>To communicate with users about projects, disputes, updates, and promotional offers;</li>
          <li>To personalize content, analytics, and recommendations;</li>
          <li>To protect the integrity and security of the platform, including fraud detection and prevention;</li>
          <li>To comply with legal obligations and enforce our Terms of Service.</li>
        </ul>
      </>
    ),
  },
  {
    title: '4. Legal Bases for Processing',
    content: (
      <>
        <p>
          We process personal information based on the following legal grounds: (a) contract performance (provision of
          escrow and project management tools); (b) legitimate interests (fraud prevention, platform security, customer
          support); (c) compliance with legal obligations; and (d) your consent, where required by law.
        </p>
      </>
    ),
  },
  {
    title: '5. Sharing of Information',
    content: (
      <>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Service Providers:</strong> We share information with trusted vendors who perform services on our
            behalf, including hosting, analytics, messaging, background screening, and customer support.
          </li>
          <li>
            <strong>Escrow Partners:</strong> Transaction details are shared with Escrow.com and payment processors to
            facilitate funding and disbursements.
          </li>
          <li>
            <strong>Project Participants:</strong> Homeowners and contractors receive necessary project and profile
            information to collaborate effectively.
          </li>
          <li>
            <strong>Legal Requirements:</strong> We may disclose information in response to lawful requests by public
            authorities, court orders, or to protect our rights, privacy, safety, or property.
          </li>
          <li>
            <strong>Business Transfers:</strong> In the event of a merger, acquisition, or asset sale, information may
            be transferred to the successor entity.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '6. Cookies and Tracking Technologies',
    content: (
      <>
        <p>
          Conforma uses cookies and similar technologies to maintain sessions, remember preferences, analyze traffic,
          and deliver relevant communications. You can manage cookie preferences in your browser settings, but disabling
          cookies may affect certain features. We also rely on analytics services such as Google Analytics or similar
          tools to better understand platform usage.
        </p>
      </>
    ),
  },
  {
    title: '7. Data Retention',
    content: (
      <>
        <p>
          We retain personal information for as long as necessary to fulfill the purposes outlined in this Privacy
          Policy, comply with legal obligations, resolve disputes, and enforce agreements. Escrow transaction records
          are retained in accordance with financial and regulatory requirements.
        </p>
      </>
    ),
  },
  {
    title: '8. Security',
    content: (
      <>
        <p>
          Conforma implements administrative, technical, and physical safeguards designed to protect personal
          information against unauthorized access, loss, misuse, or alteration. However, no security measures are
          infallible, and we cannot guarantee absolute security. You are responsible for safeguarding your account
          credentials.
        </p>
      </>
    ),
  },
  {
    title: '9. Your Choices and Rights',
    content: (
      <>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Access and Correction:</strong> You may access and update your account information through the
            profile settings.
          </li>
          <li>
            <strong>Deletion:</strong> You may request deletion of your personal information by contacting us, subject
            to legal and contractual obligations.
          </li>
          <li>
            <strong>Marketing Preferences:</strong> You may opt out of marketing emails by using the unsubscribe link
            within those communications.
          </li>
          <li>
            <strong>Do Not Track:</strong> Our Services currently do not respond to Do Not Track (DNT) signals.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '10. Children’s Privacy',
    content: (
      <>
        <p>
          The Services are not intended for individuals under the age of 18. We do not knowingly collect personal
          information from children under 13. If we become aware that a child has provided us with personal information,
          we will take steps to remove such information and terminate the associated account.
        </p>
      </>
    ),
  },
  {
    title: '11. International Transfers',
    content: (
      <>
        <p>
          Conforma is based in the United States. By using the Services, you understand that your personal information
          may be transferred to, stored in, and processed within the United States and other jurisdictions where our
          service providers operate. We implement appropriate safeguards when transferring data internationally.
        </p>
      </>
    ),
  },
  {
    title: '12. Changes to This Policy',
    content: (
      <>
        <p>
          We may update this Privacy Policy from time to time. If material changes are made, we will notify you via the
          Services or email. Changes become effective on the date posted unless otherwise specified. Your continued use
          of the Services after the effective date constitutes acceptance of the revised policy.
        </p>
      </>
    ),
  },
  {
    title: '13. Contact Us',
    content: (
      <>
        <p>
          If you have questions or concerns about this Privacy Policy or our data practices, please contact us at{' '}
          <a href="mailto:privacy@conforma.com" className="text-primary underline">
            privacy@conforma.com
          </a>{' '}
          or by mail at 411 W Monroe St, Suite 35, Austin, TX 78704.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <header className="mb-10 space-y-4 text-center md:mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Legal</span>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Conforma Privacy Policy</h1>
            <p className="text-sm text-slate-600 md:text-base">
              Effective date: October 16, 2025. This Privacy Policy describes how Conforma collects and protects your
              data.
            </p>
          </header>
          <div className="space-y-12 text-sm leading-relaxed text-slate-700 md:text-base">
            {sections.map((section) => (
              <section key={section.title} className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                <div className="space-y-4">{section.content}</div>
              </section>
            ))}
          </div>
          <footer className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-500">
            <p>
              Conforma LLC operates in accordance with applicable U.S. and Texas privacy laws. This policy does not
              create any third-party beneficiary rights.
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
