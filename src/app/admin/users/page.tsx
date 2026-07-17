import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getAllUsers } from "@/lib/users";
import { getAllSubmissions } from "@/lib/submissions";
import {
  getAdminUsersView,
  formatSignedUpDate,
  ADMIN_USERS_PAGE_SIZES,
  ADMIN_USERS_SORT_COLUMNS,
  type AdminUsersSortColumn,
  type AdminUsersFilter,
  type AdminUsersSearch,
} from "@/lib/adminUsersView";
import { isValidEmailFormat } from "@/lib/emailFormat";

export const metadata: Metadata = { title: "Users | Admin | Moore Solutions" };

const HOVER_GLOW =
  "transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)]";

const DEFAULT_SORT: AdminUsersSortColumn = "name";
const DEFAULT_ORDER = "asc";
const EMPTY_SEARCH: AdminUsersSearch = { name: "", email: "", verified: "", signedUp: "" };

const SEARCH_PARAM_NAMES: Record<AdminUsersSortColumn, string> = {
  name: "searchName",
  email: "searchEmail",
  verified: "searchVerified",
  signedUp: "searchSignedUp",
};

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

function SearchIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="20" y1="20" x2="15.5" y2="15.5" />
    </svg>
  );
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
  search: AdminUsersSearch;
}): string {
  const sp = new URLSearchParams();
  sp.set("sort", query.sort);
  sp.set("order", query.order);
  sp.set("page", String(query.page));
  sp.set("pageSize", String(query.pageSize));
  if (query.filter) sp.set("filter", query.filter);
  for (const column of ADMIN_USERS_SORT_COLUMNS) {
    const value = query.search[column];
    if (value) sp.set(SEARCH_PARAM_NAMES[column], value);
  }
  return `/admin/users?${sp.toString()}`;
}

