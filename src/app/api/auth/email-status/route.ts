import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/users";

export async function POST(request: NextRequest) {
  const { email } = (await request.json()) as { email?: string };
  const user = email ? getUserByEmail(email.toLowerCase().trim()) : null;
  const needsVerification = !!user && !user.emailVerified;
  return NextResponse.json({ needsVerification });
}
