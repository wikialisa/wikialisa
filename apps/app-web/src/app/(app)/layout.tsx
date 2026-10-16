"use client";
/**
 * (app) Route Group Layout
 * Wraps all main app screens with AppShell (layout="app")
 * Includes: BottomNavbar (5-tab)
 * Auth guard: redirects to /enter-pin if auth_state !== "onboarded"
 *             or if access_token is missing.
 */
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AppShell,
  BottomNavbar,
  Home,
  Bitcoin,
  BookOpen,
  Gift,
  MoreHorizontal,
  type NavTab,
} from "@wikialisa/ui-kit";

const NAV_TABS: NavTab[] = [
  { id: "home", label: "Home", icon: <Home size={18} color="currentColor" /> },
  { id: "crypto", label: "Crypto", icon: <Bitcoin size={18} color="currentColor" /> },
  { id: "learn", label: "Học tập", icon: <BookOpen size={18} color="currentColor" /> },
  { id: "referral", label: "Giới thiệu", icon: <Gift size={18} color="currentColor" /> },
  { id: "more", label: "More", icon: <MoreHorizontal size={18} color="currentColor" /> },
];

const TAB_ROUTES: Record<string, string> = {
  home: "/home",
  crypto: "/crypto",
  learn: "/learn",
  referral: "/referral",
  more: "/more",
};

const ROUTE_TABS: Record<string, string> = {
  "/home": "home",
  "/crypto": "crypto",
  "/learn": "learn",
  "/referral": "referral",
  "/more": "more",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = ROUTE_TABS[pathname] ?? "home";

  // Auth guard — runs only on client after hydration
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const authState = localStorage.getItem("auth_state");
    const accessToken = localStorage.getItem("access_token");

    // Must have both onboarded flag AND a token
    if (authState !== "onboarded" || !accessToken) {
      // Preserve intended destination so enter-pin can redirect back
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/enter-pin?returnUrl=${returnUrl}`);
      return;
    }
    setAuthChecked(true);
  }, [pathname, router]);

  // Show nothing while auth check is in progress (prevents flash of content)
  if (!authChecked) return null;

  return (
    <AppShell
      layout="app"
      bg="#F5F6FA"
      bottomNav={
        <BottomNavbar
          tabs={NAV_TABS}
          activeTab={activeTab}
          onTabChange={(id) => {
            const route = TAB_ROUTES[id];
            if (route) router.push(route);
          }}
        />
      }
    >
      {children}
    </AppShell>
  );
}
