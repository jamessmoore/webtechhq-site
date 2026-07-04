import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isGoldStandardTestAccount, resetAllToolDataForUser } from "@/lib/testAccount";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !isGoldStandardTestAccount(session.user.email)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  resetAllToolDataForUser(session.user.id);

  return NextResponse.json({ success: true });
}
