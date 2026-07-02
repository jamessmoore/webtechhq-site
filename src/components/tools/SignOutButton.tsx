import { signOut } from "@/auth";
import { SignOutIcon } from "./icons";

export default function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        aria-label="Sign out"
        className="flex-none transition-colors duration-150"
        style={{ color: "#5B7BA5", cursor: "pointer" }}
      >
        <SignOutIcon />
      </button>
    </form>
  );
}
