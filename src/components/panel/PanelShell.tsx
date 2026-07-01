"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface PanelUser {
  firstName: string;
  lastName: string;
  email: string;
  businessType?: string;
}

interface PanelShellProps {
  user: PanelUser;
  toolStatus: "not_started" | "completed";
  signOutButton: React.ReactNode;
  children: React.ReactNode;
}

function pageMeta(pathname: string): { kicker: string; title: string } {
  if (pathname === "/panel") return { kicker: "CONTROL PANEL", title: "Dashboard" };
  if (pathname.startsWith("/panel/tools/ai-opportunity-finder/report")) {
    return { kicker: "AI OPPORTUNITY FINDER", title: "Your Opportunity Report" };
  }
  if (pathname.startsWith("/panel/tools/ai-opportunity-finder")) {
    return { kicker: "AI TOOLS", title: "AI Opportunity Finder" };
  }
  return { kicker: "CONTROL PANEL", title: "Dashboard" };
}

export default function PanelShell({ user, toolStatus, signOutButton, children }: PanelShellProps) {
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
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar kicker={kicker} title={title} user={user} onOpenMobileMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto br-grid-dense" style={{ backgroundColor: "#030B18" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
