"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      Log out
    </button>
  );
}
