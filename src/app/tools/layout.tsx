import type { Metadata } from "next";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import { getSubmissionsByUser } from "@/lib/submissions";
import ToolsShell from "@/components/tools/ToolsShell";
import SignOutButton from "@/components/tools/SignOutButton";

// Every route under /tools is a client tool or its account plumbing, not
// content meant to be indexed - true whether or not the specific route
// requires a session. This covers the whole subtree, including future
// tools that don't set their own robots metadata.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ToolsLayout({ children }: { children: React.ReactNode }) {
  // src/proxy.ts already redirects to /signup before this layout ever runs,
  // for every /tools/* route except /tools, /tools/opportunity-finder, and
  // /tools/prompt-pilot - those three are usable anonymously (see proxy.ts's
  // isUngatedToolsPath). So if we get here with no session, it's always one
  // of those three, and the right behavior is a generic, sign-in-prompting
  // shell rather than a redirect. A real session renders exactly as before.
  const session = await auth();
  const user = session?.user?.id ? getUserById(session.user.id) : null;

  const submissions = user ? getSubmissionsByUser(user.id) : [];
  const toolStatus: "not_started" | "completed" = submissions.length > 0 ? "completed" : "not_started";

  return (
    <ToolsShell
      user={
        user
          ? {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              businessType: submissions[0]?.businessType,
            }
          : null
      }
      toolStatus={toolStatus}
      signOutButton={user ? <SignOutButton /> : null}
    >
      {children}
    </ToolsShell>
  );
}
