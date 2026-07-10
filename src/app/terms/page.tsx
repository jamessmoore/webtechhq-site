import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service | Moore Solutions",
};

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="LEGAL"
      title="Terms of Service"
      lastUpdated="Effective Date: June 30, 2026 · Last Updated: July 10, 2026"
    >
      <div className="legal-content">
        <h2>1. Introduction &amp; Acceptance</h2>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to
          and use of webtechhq.com (the &quot;Site&quot;) and the
          consulting, automation, and AI-integration services
          (collectively, the &quot;Services&quot;) offered by Moore
          Solutions, a sole proprietorship operated by James S. Moore
          (&quot;Moore Solutions,&quot; &quot;we,&quot; &quot;us,&quot; or
          &quot;our&quot;), based in the State of Arizona, United States.
        </p>
        <p>
          By accessing the Site or engaging Moore Solutions for Services,
          you agree to be bound by these Terms. If you do not agree, do
          not use the Site or engage the Services.
        </p>

        <h2>2. Description of Services</h2>
        <p>
          Moore Solutions provides the free Opportunity Finder, a
          form-driven tool that generates a prompt template highlighting
          potential AI opportunities for your business, and the Business
          Audit, a paid, fully automated report generated using AI (see
          Section 3 below). For clients who choose to move forward on
          findings from either tool, Moore Solutions also provides custom
          automation, AI integration, and implementation engagements,
          scoped and agreed separately with each client.
        </p>

        <h2>3. AI-Generated Content &amp; Automated Tools</h2>
        <p>
          Certain features on the Site use artificial intelligence to
          generate responses, including but not limited to:
        </p>
        <ul>
          <li>
            <strong>Business Audit:</strong>{" "}When you purchase a Business
            Audit, your responses are processed using
            Anthropic&apos;s Claude models via Amazon Web Services (AWS)
            Bedrock to generate your personalized Business Audit report,
            which is stored on the Site and emailed to you as a link.
            This step is clearly labeled as AI-powered before you submit
            your responses.
          </li>
        </ul>
        <p>
          The free Opportunity Finder does not use AI to generate its
          result. Your responses are used to populate a prompt template
          that is displayed back to you; no AI model is called as part
          of that submission.
        </p>
        <p>You acknowledge that:</p>
        <ul>
          <li>
            AI-generated responses are produced algorithmically and may not
            always be fully accurate, complete, or applicable to your
            specific circumstances.
          </li>
          <li>
            AI-generated content does not constitute professional, legal,
            financial, or technical advice unless explicitly confirmed by
            James S. Moore directly.
          </li>
          <li>
            Moore Solutions may use Anthropic&apos;s Claude API (via direct
            API access or AWS Bedrock) and other foundation model providers
            in delivering Services, including in custom agentic systems
            built for clients. Where a specific client engagement involves
            processing client data through third-party AI APIs, that will
            be disclosed and addressed in the applicable engagement
            agreement or statement of work.
          </li>
        </ul>

        <h2>4. Payments &amp; Refunds</h2>
        <p>
          Business Audit purchases are processed through PayPal at the
          time of purchase. Your personalized report is generated
          automatically, typically within a few minutes.
        </p>
        <p>
          Because the Business Audit is an automated digital product
          delivered immediately after purchase, all sales are final once
          your report has been successfully generated. If your payment is
          captured but report generation fails, contact me at{" "}
          <a href="mailto:termsofservice@webtechhq.com">
            termsofservice@webtechhq.com
          </a>{" "}
          and you will receive a full refund.
        </p>
        <p>
          The Business Audit fee is credited in full toward the cost of
          any implementation engagement you begin with Moore Solutions.
        </p>

        <h2>5. No Sale or Sharing of Personal Data</h2>
        <p>
          Moore Solutions does not sell, rent, or share personal data
          collected through the Site or in the course of providing
          Services with third parties for marketing or any other purpose
          outside of direct service delivery and communication with you.
          See my <Link href="/privacy">Privacy Policy</Link> for full
          details.
        </p>

        <h2>6. User Responsibilities</h2>
        <p>You agree to:</p>
        <ul>
          <li>
            Provide accurate information when submitting forms or
            engaging Services.
          </li>
          <li>Use the Site and Services only for lawful purposes.</li>
          <li>
            Not attempt to reverse-engineer, scrape, or misuse any
            automated or AI-driven features on the Site.
          </li>
        </ul>

        <h2>7. Intellectual Property</h2>
        <p>
          All content on the Site, including the Moore Solutions name,
          &quot;M Shield&quot; logo, wordmark, and original written
          content, is the property of James S. Moore d/b/a Moore
          Solutions, unless otherwise noted. You may not reproduce,
          distribute, or create derivative works from this content
          without prior written permission.
        </p>
        <p>
          Deliverables created for clients under a separate signed
          engagement agreement are governed by the intellectual property
          terms of that specific agreement, which take precedence over
          this general provision.
        </p>

        <h2>8. Disclaimers</h2>
        <p>
          THE SITE AND ANY GENERAL INFORMATION PROVIDED THROUGH IT ARE
          PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND,
          EXPRESS OR IMPLIED. MOORE SOLUTIONS DOES NOT WARRANT THAT
          AI-GENERATED CONTENT WILL BE ACCURATE, ERROR-FREE, OR SUITABLE
          FOR ANY PARTICULAR PURPOSE. PAID CONSULTING AND DEVELOPMENT
          SERVICES ARE GOVERNED BY SEPARATE SIGNED ENGAGEMENT AGREEMENTS,
          WHICH MAY INCLUDE ADDITIONAL OR DIFFERENT WARRANTIES.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted under Arizona law, James S.
          Moore d/b/a Moore Solutions shall not be liable for any
          indirect, incidental, special, consequential, or punitive
          damages arising out of your use of the Site or general
          informational content, even if advised of the possibility of
          such damages.
        </p>

        <h2>10. Governing Law &amp; Jurisdiction</h2>
        <p>
          These Terms are governed by the laws of the State of Arizona,
          without regard to its conflict of law principles. Any disputes
          arising under these Terms shall be resolved in the state or
          federal courts located in Maricopa County, Arizona, and you
          consent to personal jurisdiction therein.
        </p>

        <h2>11. Changes to These Terms</h2>
        <p>
          Moore Solutions may update these Terms from time to time.
          Continued use of the Site after changes are posted constitutes
          acceptance of the revised Terms. The &quot;Last Updated&quot;
          date above reflects the most recent revision.
        </p>

        <h2>12. Contact</h2>
        <p>
          Questions about these Terms can be directed to:
          <br />
          James S. Moore
          <br />
          Moore Solutions
          <br />
          <a href="mailto:termsofservice@webtechhq.com">
            termsofservice@webtechhq.com
          </a>
          <br />
          webtechhq.com
        </p>

        <p className="legal-fineprint">
          Moore Solutions is a sole proprietorship operated by James S.
          Moore and is not currently a registered legal entity in the
          State of Arizona or elsewhere.
        </p>
      </div>
    </LegalLayout>
  );
}
