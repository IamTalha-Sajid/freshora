import Link from "next/link";
import { Logo } from "@/components/Brand";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const NAV = [
  ["/admin", "Dashboard"],
  ["/admin/orders", "Orders"],
  ["/admin/products", "Products"],
  ["/admin/categories", "Categories"],
  ["/admin/bundles", "Bundles"],
  ["/admin/homepage", "Homepage"],
  ["/admin/reviews", "Reviews"],
  ["/admin/settings", "Settings"],
];

// The admin follows the visitor's theme (toggle in the sidebar header).
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen flex-col bg-page text-fg md:flex-row">
      <aside className="shrink-0 border-b border-line bg-surface md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-4 py-4">
          <Logo href="/admin" className="h-8" />
          <span className="chip">Admin</span>
          <span className="ml-auto">
            <ThemeToggle />
          </span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pb-0">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold text-muted transition hover:bg-accent hover:text-fg">
              {label}
            </Link>
          ))}
          <Link href="/" target="_blank" className="whitespace-nowrap rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-accent">
            View store ↗
          </Link>
          <LogoutButton />
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
