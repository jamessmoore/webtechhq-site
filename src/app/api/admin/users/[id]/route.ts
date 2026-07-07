import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserById, deleteUser } from "@/lib/users";
import { isProtectedAccount } from "@/lib/protectedAccounts";

function isAdmin(email: string | null | undefined): boolean {
  return !!email && email === process.env.ADMIN_EMAIL;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const user = getUserById(id);
  if (!user) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (isProtectedAccount(user.email)) {
    return NextResponse.json({ error: "This account cannot be deleted." }, { status: 403 });
  }

  deleteUser(id);

  return NextResponse.json({ success: true });
}
