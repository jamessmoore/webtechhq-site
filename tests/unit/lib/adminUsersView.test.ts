import { describe, it, expect } from "vitest";
import { getAdminUsersView, formatSignedUpDate } from "@/lib/adminUsersView";
import type { User } from "@/lib/types";

function makeUser(overrides: Partial<User> & { id: string }): User {
  return {
    firstName: "First",
    lastName: "Last",
    email: `${overrides.id}@example.com`,
    emailVerified: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const noSubmissions = new Set<string>();

describe("getAdminUsersView - sorting", () => {
  const users: User[] = [
    makeUser({ id: "1", firstName: "Charlie", lastName: "Brown", email: "charlie@example.com", emailVerified: true, createdAt: "2026-01-03T00:00:00.000Z" }),
    makeUser({ id: "2", firstName: "alice", lastName: "Adams", email: "Alice@example.com", emailVerified: false, createdAt: "2026-01-01T00:00:00.000Z" }),
    makeUser({ id: "3", firstName: "Bob", lastName: "Zephyr", email: "bob@example.com", emailVerified: true, createdAt: "2026-01-02T00:00:00.000Z" }),
  ];

  it("defaults to NAME ascending when no params are given", () => {
    const result = getAdminUsersView(users, noSubmissions, {});
    expect(result.sort).toBe("name");
    expect(result.order).toBe("asc");
    expect(result.users.map((u) => u.id)).toEqual(["2", "3", "1"]); // alice, bob, charlie
  });

  it("sorts by name case-insensitively, concatenating first + last", () => {
    const result = getAdminUsersView(users, noSubmissions, { sort: "name", order: "asc" });
    expect(result.users.map((u) => u.id)).toEqual(["2", "3", "1"]);
  });

  it("sorts by name descending", () => {
    const result = getAdminUsersView(users, noSubmissions, { sort: "name", order: "desc" });
    expect(result.users.map((u) => u.id)).toEqual(["1", "3", "2"]);
  });

  it("sorts by email case-insensitively", () => {
    const result = getAdminUsersView(users, noSubmissions, { sort: "email", order: "asc" });
    expect(result.users.map((u) => u.id)).toEqual(["2", "3", "1"]); // alice, bob, charlie
  });

  it("sorts by verified boolean, unverified first ascending", () => {
    const result = getAdminUsersView(users, noSubmissions, { sort: "verified", order: "asc" });
    expect(result.users[0].id).toBe("2"); // unverified
    expect(result.users.slice(1).map((u) => u.id).sort()).toEqual(["1", "3"]);
  });

  it("sorts by verified boolean descending", () => {
    const result = getAdminUsersView(users, noSubmissions, { sort: "verified", order: "desc" });
    expect(result.users[result.users.length - 1].id).toBe("2"); // unverified last
  });

  it("sorts by signedUp (createdAt)", () => {
    const asc = getAdminUsersView(users, noSubmissions, { sort: "signedUp", order: "asc" });
    expect(asc.users.map((u) => u.id)).toEqual(["2", "3", "1"]);

    const desc = getAdminUsersView(users, noSubmissions, { sort: "signedUp", order: "desc" });
    expect(desc.users.map((u) => u.id)).toEqual(["1", "3", "2"]);
  });

  it("falls back to defaults for an unknown sort column or order value", () => {
    const result = getAdminUsersView(users, noSubmissions, { sort: "bogus", order: "sideways" });
    expect(result.sort).toBe("name");
    expect(result.order).toBe("asc");
  });
});

describe("getAdminUsersView - filtering", () => {
  const users: User[] = [
    makeUser({ id: "1", firstName: "Ann", emailVerified: true }),
    makeUser({ id: "2", firstName: "Ben", emailVerified: false }),
    makeUser({ id: "3", firstName: "Cid", emailVerified: true }),
  ];
  const submittedUserIds = new Set(["2", "3"]);

  it("returns all users when no filter is given", () => {
    const result = getAdminUsersView(users, submittedUserIds, {});
    expect(result.filter).toBeNull();
    expect(result.totalCount).toBe(3);
  });

  it("filters to only verified users", () => {
    const result = getAdminUsersView(users, submittedUserIds, { filter: "verified" });
    expect(result.filter).toBe("verified");
    expect(result.users.map((u) => u.id).sort()).toEqual(["1", "3"]);
    expect(result.totalCount).toBe(2);
  });

  it("filters to only users with a submission", () => {
    const result = getAdminUsersView(users, submittedUserIds, { filter: "submitted" });
    expect(result.filter).toBe("submitted");
    expect(result.users.map((u) => u.id).sort()).toEqual(["2", "3"]);
    expect(result.totalCount).toBe(2);
  });

  it("ignores an unrecognized filter value", () => {
    const result = getAdminUsersView(users, submittedUserIds, { filter: "bogus" });
    expect(result.filter).toBeNull();
    expect(result.totalCount).toBe(3);
  });

  it("computes totalPages/page against the filtered set, not the full list", () => {
    const result = getAdminUsersView(users, submittedUserIds, { filter: "verified", pageSize: 10 });
    expect(result.totalCount).toBe(2);
    expect(result.totalPages).toBe(1);
    expect(result.page).toBe(1);
  });
});

describe("getAdminUsersView - pagination", () => {
  function buildUsers(count: number): User[] {
    return Array.from({ length: count }, (_, i) =>
      makeUser({
        id: String(i).padStart(3, "0"),
        firstName: `User${i}`,
        createdAt: `2026-01-01T00:${String(i).padStart(2, "0")}:00.000Z`,
      }),
    );
  }

  it("defaults to page 1 with page size 10", () => {
    const result = getAdminUsersView(buildUsers(25), noSubmissions, {});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.users).toHaveLength(10);
    expect(result.totalPages).toBe(3);
    expect(result.totalCount).toBe(25);
  });

  it("slices the correct page", () => {
    const result = getAdminUsersView(buildUsers(25), noSubmissions, {
      sort: "signedUp",
      order: "asc",
      page: 2,
      pageSize: 10,
    });
    expect(result.page).toBe(2);
    expect(result.users).toHaveLength(10);
    expect(result.users[0].firstName).toBe("User10");
  });

  it("only allows page sizes 10, 100, or 500; anything else falls back to 10", () => {
    expect(getAdminUsersView(buildUsers(5), noSubmissions, { pageSize: 25 }).pageSize).toBe(10);
    expect(getAdminUsersView(buildUsers(5), noSubmissions, { pageSize: 100 }).pageSize).toBe(100);
    expect(getAdminUsersView(buildUsers(5), noSubmissions, { pageSize: 500 }).pageSize).toBe(500);
    expect(getAdminUsersView(buildUsers(5), noSubmissions, { pageSize: "not-a-number" }).pageSize).toBe(10);
  });

  it("clamps a page requested beyond the last page down to the last page", () => {
    const result = getAdminUsersView(buildUsers(25), noSubmissions, { page: 999, pageSize: 10 });
    expect(result.page).toBe(3);
    expect(result.users).toHaveLength(5);
  });

  it("handles a page size larger than the total row count", () => {
    const result = getAdminUsersView(buildUsers(5), noSubmissions, { pageSize: 500 });
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.users).toHaveLength(5);
  });

  it("handles an empty user list without throwing", () => {
    const result = getAdminUsersView([], noSubmissions, { page: 4, pageSize: 10 });
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalCount).toBe(0);
    expect(result.users).toEqual([]);
  });

  it("treats a page of 0 or a negative page as page 1", () => {
    expect(getAdminUsersView(buildUsers(5), noSubmissions, { page: 0 }).page).toBe(1);
    expect(getAdminUsersView(buildUsers(5), noSubmissions, { page: -3 }).page).toBe(1);
  });
});

