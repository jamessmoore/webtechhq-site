import Link from "next/link";
import { MenuIcon, HelpCircleIcon } from "./icons";

interface ToolsUser {
  firstName: string;
  lastName: string;
  email: string;
  businessType?: string;
}

interface TopBarProps {
  kicker: string;
  title: string;
  user: ToolsUser;
  onOpenMobileMenu: () => void;
}

function initialsOf(user: ToolsUser): string {
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  return initials || "?";
}

export default function TopBar({ kicker, title, user, onOpenMobileMenu }: TopBarProps) {
  return (
    <header
      className="flex-none flex items-center justify-between sticky top-0 z-[5]"
      style={{
        height: 60,
        backgroundColor: "#040C1C",
        borderBottom: "0.8px solid #162D5A",
        padding: "0 clamp(16px,4vw,36px)",
      }}
    >
      <div className="flex items-center gap-[14px] min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
          className="lg:hidden flex-none"
          style={{ color: "#EEF6FF", cursor: "pointer" }}
        >
          <MenuIcon size={22} />
        </button>
        <div className="min-w-0" style={{ lineHeight: 1.25 }}>
          <div
            className="hidden lg:block"
            style={{ font: '400 10px "Courier New", monospace', letterSpacing: "0.2em", color: "#5B7BA5" }}
          >
            {kicker}
          </div>
          <div
            className="whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ font: '700 16px "Courier New", monospace', letterSpacing: "0.03em", color: "#EEF6FF", marginTop: 2 }}
          >
            {title}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-none">
        <Link
          href="/contact"
          className="hidden sm:flex items-center gap-[7px] transition-colors duration-150"
          style={{
            padding: "8px 12px",
            borderRadius: 2,
            border: "0.8px solid #162D5A",
            backgroundColor: "transparent",
            color: "#80AEE0",
            font: '400 11px "Courier New", monospace',
            letterSpacing: "0.08em",
          }}
        >
          <HelpCircleIcon size={14} />
          HELP
        </Link>
        <div
          className="flex-none flex items-center justify-center"
          style={{
            width: 37,
            height: 37,
            border: "0.8px solid #3D7FD4",
            backgroundColor: "#0A1832",
            font: '700 12px "Courier New", monospace',
            color: "#89D4FF",
          }}
        >
          {initialsOf(user)}
        </div>
      </div>
    </header>
  );
}
