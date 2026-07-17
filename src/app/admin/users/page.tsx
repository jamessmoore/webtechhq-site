import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getAllUsers } from "@/lib/users";
import { getAllSubmissions } from "@/lib/submissions";
import {
  getAdminUsersView,
  ADMIN_USERS_PAGE_SIZES,
  type AdminUsersSortColumn,
  type AdminUsersFilter,
} from "@/lib/adminUsersView";

export const metadata: Metadata = { title: "Users | Admin | Moore Solutions" };

const HOVER_GLOW =
  "transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)]";

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

const COLUMNS: { key: AdminUsersSortColumn; label: string }[] = [
  { key: "name", label: "NAME" },
  { key: "email", label: "EMAIL" },
  { key: "verified", label: "VERIFIED" },
  { key: "signedUp", label: "SIGNED UP" },
];

const FILTER_LABELS: Record<Exclude<AdminUsersFilter, null>, string> = {
  verified: "VERIFIED",
  submitted: "SUBMITTED",
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function buildHref(query: {
  sort: string;
  order: string;
  page: number;
  pageSize: number;
  filter: AdminUsersFilter;
}): string {
  const sp = new URLSearchParams();
  sp.set("sort", query.sort);
  sp.set("order", query.order);
  sp.set("page", String(query.page));
  sp.set("pageSize", String(query.pageSize));
  if (query.filter) sp.set("filter", query.filter);
  return `/admin/users?${sp.toString()}`;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  requireAdmin(session?.user?.email);

  const params = await searchParams;

  const allUsers = getAllUsers();
  const submittedUserIds = new Set(getAllSubmissions().map((s) => s.userId));

  const view = getAdminUsersView(allUsers, submittedUserIds, {
    sort: first(params.sort),
    order: first(params.order),
    page: first(params.page),
    pageSize: first(params.pageSize),
    filter: first(params.filter),
  });

  const prevHref = view.page > 1
    ? buildHref({ sort: view.sort, order: view.order, page: view.page - 1, pageSize: view.pageSize, filter: view.filter })
    : null;
  const nextHref = view.page < view.totalPages
    ? buildHref({ sort: view.sort, order: view.order, page: view.page + 1, pageSize: view.pageSize, filter: view.filter })
    : null;
  const clearFilterHref = buildHref({ sort: view.sort, order: view.order, page: 1, pageSize: view.pageSize, filter: null });

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

        {/* Users table */}
        <div style={{ backgroundColor: "#071525", border: "0.8px solid #162D5A", borderRadius: "4px" }}>
          <div
            className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
            style={{ borderBottom: "0.8px solid #162D5A" }}
          >
            <div className="flex items-center gap-3">
              <h2 className="font-sans font-bold text-[14px] tracking-widest" style={{ color: "#EEF6FF" }}>
                USERS
              </h2>
              {view.filter && (
                <span className="flex items-center gap-2">
                  <span
                    className="font-sans text-[10px] tracking-widest px-2 py-0.5"
                    style={{ color: "#89D4FF", backgroundColor: "rgba(61,127,212,0.15)", border: "0.8px solid #3D7FD4", borderRadius: "3px" }}
                  >
                    SHOWING: {FILTER_LABELS[view.filter]}
                  </span>
                  <Link
                    href={clearFilterHref}
                    className={`font-sans text-[11px] tracking-widest ${HOVER_GLOW}`}
                    style={{ color: "#5B90C8" }}
                  >
                    CLEAR ×
                  </Link>
                </span>
              )}
            </div>

            {/* Pagination controls */}
            <div className="flex flex-wrap items-center gap-4">
              <span
                className="font-sans text-[10px] tracking-widest px-2 py-0.5"
                style={{ color: "#89D4FF", backgroundColor: "rgba(61,127,212,0.15)", border: "0.8px solid #3D7FD4", borderRadius: "3px" }}
              >
                PAGE {view.page} OF {view.totalPages}
              </span>

              <div className="flex items-center gap-2">
                {prevHref ? (
                  <Link
                    href={prevHref}
                    className={`font-sans text-[11px] tracking-widest px-2 py-1 rounded-[6px] ${HOVER_GLOW}`}
                    style={{ color: "#89D4FF" }}
                  >
                    ← PREV
                  </Link>
                ) : (
                  <span
                    className="font-sans text-[11px] tracking-widest px-2 py-1 rounded-[6px]"
                    style={{ color: "#3D5578" }}
                  >
                    ← PREV
                  </span>
                )}
                {nextHref ? (
                  <Link
                    href={nextHref}
                    className={`font-sans text-[11px] tracking-widest px-2 py-1 rounded-[6px] ${HOVER_GLOW}`}
                    style={{ color: "#89D4FF" }}
                  >
                    NEXT →
                  </Link>
                ) : (
                  <span
                    className="font-sans text-[11px] tracking-widest px-2 py-1 rounded-[6px]"
                    style={{ color: "#3D5578" }}
                  >
                    NEXT →
                  </span>
                )}
              </div>

              <form action="/admin/users" method="GET" className="flex items-center gap-2">
                <input type="hidden" name="sort" value={view.sort} />
                <input type="hidden" name="order" value={view.order} />
                {view.filter && <input type="hidden" name="filter" value={view.filter} />}
                <label htmlFor="pageSize" className="font-sans text-[10px] tracking-widest" style={{ color: "#5B90C8" }}>
                  ROWS
                </label>
                <select
                  id="pageSize"
                  name="pageSize"
                  defaultValue={String(view.pageSize)}
                  className="font-sans text-[13px] px-2 py-1 focus:outline-none focus:[border-color:#3D7FD4]"
                  style={{ backgroundColor: "#071525", border: "0.8px solid rgba(255,255,255,0.4)", borderRadius: "2px", color: "#EEF6FF" }}
                >
                  {ADMIN_USERS_PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className={`font-sans text-[11px] tracking-widest px-3 py-1 rounded-[6px] ${HOVER_GLOW}`}
                  style={{ color: "#89D4FF", border: "0.8px solid #3D7FD4" }}
                >
                  GO
                </button>
              </form>
            </div>
          </div>

          {view.users.length === 0 ? (
            <p className="px-6 py-10 font-sans text-[14px]">
              No users yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "0.8px solid #162D5A" }}>
                    {COLUMNS.map((col) => {
                      const isActive = view.sort === col.key;
                      const nextOrder = isActive && view.order === "asc" ? "desc" : "asc";
                      const href = buildHref({ sort: col.key, order: nextOrder, page: 1, pageSize: view.pageSize, filter: view.filter });
                      return (
                        <th key={col.key} className="px-6 py-3 text-left">
                          <Link
                            href={href}
                            className={`inline-flex items-center gap-1 font-sans text-[10px] tracking-widest px-1.5 py-0.5 rounded-[6px] ${HOVER_GLOW}`}
                            style={{ color: "#5B90C8" }}
                          >
                            {col.label}
                            {isActive && <span>{view.order === "asc" ? "▲" : "▼"}</span>}
                          </Link>
                        </th>
                      );
                    })}
                    <th className="px-6 py-3 text-left" />
                  </tr>
                </thead>
                <tbody>
                  {view.users.map((u, i) => (
                    <tr
                      key={u.id}
                      style={{ borderBottom: i < view.users.length - 1 ? "0.8px solid #0E1F3A" : "none" }}
                    >
                      <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#EEF6FF", whiteSpace: "nowrap" }}>
                        {u.firstName}{u.lastName ? ` ${u.lastName}` : ""}
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
