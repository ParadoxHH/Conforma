import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Terms of Service | Conforma',
  description:
    'Read the legally binding Terms of Service that govern your use of the Conforma escrow platform for Texas home projects.',
};

const sections: Array<{ title: string; content: ReactNode }> = [
  {
    title: '1. Acceptance of These Terms',
    content: (
      <>
        <p>
          These Terms of Service (&quot;Terms&quot;) constitute a binding agreement between you (&quot;you&quot; or
          &quot;User&quot;) and Conforma (&quot;Conforma,&quot; &quot;we,&quot; or &quot;us&quot;). By accessing or using
          the Conforma platform, including our web application, APIs, and related services (collectively, the
          &quot;Services&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms and
          our Privacy Policy. If you are entering into these Terms on behalf of a company or other legal entity, you
          represent that you have authority to bind that entity. If you do not agree to these Terms, you must not use
          the Services.
        </p>
      </>
    ),
  },
  {
    title: '2. Eligibility',
    content: (
      <>
        <p>
          The Services are intended solely for licensed contractors and homeowners located in the State of Texas. By
          using the Services, you represent and warrant that: (a) you are at least 18 years old and have the legal
          capacity to enter into these Terms; (b) you reside or are duly registered to conduct business in Texas; and
          (c) all information you provide to Conforma during registration and throughout your use of the Services is
          accurate, current, and complete.
        </p>
      </>
    ),
  },
  {
    title: '3. Account Registration and Security',
    content: (
      <>
        <p>
          To access certain features of the Services, you must create an account. You agree to provide true, accurate,
          and complete information during registration and to keep that information updated. You are responsible for
          maintaining the confidentiality of your login credentials and for all activities that occur under your
          account. Notify Conforma immediately of any unauthorized use of your account. Conforma is not liable for any
          loss or damage arising from your failure to maintain the security of your account.
        </p>
      </>
    ),
  },
  {
    title: '4. Escrow Services and Payment Processing',
    content: (
      <>
        <p>
          Conforma integrates with Escrow.com to facilitate milestone-based payments between homeowners and contractors.
          By initiating or accepting a project through Conforma, you authorize Conforma and its payment partners to
          create escrow transactions, collect funds, disburse payments, and perform verification steps on your behalf.
          All escrow transactions are governed by the Escrow.com Terms of Service, which are incorporated herein by
          reference. Conforma does not provide banking, legal, or accounting advice and is not a party to the underlying
          contract between homeowner and contractor.
        </p>
      </>
    ),
  },
  {
    title: '5. Fees',
    content: (
      <>
        <p>
          Conforma may charge platform or service fees in connection with escrow transactions, document verification, or
          other premium features. All applicable fees will be disclosed prior to your acceptance of a project or
          service. Fees are non-refundable unless expressly stated otherwise. Conforma reserves the right to modify its
          fees at any time, with such changes becoming effective upon notice to you or posting within the Services.
        </p>
      </>
    ),
  },
  {
    title: '6. User Conduct',
    content: (
      <>
        <p>
          You agree to use the Services only for lawful purposes and in accordance with these Terms. You shall not: (a)
          impersonate any person or entity; (b) misrepresent your affiliation with any person or entity; (c) engage in
          fraudulent, deceptive, or abusive practices; (d) upload or transmit malicious code; (e) interfere with or
          disrupt the integrity or performance of the Services; or (f) circumvent any security or access controls
          implemented by Conforma or its partners.
        </p>
      </>
    ),
  },
  {
    title: '7. Messaging and Reviews',
    content: (
      <>
        <p>
          The Services include messaging tools and review features for project participants. You are solely responsible
          for the content you transmit or post. You agree not to post unlawful, defamatory, obscene, harassing, or
          otherwise objectionable material. Conforma may monitor, remove, or restrict content at its discretion but is
          not obligated to do so.
        </p>
      </>
    ),
  },
  {
    title: '8. Document Verification',
    content: (
      <>
        <p>
          Contractors may submit licenses, insurance certificates, or other documentation through Conforma for
          verification. Conforma will review submissions and may engage third-party service providers to validate
          authenticity. Conforma does not guarantee approval of any documentation and may revoke previously granted
          badges if information is found to be inaccurate or outdated.
        </p>
      </>
    ),
  },
  {
    title: '9. Disputes Between Users',
    content: (
      <>
        <p>
          Conforma offers tools to raise disputes related to project milestones. While Conforma may facilitate
          communication, the resolution of disputes is ultimately the responsibility of the homeowner and contractor.
          Conforma is not liable for any damages arising from disputes or from the release or withholding of escrowed
          funds.
        </p>
      </>
    ),
  },
  {
    title: '10. Termination',
    content: (
      <>
        <p>
          Conforma may suspend or terminate your access to the Services at any time, with or without cause or notice.
          Upon termination, you remain responsible for any outstanding obligations, including fees or escrow balances.
          Sections that by their nature should survive termination (including indemnification, disclaimers, and
          limitations of liability) shall survive.
        </p>
      </>
    ),
  },
  {
    title: '11. Disclaimers',
    content: (
      <>
        <p>
          THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
          WHETHER EXPRESS, IMPLIED, OR STATUTORY. CONFORMA DISCLAIMS ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
          FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. Conforma does not guarantee that the Services will be
          uninterrupted, error-free, or secure, or that any defects will be corrected.
        </p>
      </>
    ),
  },
  {
    title: '12. Limitation of Liability',
    content: (
      <>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, CONFORMA, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT
          BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF
          PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY
          TO USE THE SERVICES, EVEN IF CONFORMA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. CONFORMA’S TOTAL
          LIABILITY SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO CONFORMA IN THE 12 MONTHS PRECEDING THE
          CLAIM OR (B) $100.
        </p>
      </>
    ),
  },
  {
    title: '13. Indemnification',
    content: (
      <>
        <p>
          You agree to defend, indemnify, and hold harmless Conforma and its affiliates, officers, directors, employees,
          and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable
          attorney’s fees, arising out of or in any way connected with (a) your use of the Services; (b) your breach of
          these Terms; or (c) your violation of any law or the rights of any third party.
        </p>
      </>
    ),
  },
  {
    title: '14. Governing Law and Dispute Resolution',
    content: (
      <>
        <p>
          These Terms are governed by the laws of the State of Texas, without regard to its conflict of laws principles.
          Any dispute arising out of or relating to these Terms or the Services shall be resolved through binding
          arbitration administered by the American Arbitration Association in Austin, Texas. You and Conforma agree to
          waive any right to a jury trial or to participate in a class action. Notwithstanding the foregoing, either
          party may seek injunctive or equitable relief in a court of competent jurisdiction.
        </p>
      </>
    ),
  },
  {
    title: '15. Modifications to the Terms',
    content: (
      <>
        <p>
          Conforma may modify these Terms at any time in its discretion. If material changes are made, we will provide
          notice through the Services or via email. Your continued use of the Services after the effective date of any
          changes constitutes your acceptance of the revised Terms. If you do not agree to the amendments, you must stop
          using the Services.
        </p>
      </>
    ),
  },
  {
    title: '16. Contact Information',
    content: (
      <>
        <p>
          If you have questions about these Terms, please contact Conforma at{' '}
          <a href="mailto:legal@conforma.com" className="text-primary underline">
            legal@conforma.com
          </a>{' '}
          or by mail at 411 W Monroe St, Suite 35, Austin, TX 78704.
        </p>
      </>
    ),
  },
];

export default function TermsOfServicePage() {
  return (
    <main className="bg-white py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <header className="mb-10 space-y-4 text-center md:mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Legal</span>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Conforma Terms of Service</h1>
            <p className="text-sm text-slate-600 md:text-base">
              Effective date: October 16, 2025. These Terms govern your use of the Conforma platform and services.
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
              Conforma LLC is a Texas-based escrow facilitation platform. These Terms do not constitute legal advice.
              Please consult your legal advisor for guidance specific to your circumstances.
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
