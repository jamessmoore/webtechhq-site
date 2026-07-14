"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import HexMark from "@/components/HexMark";

interface ToolsUser {
  firstName: string;
  lastName?: string;
  email: string;
  businessType?: string;
}

interface ToolsShellProps {
  user: ToolsUser;
  toolStatus: "not_started" | "completed";
  signOutButton: React.ReactNode;
  children: React.ReactNode;
}

function pageMeta(pathname: string): { kicker: string; title: string } {
  if (pathname === "/tools") return { kicker: "CLIENT TOOLS", title: "Dashboard" };
  if (pathname.startsWith("/tools/opportunity-finder/report")) {
    return { kicker: "OPPORTUNITY FINDER", title: "Opportunity Finder" };
  }
  if (pathname.startsWith("/tools/opportunity-finder")) {
    return { kicker: "AI TOOLS", title: "Opportunity Finder" };
  }
  if (pathname.startsWith("/tools/business-audit")) {
    return { kicker: "AI TOOLS", title: "Business Audit" };
  }
  return { kicker: "CLIENT TOOLS", title: "Dashboard" };
}

export default function ToolsShell({ user, toolStatus, signOutButton, children }: ToolsShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { kicker, title } = pageMeta(pathname);

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden", backgroundColor: "#030B18" }}>
      <Sidebar
        user={user}
        toolStatus={toolStatus}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        signOutButton={signOutButton}
      />
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        <div
          className="absolute opacity-[0.065] pointer-events-none select-none"
          style={{ top: "50%", left: 0, transform: "translateY(-50%)" }}
        >
          <div className="hex-watermark-drift">
            <HexMark size={280} />
          </div>
        </div>
        <TopBar kicker={kicker} title={title} user={user} onOpenMobileMenu={() => setSidebarOpen(true)} />
        <main className="relative z-[1] flex-1 overflow-y-auto br-grid-dense">
          {children}
        </main>
      </div>
    </div>
  );
}
