"use client";

import { useSyncExternalStore } from "react";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { getWhatsAppUrl } from "@/lib/site-config";
import { useMounted } from "@/lib/use-mounted";

const GENERAL_INQUIRY_MESSAGE =
  "Hi Modfem, I'd like to talk about sourcing a car from Canada to Nigeria.";

function subscribeToScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

/** Site-wide, always-one-tap-away WhatsApp dispatch — hidden on /admin,
 * which is the dealer's internal console, not a buyer-facing surface.
 * Also held back while the home page's hero section fills the viewport:
 * the hero already has its own WhatsApp triggers (top-right nav icon,
 * bottom-right claim button) sharing that same bottom-right corner, so this
 * global FAB would otherwise collide with them until the user scrolls past. */
export function FloatingWhatsAppBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const mounted = useMounted();
  const scrollY = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY,
    () => 0
  );

  if (pathname?.startsWith("/admin")) return null;

  // Before mount (SSR + the hydration-matching pass), default to "hidden"
  // on the home page so there's no flash of the FAB ahead of scroll
  // position being known on the client.
  const hideForHero = isHome && (!mounted || scrollY <= window.innerHeight * 0.6);

  const href = getWhatsAppUrl(GENERAL_INQUIRY_MESSAGE);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message Modfem on WhatsApp"
      aria-hidden={hideForHero}
      tabIndex={hideForHero ? -1 : undefined}
      className={`fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500 px-4 py-3 text-[10px] font-medium uppercase tracking-widest text-zinc-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_8px_32px_rgba(16,185,129,0.3)] backdrop-blur-xl transition-all duration-300 hover:bg-emerald-400 sm:bottom-6 sm:right-6 ${
        hideForHero ? "pointer-events-none translate-y-2 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
      <span className="hidden sm:inline">WhatsApp Dispatch</span>
    </a>
  );
}
