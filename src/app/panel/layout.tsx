import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import { getSubmissionsByUser } from "@/lib/submissions";
import PanelShell from "@/components/panel/PanelShell";
import SignOutButton from "@/components/panel/SignOutButton";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signup");

  const user = getUserById(session.user.id);
  if (!user) redirect("/signup");

  const submissions = getSubmissionsByUser(user.id);
  const toolStatus: "not_started" | "completed" = submissions.length > 0 ? "completed" : "not_started";

  return (
    <PanelShell
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
    </PanelShell>
  );
}
