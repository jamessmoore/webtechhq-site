import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import { getPurchasesByUser } from "@/lib/purchases";
import { getAllMoveForwardRequests } from "@/lib/moveForwardRequests";
import AdminQueueStatusControl from "@/components/AdminQueueStatusControl";

export const metadata: Metadata = { title: "Move Forward Queue | Admin | Moore Solutions" };

function requireAdmin(email: string | null | undefined): void {
  if (!email || email !== process.env.ADMIN_EMAIL) redirect("/signin");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminQueuePage() {
  const session = await auth();
  requireAdmin(session?.user?.email);

  const requests = getAllMoveForwardRequests();
  const rows = requests.map((r) => {
    const user = getUserById(r.userId);
    const businessName = getPurchasesByUser(r.userId).find((p) => p.productId === "business_audit")?.businessName;
    return { request: r, user, businessName };
  });

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

      <main className="px-8 py-8 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/admin" className="font-sans text-[12px] transition-colors" style={{ color: "#5B90C8" }}>
            ← Admin home
          </Link>
        </div>

        <div style={{ backgroundColor: "#071525", border: "0.8px solid #162D5A", borderRadius: "4px" }}>
          <div
            className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
            style={{ borderBottom: "0.8px solid #162D5A" }}
          >
            <h2 className="font-sans font-bold text-[14px] tracking-widest" style={{ color: "#EEF6FF" }}>
              MOVE FORWARD QUEUE ({rows.length})
            </h2>
          </div>

          {rows.length === 0 ? (
            <p className="px-6 py-10 font-sans text-[14px]">
              No one has asked to move forward yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "0.8px solid #162D5A" }}>
                    {["NAME", "EMAIL", "BUSINESS", "STATUS", "REQUESTED"].map((h) => (
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
                  {rows.map(({ request, user, businessName }, i) => (
                    <tr
                      key={request.id}
                      style={{ borderBottom: i < rows.length - 1 ? "0.8px solid #0E1F3A" : "none" }}
                    >
                      <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#EEF6FF", whiteSpace: "nowrap" }}>
                        {user ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}` : "Unknown user"}
                      </td>
                      <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#80AEE0" }}>
                        {user?.email ?? "-"}
                      </td>
                      <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#80AEE0" }}>
                        {businessName ?? <span style={{ color: "#4A6A8A" }}>Not provided</span>}
                      </td>
                      <td className="px-6 py-4">
                        <AdminQueueStatusControl requestId={request.id} currentStatus={request.status} />
                      </td>
                      <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#5B90C8", whiteSpace: "nowrap" }}>
                        {formatDate(request.createdAt)}
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
