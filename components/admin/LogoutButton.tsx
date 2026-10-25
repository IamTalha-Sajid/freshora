"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-muted transition-colors hover:bg-sale-soft hover:text-danger-fg"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      <Icon name="lock" size={18} />
      Log out
    </button>
  );
}
