import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getAllUsers } from "@/lib/users";
import { getAllSubmissions } from "@/lib/submissions";

export const metadata: Metadata = { title: "Admin | Moore Solutions" };

function requireAdmin(email: string | null | undefined): void {
  if (!email || email !== process.env.ADMIN_EMAIL) redirect("/signin");
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  const color = verified ? "#2ea043" : "#FBBC05";
  const bg = verified ? "rgba(46,160,67,0.1)" : "rgba(251,188,5,0.1)";
  return (
    <span
      className="font-sans text-[10px] tracking-widest px-2 py-0.5"
      style={{ color, backgroundColor: bg, border: `0.8px solid ${color}`, borderRadius: "3px" }}
    >
      {verified ? "VERIFIED" : "UNVERIFIED"}
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

  const users = getAllUsers();
  const submissions = getAllSubmissions();
  const submissionByUserId = new Map(submissions.map((s) => [s.userId, s]));

  const total     = users.length;
  const verified  = users.filter((u) => u.emailVerified).length;
  const submitted = submissions.length;

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "TOTAL USERS",            value: total,     color: "#89D4FF" },
            { label: "VERIFIED",                value: verified,  color: "#2ea043" },
            { label: "SUBMITTED QUESTIONNAIRE", value: submitted, color: "#FBBC05" },
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

        {/* Users table */}
        <div style={{ backgroundColor: "#071525", border: "0.8px solid #162D5A", borderRadius: "4px" }}>
          <div className="px-6 py-4" style={{ borderBottom: "0.8px solid #162D5A" }}>
            <h2 className="font-sans font-bold text-[14px] tracking-widest" style={{ color: "#EEF6FF" }}>
              USERS
            </h2>
          </div>

          {users.length === 0 ? (
            <p className="px-6 py-10 font-sans text-[14px]">
              No users yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "0.8px solid #162D5A" }}>
                    {["NAME", "EMAIL", "VERIFIED", "SIGNED UP", "BUSINESS", "SUBMITTED", ""].map((h) => (
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
                  {users.map((u, i) => {
                    const submission = submissionByUserId.get(u.id);
                    return (
                      <tr
                        key={u.id}
                        style={{ borderBottom: i < users.length - 1 ? "0.8px solid #0E1F3A" : "none" }}
                      >
                        <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#EEF6FF", whiteSpace: "nowrap" }}>
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#80AEE0" }}>
                          {u.email}
                        </td>
                        <td className="px-6 py-4">
                          <VerifiedBadge verified={u.emailVerified} />
                        </td>
                        <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#5B90C8", whiteSpace: "nowrap" }}>
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#80AEE0", maxWidth: "180px" }}>
                          <span className="block truncate">{submission?.businessType ?? "—"}</span>
                        </td>
                        <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#5B90C8", whiteSpace: "nowrap" }}>
                          {submission ? formatDate(submission.submittedAt) : "Not yet"}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="font-sans text-[12px] tracking-widest transition-colors duration-150"
                            style={{ color: "#89D4FF" }}
                          >
                            VIEW →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
