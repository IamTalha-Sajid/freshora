"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";
import { LogoutButton } from "@/components/admin/LogoutButton";

const NAV = [
  ["/admin", "Dashboard", "home"],
  ["/admin/orders", "Orders", "box"],
  ["/admin/products", "Products", "tag"],
  ["/admin/categories", "Categories", "grid"],
  ["/admin/bundles", "Bundles", "gift"],
  ["/admin/homepage", "Homepage", "sparkle"],
  ["/admin/reviews", "Reviews", "star"],
  ["/admin/subscribers", "Subscribers", "mail"],
  ["/admin/settings", "Settings", "filter"],
] as const;

const item = "flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors";

export function AdminNav() {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  return (
    <nav aria-label="Admin" className="scrollbar-none flex gap-1 overflow-x-auto px-2 pb-2 md:flex-1 md:flex-col md:overflow-y-auto md:pb-3">
      {NAV.map(([href, label, icon]) => (
        <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} className={`${item} ${active(href) ? "bg-surface-alt text-fg" : "text-muted hover:bg-surface-alt hover:text-fg"}`}>
          <Icon name={icon} size={18} className={active(href) ? "text-link" : ""} />
          {label}
        </Link>
      ))}
      <Link href="/" target="_blank" className={`${item} text-muted hover:bg-surface-alt hover:text-fg md:mt-2 md:border-t md:border-line-soft md:pt-3`}>
        <Icon name="arrow-up-right" size={18} />
        View store
      </Link>
      <LogoutButton />
    </nav>
  );
}
