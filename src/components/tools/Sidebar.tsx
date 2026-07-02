"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HexMark from "@/components/HexMark";
import { GridIcon, SparkleIcon, ShieldIcon, CloseIcon } from "./icons";

interface ToolsUser {
  firstName: string;
  lastName: string;
  email: string;
  businessType?: string;
}

interface SidebarProps {
  user: ToolsUser;
  toolStatus: "not_started" | "completed";
  mobileOpen: boolean;
  onClose: () => void;
  signOutButton: React.ReactNode;
}

function initialsOf(user: ToolsUser): string {
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  return initials || "?";
}

export default function Sidebar({ user, mobileOpen, onClose, signOutButton }: SidebarProps) {
  const pathname = usePathname();
  const isDashActive = pathname === "/tools";
  const isToolActive = pathname.startsWith("/tools/ai-opportunity-finder");

  const navBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 2,
    fontFamily: "var(--font-mono, 'Courier New', monospace)",
    fontSize: 13.5,
    letterSpacing: "0.03em",
    cursor: "pointer",
    color: "#80AEE0",
    transition: "all .14s",
    borderLeftWidth: 2,
    borderLeftStyle: "solid",
    borderLeftColor: "transparent",
  };

  const navActive: React.CSSProperties = {
    backgroundColor: "#071525",
    color: "#EEF6FF",
    borderLeftColor: "#3D7FD4",
  };

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-[55]"
          style={{ backgroundColor: "rgba(3,7,18,.66)", backdropFilter: "blur(2px)" }}
        />
      )}
      <aside
        className={`flex-none flex flex-col overflow-y-auto transition-transform duration-[.25s] ease-in-out lg:static lg:!translate-x-0 fixed top-0 left-0 h-full z-[60] lg:z-auto ${
          mobileOpen ? "translate-x-0 shadow-[14px_0_46px_rgba(0,0,0,.55)]" : "-translate-x-[101%]"
        }`}
        style={{
          backgroundColor: "#040C1C",
          borderRight: "0.8px solid #162D5A",
          width: 264,
          padding: "22px 16px 16px",
        }}
      >
        <div className="flex items-center gap-[11px]" style={{ padding: "2px 8px 22px" }}>
          <HexMark size={40} />
          <div className="flex-1" style={{ lineHeight: 1.2 }}>
            <div
              style={{ font: '700 14px "Courier New", monospace', color: "#EEF6FF", letterSpacing: "0.06em" }}
            >
              MOORE SOLUTIONS
            </div>
            <div
              style={{ font: '400 10px "Courier New", monospace', color: "#5B90C8", marginTop: 3, letterSpacing: "0.28em" }}
            >
              CLIENT TOOLS
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden flex-none"
            style={{ color: "#80AEE0", padding: 4, cursor: "pointer" }}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-[2px]">
          <Link href="/tools" onClick={onClose} style={{ ...navBase, ...(isDashActive ? navActive : {}) }}>
            <GridIcon />
            <span>Dashboard</span>
          </Link>

          <div
            style={{ font: '400 10px "Courier New", monospace', letterSpacing: "0.24em", color: "#5B7BA5", padding: "17px 12px 8px" }}
          >
            TOOLS
          </div>

          <Link
            href="/tools/ai-opportunity-finder"
            onClick={onClose}
            className="transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)]"
            style={{ ...navBase, ...(isToolActive ? navActive : {}), borderRadius: 6 }}
          >
            <SparkleIcon size={17} />
            <span style={{ flex: 1 }}>AI Opportunity Finder</span>
            <HexMark size={14} />
          </Link>
        </nav>

        <div className="flex flex-col gap-3" style={{ marginTop: "auto" }}>
          <div
            className="relative"
            style={{ backgroundColor: "#071525", border: "0.8px solid #162D5A", padding: "14px 15px" }}
          >
            <span className="br-corner-tr" style={{ top: 6, right: 6, width: 13, height: 13 }} />
            <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
              <ShieldIcon size={13} style={{ color: "#89D4FF" } as React.CSSProperties} />
              <span style={{ font: '400 10.5px "Courier New", monospace', letterSpacing: "0.14em", color: "#89D4FF" }}>
                NEED A HAND?
              </span>
            </div>
            <p style={{ margin: "0 0 11px", font: '400 12.5px/1.55 Arial, sans-serif', color: "#80AEE0" }}>
              Stuck on anything? James reads every message himself.
            </p>
            <Link
              href="/contact"
              className="block w-full text-center transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
              style={{
                padding: 9,
                borderRadius: 6,
                border: "0.8px solid #162D5A",
                backgroundColor: "transparent",
                color: "#EEF6FF",
                font: '400 11px "Courier New", monospace',
                letterSpacing: "0.1em",
              }}
            >
              MESSAGE JAMES
            </Link>
          </div>
          <div
            className="flex items-center gap-[11px]"
            style={{ padding: "14px 8px 6px", borderTop: "0.8px solid #162D5A" }}
          >
            <div
              className="flex-none flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                border: "0.8px solid #3D7FD4",
                backgroundColor: "#0A1832",
                font: '700 12px "Courier New", monospace',
                color: "#89D4FF",
              }}
            >
              {initialsOf(user)}
            </div>
            <div className="min-w-0" style={{ lineHeight: 1.3, flex: 1 }}>
              <div
                className="whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ font: '400 13px Arial, sans-serif', color: "#EEF6FF" }}
              >
                {user.firstName} {user.lastName}
              </div>
              <div
                className="whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ font: '400 11px Arial, sans-serif', color: "#5B7BA5" }}
              >
                {user.businessType || "—"}
              </div>
            </div>
            {signOutButton}
          </div>
        </div>
      </aside>
    </>
  );
}
