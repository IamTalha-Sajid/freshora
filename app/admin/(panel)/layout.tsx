import { Logo } from "@/components/Brand";
import { AdminNav } from "@/components/admin/AdminNav";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

// The admin follows the visitor's theme (toggle at the bottom of the sidebar).
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen flex-col bg-page text-fg md:flex-row">
      <aside className="shrink-0 border-b border-line bg-surface md:sticky md:top-0 md:flex md:h-screen md:w-60 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-4 py-4">
          <Logo href="/admin" className="h-8" />
          <span className="chip">Admin</span>
          <span className="ml-auto md:hidden">
            <ThemeToggle />
          </span>
        </div>
        <AdminNav />
        <div className="hidden items-center justify-between border-t border-line-soft px-4 py-3 md:flex">
          <span className="text-sm font-semibold text-muted">Dark mode</span>
          <ThemeToggle />
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
