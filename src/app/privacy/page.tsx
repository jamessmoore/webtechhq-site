import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | Moore Solutions",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="LEGAL"
      title="Privacy Policy"
      lastUpdated="Effective Date: June 30, 2026 · Last Updated: July 10, 2026"
    >
      <div className="legal-content">
        <h2>1. Introduction</h2>
        <p>
          This Privacy Policy explains how James S. Moore, doing business
          as Moore Solutions (&quot;Moore Solutions,&quot; &quot;we,&quot;
          &quot;us,&quot; or &quot;our&quot;), a sole proprietorship based
          in the State of Arizona, collects, uses, and protects
          information when you visit webtechhq.com (the &quot;Site&quot;)
          or engage our Services.
        </p>

        <h2>2. Information We Collect</h2>
        <p>We may collect the following categories of information:</p>
        <ul>
          <li>
            <strong>Contact information</strong> you provide directly,
            such as name, email address, and phone number, when you fill
            out a contact form, use the Opportunity Finder, or otherwise reach out.
          </li>
          <li>
            <strong>Form responses</strong>, including business details you
            submit through the Opportunity Finder or the Business Audit.
          </li>
          <li>
            <strong>Communications</strong>, including emails or messages
            exchanged during the course of a consultation or engagement.
          </li>
          <li>
            <strong>Basic technical data</strong> collected through Google
            Analytics, including general location derived from IP address,
            browser and device type, pages visited, and the referrer or
            campaign source that brought you to the Site.
          </li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We use the information collected solely to:</p>
        <ul>
          <li>Respond to inquiries and provide the Services you request.</li>
          <li>
            Generate your Business Audit report using AI (see Section 4
            below).
          </li>
          <li>
            Communicate with you about your project, consultation, or
            engagement.
          </li>
          <li>
            Maintain business records for our own operational and
            accounting purposes.
          </li>
        </ul>
        <p>
          <strong>
            We do not use your information for advertising, marketing to
            third parties, or any purpose unrelated to direct
            communication and service delivery with you.
          </strong>
        </p>

        <h2>4. AI Processing Disclosure</h2>
        <p>
          When you purchase a Business Audit, your responses
          are processed using Anthropic&apos;s Claude AI
          models, accessed via Amazon Web Services (AWS) Bedrock, to
          generate your personalized Business Audit report. The report
          is stored on our Site and you are emailed a link to view it.
          This step is clearly labeled as AI-powered before you submit
          your responses.
        </p>
        <p>
          The free Opportunity Finder does not use AI to generate its
          result. Your responses are used to populate a prompt template
          that is displayed back to you; no AI model is called as part
          of that submission.
        </p>
        <p>
          Per Anthropic&apos;s and AWS&apos;s respective data handling
          policies for Bedrock-accessed models, your submitted data is not
          used by Anthropic or AWS to train their underlying foundation
          models.
        </p>
        <p>
          If Moore Solutions builds custom AI-driven systems for a
          specific client engagement that process that client&apos;s own
          customer data, the data handling terms for that specific system
          will be addressed separately in the relevant engagement
          agreement, not solely by this general Privacy Policy.
        </p>

        <h2>5. No Sale or Sharing of Personal Data</h2>
        <p>
          We do not sell, rent, trade, or share your personal data with
          third parties for marketing, advertising, or any commercial
          purpose unrelated to delivering Services to you. Your
          information is used only by James S. Moore, directly, for
          communicating with you and fulfilling the Services
          you&apos;ve requested.
        </p>
        <p>The only exceptions are:</p>
        <ul>
          <li>
            Service providers strictly necessary to operate our business
            (e.g., AWS for hosting and AI processing, email providers for
            communication), who are contractually or by policy restricted
            from using your data for their own purposes.
          </li>
          <li>Disclosure required by law, subpoena, or valid legal process.</li>
        </ul>

        <h2>6. Data Retention</h2>
        <p>
          We retain Opportunity Finder submissions, Business Audit
          submissions and AI-generated reports, and related
          communications indefinitely for business recordkeeping and
          follow-up purposes, unless you request deletion (see
          Section 8).
        </p>

        <h2>7. Your Rights &amp; Choices</h2>
        <p>
          You may request that we delete your personal data at any time
          by contacting us using the information in Section 13. I will
          honor such requests except where I am legally required to
          retain certain records (e.g., for tax or contractual purposes).
        </p>

        <h2>8. Requesting Data Deletion</h2>
        <p>
          To request removal of your data, email us at{" "}
          <a href="mailto:privacypolicy@webtechhq.com">
            privacypolicy@webtechhq.com
          </a>{" "}
          with the subject line &quot;Data Deletion Request.&quot; We
          will confirm and process your request within a reasonable
          timeframe.
        </p>

        <h2>9. Data Security</h2>
        <p>
          We take reasonable measures to protect your information,
          including relying on AWS&apos;s infrastructure security for
          data processed via Bedrock. However, no method of transmission
          or storage is 100% secure, and we cannot guarantee absolute
          security.
        </p>

        <h2>10. Children&apos;s Privacy</h2>
        <p>
          The Site and Services are not directed to individuals under 18.
          We do not knowingly collect personal data from children.
        </p>

        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy periodically. The &quot;Last
          Updated&quot; date above reflects the most recent revision.
          Continued use of the Site after changes are posted constitutes
          acceptance of the revised policy.
        </p>

        <h2>12. Governing Law</h2>
        <p>
          This Privacy Policy is governed by the laws of the State of
          Arizona.
        </p>

        <h2>13. Contact Us</h2>
        <p>
          For questions about this Privacy Policy or to exercise your
          data rights, contact:
          <br />
          James S. Moore
          <br />
          Moore Solutions
          <br />
          <a href="mailto:privacypolicy@webtechhq.com">
            privacypolicy@webtechhq.com
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