describe("getAdminUsersView - per-column regex search", () => {
  const users: User[] = [
    makeUser({ id: "1", firstName: "Charlie", lastName: "Brown", email: "charlie@example.com", emailVerified: true, createdAt: "2026-01-03T00:00:00.000Z" }),
    makeUser({ id: "2", firstName: "alice", lastName: "Adams", email: "Alice@example.com", emailVerified: false, createdAt: "2026-01-01T00:00:00.000Z" }),
    makeUser({ id: "3", firstName: "Bob", lastName: "Zephyr", email: "bob@example.com", emailVerified: true, createdAt: "2026-01-02T00:00:00.000Z" }),
  ];
  const submittedUserIds = new Set(["3"]);

  it("returns everyone with empty/absent search values", () => {
    const result = getAdminUsersView(users, submittedUserIds, {});
    expect(result.totalCount).toBe(3);
    expect(result.search).toEqual({ name: "", email: "", verified: "", signedUp: "" });
    expect(result.invalidSearch).toEqual({ name: false, email: false, verified: false, signedUp: false });
  });

  it("matches a single column by regex, case-insensitively", () => {
    const result = getAdminUsersView(users, submittedUserIds, { searchName: "charlie" });
    expect(result.users.map((u) => u.id)).toEqual(["1"]);
    expect(result.search.name).toBe("charlie");
  });

  it("matches EMAIL against the raw email string", () => {
    const result = getAdminUsersView(users, submittedUserIds, { searchEmail: "^bob@" });
    expect(result.users.map((u) => u.id)).toEqual(["3"]);
  });

  it("matches VERIFIED against the literal displayed badge text", () => {
    const verified = getAdminUsersView(users, submittedUserIds, { searchVerified: "^VERIFIED$" });
    expect(verified.users.map((u) => u.id).sort()).toEqual(["1", "3"]);

    const unverified = getAdminUsersView(users, submittedUserIds, { searchVerified: "^UNVERIFIED$" });
    expect(unverified.users.map((u) => u.id)).toEqual(["2"]);
  });

  it("matches SIGNED UP against the formatted display date, not the raw ISO timestamp", () => {
    const displayDate = formatSignedUpDate(users[2].createdAt); // id "3", e.g. "Jan 2, 2026"
    const result = getAdminUsersView(users, submittedUserIds, { searchSignedUp: displayDate });
    expect(result.users.map((u) => u.id)).toEqual(["3"]);

    const noMatch = getAdminUsersView(users, submittedUserIds, { searchSignedUp: "2026-01-02" });
    expect(noMatch.users).toEqual([]);
  });

  it("ANDs multiple active column searches together", () => {
    // "a" (case-insensitive) matches "Charlie Brown" and "alice Adams" but not "Bob Zephyr".
    // "^VERIFIED$" matches ids 1 and 3. The AND of both narrows to just id 1.
    const result = getAdminUsersView(users, submittedUserIds, {
      searchName: "a",
      searchVerified: "^VERIFIED$",
    });
    expect(result.users.map((u) => u.id)).toEqual(["1"]);
  });

  it("falls back to matching everything for an invalid regex, without throwing", () => {
    const result = getAdminUsersView(users, submittedUserIds, { searchName: "(unclosed" });
    expect(result.totalCount).toBe(3);
    expect(result.invalidSearch.name).toBe(true);
    expect(result.invalidSearch.email).toBe(false);
  });

  it("combines search with the dashboard-tile filter param (AND)", () => {
    const result = getAdminUsersView(users, submittedUserIds, {
      filter: "verified",
      searchName: "bob",
    });
    expect(result.users.map((u) => u.id)).toEqual(["3"]);
    expect(result.filter).toBe("verified");
  });

  it("trims whitespace from search values before compiling", () => {
    const result = getAdminUsersView(users, submittedUserIds, { searchName: "  charlie  " });
    expect(result.search.name).toBe("charlie");
    expect(result.users.map((u) => u.id)).toEqual(["1"]);
  });

  it("rejects an overlong search pattern as invalid without compiling it, even if it's syntactically valid regex", () => {
    // A pattern shaped for catastrophic backtracking (e.g. `(a+)+$`) is still
    // valid regex syntax, so this must be caught by a length cap before
    // `new RegExp()` + `.test()` ever run against every row, not by the
    // existing try/catch (which only catches SyntaxErrors).
    const overlong = "a".repeat(101);
    const result = getAdminUsersView(users, submittedUserIds, { searchName: overlong });
    expect(result.totalCount).toBe(3);
    expect(result.invalidSearch.name).toBe(true);
  });

  it("still compiles a search pattern at exactly the length cap", () => {
    const exactly100 = "charlie" + "x".repeat(93);
    const result = getAdminUsersView(users, submittedUserIds, { searchName: exactly100 });
    expect(result.invalidSearch.name).toBe(false);
    expect(result.users).toEqual([]); // valid pattern, just doesn't match any name
  });

  // Regression test for Argus's ReDoS finding: a short, syntactically valid,
  // catastrophic-backtracking pattern (well under MAX_SEARCH_PATTERN_LENGTH,
  // so the length cap alone does nothing here) matched against a haystack
  // shaped to trigger exponential backtracking. Unpatched, this exact
  // regex/haystack pair hangs a plain `regex.test()` call for 150+ seconds:
  //   const re = new RegExp("(a+)+$", "i");
  //   re.test("a".repeat(35) + "!"); // ~154672ms
  // The fix (safeRegexTest's vm-based hard timeout) must return well within
  // a request-reasonable window regardless, treating the timed-out match as
  // "no match" rather than letting it hang the whole process.
  it("bounds match time against a catastrophic-backtracking pattern instead of hanging (ReDoS)", () => {
    const poisonedUsers: User[] = [
      makeUser({
        id: "redos",
        firstName: "a".repeat(35) + "!",
        lastName: undefined,
        email: "redos-target@example.com",
      }),
    ];

    const start = Date.now();
    const result = getAdminUsersView(poisonedUsers, new Set(), { searchName: "(a+)+$" });
    const elapsedMs = Date.now() - start;

    // Generous ceiling: real observed cost is ~50ms (the hard per-match
    // timeout), vs. 150,000+ms unpatched. 5 seconds gives ample headroom for
    // a slow CI machine while still failing hard if the fix regresses to
    // "no bound at all".
    expect(elapsedMs).toBeLessThan(5000);
    // A timed-out match is treated as "no match" (safe default): the
    // poisoned row is excluded, not included or 500ing.
    expect(result.users).toEqual([]);
    expect(result.invalidSearch.name).toBe(false); // pattern itself compiled fine
  });
});
