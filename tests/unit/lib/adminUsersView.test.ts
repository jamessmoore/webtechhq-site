import { describe, it, expect } from "vitest";
import { getAdminUsersView } from "@/lib/adminUsersView";
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
