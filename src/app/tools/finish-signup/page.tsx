import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserById, isAccountCompleted } from "@/lib/users";
import FinishSignupForm from "@/components/tools/FinishSignupForm";

export const metadata: Metadata = { title: "Finish Your Account | Moore Solutions" };

export default async function FinishSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signup");

  const user = getUserById(session.user.id);
  if (!user) redirect("/signup");

  const { next } = await searchParams;
  const redirectTo = next && next.startsWith("/") ? next : "/tools/opportunity-finder";

  if (isAccountCompleted(user)) redirect(redirectTo);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "clamp(24px,4vw,34px) clamp(18px,4vw,44px) 80px" }}>
      <h1
        style={{
          margin: 0,
          font: '400 clamp(21px,4vw,27px)/1.2 "Courier New", monospace',
          color: "#89D4FF",
          letterSpacing: "0.01em",
        }}
      >
        Finish creating your account
      </h1>
      <p
        style={{
          margin: "11px 0 0",
          font: "400 21px/1.6 Arial, sans-serif",
          color: "#FFFFFF",
        }}
      >
        Set a password to save your Opportunity Finder result permanently and sign back in
        whenever you need it. Last name is optional.
      </p>

      <div style={{ marginTop: 32 }}>
        <FinishSignupForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
