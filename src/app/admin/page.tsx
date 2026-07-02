import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getAllSubmissions } from "@/lib/submissions";
import type { ApprovalStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Admin | Moore Solutions" };

function requireAdmin(email: string | null | undefined): void {
  if (!email || email !== process.env.ADMIN_EMAIL) redirect("/signin");
}

const STATUS_BADGE: Record<ApprovalStatus, { label: string; color: string; bg: string }> = {
  pending_review: { label: "PENDING",  color: "#FBBC05", bg: "rgba(251,188,5,0.1)" },
  approved:       { label: "APPROVED", color: "#2ea043", bg: "rgba(46,160,67,0.1)" },
  rejected:       { label: "REJECTED", color: "#E0556F", bg: "rgba(224,85,111,0.1)" },
};

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const { label, color, bg } = STATUS_BADGE[status];
  return (
    <span
      className="font-sans text-[10px] tracking-widest px-2 py-0.5"
      style={{ color, backgroundColor: bg, border: `0.8px solid ${color}`, borderRadius: "3px" }}
    >
      {label}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default async function AdminPage() {
  const session = await auth();
  requireAdmin(session?.user?.email);

  const submissions = getAllSubmissions();
  const total    = submissions.length;
  const pending  = submissions.filter((s) => s.approvalStatus === "pending_review").length;
  const approved = submissions.filter((s) => s.approvalStatus === "approved").length;
  const rejected = submissions.filter((s) => s.approvalStatus === "rejected").length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#030B18" }}>
      {/* Admin header */}
      <header
        className="flex items-center justify-between px-8 py-4"
        style={{ borderBottom: "0.8px solid #162D5A", backgroundColor: "#040C1C" }}
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="font-sans font-black text-[18px]" style={{ color: "#EEF6FF" }}>
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

      <main className="px-8 py-8 max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "TOTAL",    value: total,    color: "#89D4FF" },
            { label: "PENDING",  value: pending,  color: "#FBBC05" },
            { label: "APPROVED", value: approved, color: "#2ea043" },
            { label: "REJECTED", value: rejected, color: "#E0556F" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="p-5"
              style={{ backgroundColor: "#071525", border: "0.8px solid #162D5A", borderRadius: "4px" }}
            >
              <p className="font-sans text-[10px] tracking-widest mb-1">{label}</p>
              <p className="font-sans font-black text-[32px] leading-none" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Submissions table */}
        <div style={{ backgroundColor: "#071525", border: "0.8px solid #162D5A", borderRadius: "4px" }}>
          <div className="px-6 py-4" style={{ borderBottom: "0.8px solid #162D5A" }}>
            <h2 className="font-sans font-bold text-[14px] tracking-widest" style={{ color: "#EEF6FF" }}>
              SUBMISSIONS
            </h2>
          </div>

          {submissions.length === 0 ? (
            <p className="px-6 py-10 font-sans text-[14px]">
              No submissions yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "0.8px solid #162D5A" }}>
                    {["NAME", "EMAIL", "BUSINESS", "TEAM", "STATUS", "SUBMITTED", ""].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left font-sans text-[10px] tracking-widest"
                        style={{ color: "#5B90C8" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s, i) => (
                    <tr
                      key={s.id}
                      style={{ borderBottom: i < submissions.length - 1 ? "0.8px solid #0E1F3A" : "none" }}
                    >
                      <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#EEF6FF", whiteSpace: "nowrap" }}>
                        {s.user.firstName} {s.user.lastName}
                      </td>
                      <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#80AEE0" }}>
                        {s.user.email}
                      </td>
                      <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#80AEE0", maxWidth: "180px" }}>
                        <span className="block truncate">{s.businessType ?? "—"}</span>
                      </td>
                      <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#80AEE0", whiteSpace: "nowrap" }}>
                        {s.teamSize ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={s.approvalStatus} />
                      </td>
                      <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#5B90C8", whiteSpace: "nowrap" }}>
                        {formatDate(s.submittedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/submissions/${s.id}`}
                          className="font-sans text-[12px] tracking-widest transition-colors duration-150"
                          style={{ color: "#89D4FF" }}
                        >
                          REVIEW →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
