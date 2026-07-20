import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Questionnaire from "@/components/Questionnaire";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import { getSubmissionsByUser } from "@/lib/submissions";

export const metadata: Metadata = {
  title: "Business Audit | Moore Solutions",
  description:
    "Answer a few questions about your biggest operational headaches. I'll identify your top AI opportunities and deliver your report within 48 hours.",
  // Gated behind a session (see src/proxy.ts) — no public content to index.
  robots: { index: false, follow: false },
};

export default async function QuestionnairePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signup");
  }

  const user = getUserById(session.user.id);
  if (!user) redirect("/signup");

  const submissions = getSubmissionsByUser(user.id);
  const alreadySubmitted = submissions.length > 0;

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen pt-[58px] br-grid"
        style={{ backgroundColor: "#040C1C" }}
      >
        {/* Page header */}
        <section className="px-10 pt-[32px] pb-[15px]">
          <div className="max-w-3xl mx-auto">
            <h1
              className="font-sans font-black leading-tight mb-4"
              style={{ fontSize: "2rem", color: "#EEF6FF" }}
            >
              Business Audit.
            </h1>
            {!alreadySubmitted && user.emailVerified && (
              <p
                className="font-sans text-[24px] leading-relaxed"
                style={{ color: "#80AEE0" }}
              >
                Hi {user.firstName}, answer four quick sections and I&apos;ll
                send your personalized Opportunity Report within 48 hours.
              </p>
            )}
          </div>
        </section>

        {/* Form section */}
        <section className="px-10 pt-0 pb-12">
          <div className="max-w-3xl mx-auto">
            <Questionnaire
              firstName={user.firstName}
              email={user.email}
              emailVerified={user.emailVerified}
              alreadySubmitted={alreadySubmitted}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
