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

export default async function AdminPage() {
  const session = await auth();
  requireAdmin(session?.user?.email);

  const users = getAllUsers();
  const submissions = getAllSubmissions();

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
            { label: "TOTAL USERS",            value: total,     color: "#89D4FF", href: "/admin/users" },
            { label: "VERIFIED",                value: verified,  color: "#2ea043", href: "/admin/users?filter=verified" },
            { label: "SUBMITTED QUESTIONNAIRE", value: submitted, color: "#FBBC05", href: "/admin/users?filter=submitted" },
          ].map(({ label, value, color, href }) => (
            <Link
              key={label}
              href={href}
              className="block p-5 transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)]"
              style={{ backgroundColor: "#071525", border: "0.8px solid #162D5A", borderRadius: "4px" }}
            >
              <p className="font-sans text-[10px] tracking-widest mb-1">{label}</p>
              <p className="font-sans font-black text-[32px] leading-none" style={{ color }}>{value}</p>
            </Link>
          ))}
        </div>

        {/* Sections */}
        <Link
          href="/admin/users"
          className="flex items-center justify-between p-6 transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)]"
          style={{ backgroundColor: "#071525", border: "0.8px solid #162D5A", borderRadius: "4px" }}
        >
          <div>
            <h2 className="font-sans font-bold text-[14px] tracking-widest mb-1" style={{ color: "#EEF6FF" }}>
              USERS
            </h2>
            <p className="font-sans text-[13px]" style={{ color: "#80AEE0" }}>
              View sign-ups, questionnaire submissions, and prepared prompts. Delete accounts.
            </p>
          </div>
          <span className="font-sans text-[12px] tracking-widest" style={{ color: "#89D4FF" }}>
            VIEW →
          </span>
        </Link>
      </main>
    </div>
  );
}
