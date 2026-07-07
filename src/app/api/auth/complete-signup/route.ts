import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { getUserById, completeAccountSignup, isAccountCompleted } from "@/lib/users";
import { sendSlackNotification } from "@/lib/slack";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You need to be signed in." }, { status: 401 });
    }

    const user = getUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    if (isAccountCompleted(user)) {
      return NextResponse.json({ error: "Your account is already set up." }, { status: 409 });
    }

    const body = await request.json();
    const { password, lastName } = body as { password: string; lastName?: string };

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    completeAccountSignup(user.id, passwordHash, lastName?.trim() || undefined);

    const fullName = lastName?.trim() ? `${user.firstName} ${lastName.trim()}` : user.firstName;
    sendSlackNotification(`New signup: ${fullName} <${user.email}>`).catch((err) => {
      console.error("Slack notification failed:", err);
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Complete signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
