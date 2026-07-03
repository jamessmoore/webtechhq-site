import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import { getSubmissionsByUser } from "@/lib/submissions";
import AdminNotesEditor from "@/components/AdminNotesEditor";
import DeleteAccountButton from "@/components/DeleteAccountButton";

function requireAdmin(email: string | null | undefined): void {
  if (!email || email !== process.env.ADMIN_EMAIL) redirect("/signin");
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="font-sans text-[10px] tracking-widest mb-1.5">
        {label}
      </p>
      <div className="font-sans text-[14px] leading-relaxed" style={{ color: "#EEF6FF" }}>
        {children}
      </div>
    </div>
  );
}

function Answer({ value }: { value: string | number | undefined | null }) {
  if (!value && value !== 0) {
    return <span style={{ color: "#4A6A8A" }}>Not provided</span>;
  }
  return <span>{String(value)}</span>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`p-6 ${className}`}
      style={{ backgroundColor: "#071525", border: "0.8px solid #162D5A", borderRadius: "4px" }}
    >
      {children}
    </div>
  );
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  requireAdmin(session?.user?.email);

  const { id } = await params;
  const user = getUserById(id);
  if (!user) notFound();

  const submission = getSubmissionsByUser(user.id)[0];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#030B18" }}>
      {/* Admin header */}
      <header
        className="flex items-center justify-between px-8 py-4"
        style={{ borderBottom: "0.8px solid #162D5A", backgroundColor: "#040C1C" }}
      >
        <div className="flex items-center gap-4">
          <Link href="/admin" className="font-sans font-black text-[18px]" style={{ color: "#EEF6FF" }}>
            Moore Solutions
          </Link>
          <span
            className="font-sans text-[10px] tracking-widest px-2 py-0.5"
            style={{ color: "#89D4FF", backgroundColor: "rgba(61,127,212,0.15)", border: "0.8px solid #3D7FD4", borderRadius: "3px" }}
          >
            ADMIN
          </span>
        </div>
        <p className="font-sans text-[12px]">
          {session?.user?.email}
        </p>
      </header>

      <main className="px-8 py-8 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/admin/users" className="font-sans text-[12px] transition-colors" style={{ color: "#5B90C8" }}>
            ← All users
          </Link>
        </div>

        {/* Page title + status */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-sans font-black text-[22px] mb-1" style={{ color: "#EEF6FF" }}>
              {user.firstName} {user.lastName}
            </h1>
            <p className="font-sans text-[13px]">
              {user.email} · Signed up {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <span
            className="font-sans text-[11px] tracking-widest px-3 py-1"
            style={{
              color: user.emailVerified ? "#2ea043" : "#FBBC05",
              backgroundColor: user.emailVerified ? "rgba(46,160,67,0.1)" : "rgba(251,188,5,0.1)",
              border: `0.8px solid ${user.emailVerified ? "#2ea043" : "#FBBC05"}`,
              borderRadius: "3px",
            }}
          >
            {user.emailVerified ? "VERIFIED" : "UNVERIFIED"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left — questionnaire answers + prompt */}
          <div className="space-y-4">
            {!submission ? (
              <Card>
                <p className="font-sans text-[14px]">
                  No questionnaire submitted yet.
                </p>
              </Card>
            ) : (
              <>
                {/* Business basics */}
                <Card>
                  <h2 className="font-sans font-bold text-[12px] tracking-widest mb-4" style={{ color: "#3D7FD4" }}>
                    BUSINESS
                  </h2>
                  <div className="grid grid-cols-2 gap-x-6">
                    <Section label="TYPE">
                      <Answer value={submission.businessType} />
                    </Section>
                    <Section label="TEAM SIZE">
                      <Answer value={submission.teamSize} />
                    </Section>
                  </div>
                </Card>

                {/* The problem */}
                <Card>
                  <h2 className="font-sans font-bold text-[12px] tracking-widest mb-4" style={{ color: "#3D7FD4" }}>
                    THE PROBLEM
                  </h2>
                  <Section label="BIGGEST OPERATIONAL HEADACHE">
                    <Answer value={submission.layer1Problem} />
                  </Section>
                  <Section label="TASK THEY'D ELIMINATE FIRST">
                    <Answer value={submission.layer1Elimination} />
                  </Section>
                </Card>

                {/* Time & cost */}
                <Card>
                  <h2 className="font-sans font-bold text-[12px] tracking-widest mb-4" style={{ color: "#3D7FD4" }}>
                    TIME & COST
                  </h2>
                  <div className="grid grid-cols-2 gap-x-6">
                    <Section label="HOURS / WEEK">
                      <Answer value={submission.layer2Hours != null ? `${submission.layer2Hours} hrs` : null} />
                    </Section>
                    <Section label="HOURLY COST">
                      <Answer value={submission.layer2Salary} />
                    </Section>
                  </div>
                </Card>

                {/* Fit */}
                <Card>
                  <h2 className="font-sans font-bold text-[12px] tracking-widest mb-4" style={{ color: "#3D7FD4" }}>
                    FIT ASSESSMENT
                  </h2>
                  <Section label="TASK TYPE">
                    <Answer value={submission.layer3Repetitive} />
                  </Section>
                  <Section label="COMPLIANCE CONCERNS">
                    <Answer value={submission.layer3Compliance} />
                  </Section>
                  {submission.layer3ComplianceDetail && (
                    <Section label="COMPLIANCE DETAIL">
                      <Answer value={submission.layer3ComplianceDetail} />
                    </Section>
                  )}
                  <Section label="DATA AVAILABILITY">
                    <Answer value={submission.layer3Data} />
                  </Section>
                </Card>

                {/* Additional notes */}
                {submission.additionalNotes && (
                  <Card>
                    <h2 className="font-sans font-bold text-[12px] tracking-widest mb-4" style={{ color: "#3D7FD4" }}>
                      ADDITIONAL NOTES
                    </h2>
                    <p className="font-sans text-[14px] leading-relaxed">
                      {submission.additionalNotes}
                    </p>
                  </Card>
                )}

                {/* Prepared prompt */}
                <Card>
                  <h2 className="font-sans font-bold text-[12px] tracking-widest mb-4" style={{ color: "#3D7FD4" }}>
                    PREPARED PROMPT
                  </h2>
                  {submission.renderedPrompt ? (
                    <pre
                      className="font-sans text-[12.5px] leading-relaxed whitespace-pre-wrap"
                      style={{ color: "#BCE5FF", fontFamily: "monospace" }}
                    >
                      {submission.renderedPrompt}
                    </pre>
                  ) : (
                    <p className="font-sans text-[14px]" style={{ color: "#4A6A8A" }}>
                      No prompt generated.
                    </p>
                  )}
                </Card>
              </>
            )}
          </div>

          {/* Right — notes + delete */}
          <div className="space-y-4">
            {submission && (
              <Card>
                <AdminNotesEditor
                  submissionId={submission.id}
                  currentNotes={submission.adminNotes}
                />
              </Card>
            )}

            <Card>
              <DeleteAccountButton userId={user.id} />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
