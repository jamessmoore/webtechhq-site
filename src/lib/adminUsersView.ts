import * as vm from "node:vm";
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

/** Per-column free-text (regex) search values, keyed by the same column ids used for sorting. */
export type AdminUsersSearch = Record<AdminUsersSortColumn, string>;
/** Per-column flag for "search text present but failed to compile as a regex". */
export type AdminUsersInvalidSearch = Record<AdminUsersSortColumn, boolean>;

const NO_INVALID_SEARCH: AdminUsersInvalidSearch = {
  name: false,
  email: false,
  verified: false,
  signedUp: false,
};

/**
 * Soft cap on search pattern length. This is defense in depth only, NOT the
 * ReDoS fix: catastrophic-backtracking regex shapes are short (`(a+)+$` is 6
 * chars), so a pattern-length cap does nothing to bound the actual blowup,
 * which depends on the length/shape of the *haystack* (firstName/lastName/
 * email), not the pattern. See `safeRegexTest` below for the real fix.
 */
const MAX_SEARCH_PATTERN_LENGTH = 100;

/**
 * Hard wall-clock budget for a single regex match. Chosen to be well above
 * any legitimate match (sub-millisecond in practice) but far below anything
 * a human waiting on a page load would tolerate, so a worst-case pattern hits
 * this ceiling on every row rather than compounding into a multi-minute
 * stall.
 */
const SEARCH_MATCH_TIMEOUT_MS = 50;

/**
 * Reused vm context/script for `safeRegexTest`. Created once at module load
 * so per-match overhead is just a property assignment + `runInContext` call,
 * not a fresh context/script compile on every row.
 */
interface RegexTestSandbox {
  regex: RegExp | null;
  haystack: string;
}
const regexTestSandbox: RegexTestSandbox = { regex: null, haystack: "" };
const regexTestContext = vm.createContext(regexTestSandbox);
const regexTestScript = new vm.Script("regex.test(haystack)");

/**
 * Tests `regex` against `haystack` with a hard timeout, so a
 * catastrophic-backtracking pattern (still valid regex syntax - not caught
 * by the try/catch in `compileColumnRegexes`, which only catches
 * SyntaxErrors at *compile* time) can't stall the single-threaded Node
 * process regardless of how long the match itself runs. Runs the test
 * inside a `vm` context specifically because `Script#runInContext`'s
 * `timeout` option can forcibly terminate synchronous JS mid-execution
 * (verified against Argus's exact repro: `(a+)+$` against a 35-char
 * haystack, which hangs for 150+ seconds with a plain `regex.test()` call,
 * returns in ~50ms here) - a plain try/catch around `regex.test()` cannot do
 * this, since nothing throws until the (possibly minutes-long) synchronous
 * call returns.
 *
 * A timed-out (or otherwise erroring) test is treated as "no match": the
 * row is safely excluded from the result set rather than the request
 * hanging or 500ing.
 */
function safeRegexTest(regex: RegExp, haystack: string): boolean {
  regexTestSandbox.regex = regex;
  regexTestSandbox.haystack = haystack;
  try {
    return Boolean(regexTestScript.runInContext(regexTestContext, { timeout: SEARCH_MATCH_TIMEOUT_MS }));
  } catch {
    return false;
  }
}

export interface AdminUsersViewParams {
  sort?: string | null;
  order?: string | null;
  page?: string | number | null;
  pageSize?: string | number | null;
  filter?: string | null;
  searchName?: string | null;
  searchEmail?: string | null;
  searchVerified?: string | null;
  searchSignedUp?: string | null;
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
  /** The (trimmed) per-column search patterns actually applied, for echoing back into the search inputs. */
  search: AdminUsersSearch;
  /** Which columns had a non-empty search pattern that failed to compile as a regex. */
  invalidSearch: AdminUsersInvalidSearch;
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

function normalizeSearchValue(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSearch(params: AdminUsersViewParams): AdminUsersSearch {
  return {
    name: normalizeSearchValue(params.searchName),
    email: normalizeSearchValue(params.searchEmail),
    verified: normalizeSearchValue(params.searchVerified),
    signedUp: normalizeSearchValue(params.searchSignedUp),
  };
}

function fullName(u: User): string {
  return `${u.firstName}${u.lastName ? ` ${u.lastName}` : ""}`.toLowerCase();
}

/** Formats a signup timestamp exactly as rendered in the SIGNED UP column, so regex search matches what's on screen. */
export function formatSignedUpDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** The literal on-screen string for each searchable column, used for regex matching. */
function fieldTextForColumn(u: User, column: AdminUsersSortColumn): string {
  switch (column) {
    case "name":
      return `${u.firstName}${u.lastName ? ` ${u.lastName}` : ""}`;
    case "email":
      return u.email;
    case "verified":
      return u.emailVerified ? "VERIFIED" : "UNVERIFIED";
    case "signedUp":
      return formatSignedUpDate(u.createdAt);
  }
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
 * Compiles each column's search pattern into a case-insensitive RegExp.
 * A pattern that fails to compile, or exceeds MAX_SEARCH_PATTERN_LENGTH, is
 * reported as invalid and treated as an inactive filter (excludes no rows)
 * rather than throwing or being compiled/matched at all.
 */
function compileColumnRegexes(
  search: AdminUsersSearch,
): { regexes: Partial<Record<AdminUsersSortColumn, RegExp>>; invalid: AdminUsersInvalidSearch } {
  const regexes: Partial<Record<AdminUsersSortColumn, RegExp>> = {};
  const invalid: AdminUsersInvalidSearch = { ...NO_INVALID_SEARCH };

  for (const column of ADMIN_USERS_SORT_COLUMNS) {
    const pattern = search[column];
    if (!pattern) continue;
    if (pattern.length > MAX_SEARCH_PATTERN_LENGTH) {
      invalid[column] = true;
      continue;
    }
    try {
      regexes[column] = new RegExp(pattern, "i");
    } catch {
      invalid[column] = true;
    }
  }

  return { regexes, invalid };
}

/**
 * Filters, sorts, and paginates the admin users table in a single pipeline.
 * `submittedUserIds` is the set of user ids that have a questionnaire
 * submission on file - used only when `filter === "submitted"`.
 *
 * Filtering combines (AND) the dashboard-tile `filter` with every active
 * per-column regex search in `search*` params.
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
  const search = normalizeSearch(params);
  const { regexes, invalid } = compileColumnRegexes(search);

  const filtered = allUsers.filter((u) => {
    if (filter === "verified" && !u.emailVerified) return false;
    if (filter === "submitted" && !submittedUserIds.has(u.id)) return false;

    for (const column of ADMIN_USERS_SORT_COLUMNS) {
      const regex = regexes[column];
      if (!regex) continue; // no pattern, or pattern failed to compile: inactive
      if (!safeRegexTest(regex, fieldTextForColumn(u, column))) return false;
    }

    return true;
  });

  const sorted = [...filtered].sort((a, b) => compareUsers(a, b, sort, order));

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(normalizePage(params.page), totalPages);

  const start = (page - 1) * pageSize;
  const users = sorted.slice(start, start + pageSize);

  return {
    users,
    sort,
    order,
    page,
    pageSize,
    totalCount,
    totalPages,
    filter,
    search,
    invalidSearch: invalid,
  };
}
