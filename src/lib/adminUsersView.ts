import type { User } from "./types";

export type AdminUsersSortColumn = "name" | "email" | "verified" | "signedUp";
export type SortOrder = "asc" | "desc";
export type AdminUsersFilter = "verified" | "submitted" | null;

export const ADMIN_USERS_SORT_COLUMNS: readonly AdminUsersSortColumn[] = [
  "name",
  "email",
  "verified",
  "signedUp",
];

export const ADMIN_USERS_PAGE_SIZES = [10, 100, 500] as const;

const DEFAULT_SORT: AdminUsersSortColumn = "name";
const DEFAULT_ORDER: SortOrder = "asc";
const DEFAULT_PAGE_SIZE: (typeof ADMIN_USERS_PAGE_SIZES)[number] = 10;

export interface AdminUsersViewParams {
  sort?: string | null;
  order?: string | null;
  page?: string | number | null;
  pageSize?: string | number | null;
  filter?: string | null;
}

export interface AdminUsersViewResult {
  users: User[];
  sort: AdminUsersSortColumn;
  order: SortOrder;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  filter: AdminUsersFilter;
}

function isSortColumn(value: unknown): value is AdminUsersSortColumn {
  return typeof value === "string" && (ADMIN_USERS_SORT_COLUMNS as readonly string[]).includes(value);
}

function normalizeOrder(value: unknown): SortOrder {
  return value === "desc" ? "desc" : DEFAULT_ORDER;
}

function normalizeFilter(value: unknown): AdminUsersFilter {
  return value === "verified" || value === "submitted" ? value : null;
}

function normalizePageSize(value: AdminUsersViewParams["pageSize"]): number {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : value;
  return (ADMIN_USERS_PAGE_SIZES as readonly number[]).includes(n as number)
    ? (n as number)
    : DEFAULT_PAGE_SIZE;
}

function normalizePage(value: AdminUsersViewParams["page"]): number {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : value;
  return Number.isFinite(n) && (n as number) >= 1 ? Math.floor(n as number) : 1;
}

function fullName(u: User): string {
  return `${u.firstName}${u.lastName ? ` ${u.lastName}` : ""}`.toLowerCase();
}

function sortValue(u: User, sort: AdminUsersSortColumn): string | boolean {
  switch (sort) {
    case "name":
      return fullName(u);
    case "email":
      return u.email.toLowerCase();
    case "verified":
      return u.emailVerified;
    case "signedUp":
      return u.createdAt;
  }
}

/** Unverified (false) sorts before verified (true) when ascending. */
function compareUsers(a: User, b: User, sort: AdminUsersSortColumn, order: SortOrder): number {
  const av = sortValue(a, sort);
  const bv = sortValue(b, sort);

  let result: number;
  if (typeof av === "boolean" && typeof bv === "boolean") {
    result = av === bv ? 0 : av ? 1 : -1;
  } else {
    result = av < bv ? -1 : av > bv ? 1 : 0;
  }

  return order === "asc" ? result : -result;
}

/**
 * Filters, sorts, and paginates the admin users table in a single pass.
 * `submittedUserIds` is the set of user ids that have a questionnaire
 * submission on file - used only when `filter === "submitted"`.
 */
export function getAdminUsersView(
  allUsers: User[],
  submittedUserIds: ReadonlySet<string>,
  params: AdminUsersViewParams,
): AdminUsersViewResult {
  const sort = isSortColumn(params.sort) ? params.sort : DEFAULT_SORT;
  const order = normalizeOrder(params.order);
  const pageSize = normalizePageSize(params.pageSize);
  const filter = normalizeFilter(params.filter);

  const filtered = allUsers.filter((u) => {
    if (filter === "verified") return u.emailVerified;
    if (filter === "submitted") return submittedUserIds.has(u.id);
    return true;
  });

  const sorted = [...filtered].sort((a, b) => compareUsers(a, b, sort, order));

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(normalizePage(params.page), totalPages);

  const start = (page - 1) * pageSize;
  const users = sorted.slice(start, start + pageSize);

  return { users, sort, order, page, pageSize, totalCount, totalPages, filter };
}
