import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import { getSubmissionsByUser } from "@/lib/submissions";
import ToolsShell from "@/components/tools/ToolsShell";
import SignOutButton from "@/components/tools/SignOutButton";

// Every route under /tools requires a session (see src/proxy.ts's
// /tools/:path* matcher) and has no public content to index. This
// covers the whole subtree, including future tools that don't set
// their own robots metadata.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ToolsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signup");

  const user = getUserById(session.user.id);
  if (!user) redirect("/signup");

  const submissions = getSubmissionsByUser(user.id);
  const toolStatus: "not_started" | "completed" = submissions.length > 0 ? "completed" : "not_started";

  return (
    <ToolsShell
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        businessType: submissions[0]?.businessType,
      }}
      toolStatus={toolStatus}
      signOutButton={<SignOutButton />}
    >
      {children}
    </ToolsShell>
  );
}