/** Hidden inputs that carry forward every current search value except the column being edited. */
function HiddenSearchInputs({ search, except }: { search: AdminUsersSearch; except?: AdminUsersSortColumn }) {
  return (
    <>
      {ADMIN_USERS_SORT_COLUMNS.filter((c) => c !== except && search[c]).map((c) => (
        <input key={c} type="hidden" name={SEARCH_PARAM_NAMES[c]} value={search[c]} />
      ))}
    </>
  );
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
    searchName: first(params.searchName),
    searchEmail: first(params.searchEmail),
    searchVerified: first(params.searchVerified),
    searchSignedUp: first(params.searchSignedUp),
  });

  const hasActiveSearch = ADMIN_USERS_SORT_COLUMNS.some((c) => view.search[c]);

  const prevHref = view.page > 1
    ? buildHref({ sort: view.sort, order: view.order, page: view.page - 1, pageSize: view.pageSize, filter: view.filter, search: view.search })
    : null;
  const nextHref = view.page < view.totalPages
    ? buildHref({ sort: view.sort, order: view.order, page: view.page + 1, pageSize: view.pageSize, filter: view.filter, search: view.search })
    : null;
  // CLEAR resets everything back to the unfiltered, unsearched, default-sorted list - not just the tile filter.
  const clearHref = buildHref({ sort: DEFAULT_SORT, order: DEFAULT_ORDER, page: 1, pageSize: view.pageSize, filter: null, search: EMPTY_SEARCH });

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
        {/* Users table */}
        <div style={{ backgroundColor: "#071525", border: "0.8px solid #162D5A", borderRadius: "4px" }}>
          <div
            className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
            style={{ borderBottom: "0.8px solid #162D5A" }}
          >
            <div className="flex items-center gap-3">
              <h2 className="font-sans font-bold text-[14px] tracking-widest" style={{ color: "#EEF6FF" }}>
                USERS ({view.totalCount})
              </h2>
              {(view.filter || hasActiveSearch) && (
                <span className="flex items-center gap-2">
                  {view.filter && (
                    <span
                      className="font-sans text-[10px] tracking-widest px-2 py-0.5"
                      style={{ color: "#89D4FF", backgroundColor: "rgba(61,127,212,0.15)", border: "0.8px solid #3D7FD4", borderRadius: "3px" }}
                    >
                      SHOWING: {FILTER_LABELS[view.filter]}
                    </span>
                  )}
                  {hasActiveSearch && (
                    <span
                      className="font-sans text-[10px] tracking-widest px-2 py-0.5"
                      style={{ color: "#89D4FF", backgroundColor: "rgba(61,127,212,0.15)", border: "0.8px solid #3D7FD4", borderRadius: "3px" }}
                    >
                      SEARCH ACTIVE
                    </span>
                  )}
                  <Link
                    href={clearHref}
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
                <HiddenSearchInputs search={view.search} />
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
                      const sortHref = buildHref({ sort: col.key, order: nextOrder, page: 1, pageSize: view.pageSize, filter: view.filter, search: view.search });
                      const searchActive = Boolean(view.search[col.key]);
                      const searchInvalid = view.invalidSearch[col.key];
                      return (
                        <th key={col.key} className="px-6 py-3 text-left" style={{ position: "relative" }}>
                          <div className="flex items-center gap-1">
                            <Link
                              href={sortHref}
                              className={`inline-flex items-center gap-1 font-sans text-[10px] tracking-widest px-1.5 py-0.5 rounded-[6px] ${HOVER_GLOW}`}
                              style={{ color: "#5B90C8" }}
                            >
                              {col.label}
                              {isActive && <span>{view.order === "asc" ? "▲" : "▼"}</span>}
                            </Link>
                            {/*
                              Deliberately not tied to `searchActive`: this is a fresh server
                              render on every GET navigation (including "after a successful
                              search"), so `open={searchActive}` would force the box open on
                              every subsequent page load instead of collapsing back to the icon.
                              Only force it open when the pattern is invalid, so the warning is
                              visible without an extra click; a successful search just leaves the
                              icon highlighted (searchActive) and collapses the input.
                            */}
                            <details open={searchInvalid} style={{ position: "relative" }}>
                              <summary
                                className={`cursor-pointer list-none inline-flex items-center justify-center p-1 rounded-[3px] ${HOVER_GLOW}`}
                                style={{ color: searchActive || searchInvalid ? "#89D4FF" : "#5B90C8" }}
                                aria-label={`Search ${col.label}`}
                              >
                                <SearchIcon />
                              </summary>
                              <form
                                method="GET"
                                action="/admin/users"
                                className="absolute z-20 mt-1 flex flex-col gap-1 p-2"
                                style={{ backgroundColor: "#0B1930", border: "0.8px solid #162D5A", borderRadius: "4px", top: "100%", left: 0 }}
                              >
                                <div className="flex items-center gap-1">
                                  <input type="hidden" name="sort" value={view.sort} />
                                  <input type="hidden" name="order" value={view.order} />
                                  <input type="hidden" name="pageSize" value={view.pageSize} />
                                  <input type="hidden" name="page" value="1" />
                                  {view.filter && <input type="hidden" name="filter" value={view.filter} />}
                                  <HiddenSearchInputs search={view.search} except={col.key} />
                                  <input
                                    type="text"
                                    name={SEARCH_PARAM_NAMES[col.key]}
                                    defaultValue={view.search[col.key]}
                                    placeholder="regex"
                                    className="font-sans text-[12px] px-2 py-1 focus:outline-none focus:[border-color:#3D7FD4] normal-case tracking-normal"
                                    style={{ backgroundColor: "#030B18", border: "0.8px solid rgba(255,255,255,0.4)", borderRadius: "2px", color: "#EEF6FF", width: "120px" }}
                                  />
                                  <button
                                    type="submit"
                                    className={`font-sans text-[10px] tracking-widest px-2 py-1 rounded-[6px] ${HOVER_GLOW}`}
                                    style={{ color: "#89D4FF", border: "0.8px solid #3D7FD4" }}
                                  >
                                    GO
                                  </button>
                                </div>
                                {searchInvalid && (
                                  <p className="font-sans text-[10px] normal-case tracking-normal" style={{ color: "#FBBC05" }}>
                                    Invalid pattern, showing all rows
                                  </p>
                                )}
                              </form>
                            </details>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {view.users.map((u, i) => (
                    <tr
                      key={u.id}
                      className={`cursor-pointer ${HOVER_GLOW}`}
                      style={{
                        position: "relative",
                        borderBottom: i < view.users.length - 1 ? "0.8px solid #0E1F3A" : "none",
                      }}
                    >
                      <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#EEF6FF", whiteSpace: "nowrap" }}>
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="absolute inset-0"
                          style={{ zIndex: 0 }}
                          aria-label={`View ${u.firstName}${u.lastName ? ` ${u.lastName}` : ""}`}
                        />
                        <span>
                          {u.firstName}{u.lastName ? ` ${u.lastName}` : ""}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#80AEE0" }}>
                        {/*
                          Defense in depth, not the only gate: signup validates
                          email shape before storage (src/lib/emailFormat.ts),
                          but a raw `mailto:${u.email}` href must never be
                          trusted to be safe just because storage validated it
                          - a row could pre-date that validation, or reach the
                          DB some other way. Re-check the shape here and fall
                          back to plain (non-link) text for anything that
                          doesn't look like a real address, rather than ever
                          interpolating an unvalidated string into a mailto
                          href a browser will parse.
                        */}
                        {isValidEmailFormat(u.email) ? (
                          <a
                            href={`mailto:${u.email}`}
                            className="transition-colors"
                            style={{ position: "relative", zIndex: 1, color: "#80AEE0" }}
                          >
                            {u.email}
                          </a>
                        ) : (
                          // No positioning/z-index here (unlike the mailto
                          // link above): this cell isn't capturing clicks for
                          // its own link anymore, so let the row's
                          // stretched-link click-through behave the same as
                          // any other non-interactive cell (e.g. NAME).
                          <span>{u.email}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <VerifiedBadge verified={u.emailVerified} />
                      </td>
                      <td className="px-6 py-4 font-sans text-[13px]" style={{ color: "#5B90C8", whiteSpace: "nowrap" }}>
                        {formatSignedUpDate(u.createdAt)}
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
