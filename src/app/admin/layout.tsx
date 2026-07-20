import type { Metadata } from "next";

// Every route under /admin is gated behind ADMIN_EMAIL (see the
// requireAdmin() check in each page) and has no public content to
// index. Setting robots here covers the whole subtree, including
// pages that don't export their own metadata.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
