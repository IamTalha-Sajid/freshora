"use client";

import { useEffect, useRef, useState } from "react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { WHATSAPP_URL } from "@/lib/whatsapp";

const SIZE = 56;
const KEY = "freshora_wa_pos";
const MOVE_THRESHOLD = 6; // px of movement before a press counts as a drag, not a click

type Pos = { x: number; y: number };

const clamp = (p: Pos): Pos => ({
  x: Math.min(Math.max(8, p.x), window.innerWidth - SIZE - 8),
  y: Math.min(Math.max(8, p.y), window.innerHeight - SIZE - 8),
});

/** Floating chat button. Drag it anywhere; the spot is remembered. Sits above the mobile bottom nav by default. */
export function WhatsAppButton() {
  const [pos, setPos] = useState<Pos | null>(null); // null = default corner (CSS)
  const drag = useRef<{ dx: number; dy: number; sx: number; sy: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (typeof saved?.x === "number" && typeof saved?.y === "number") setPos(clamp(saved));
    } catch {}
    const onResize = () => setPos((p) => (p ? clamp(p) : p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function onPointerDown(e: React.PointerEvent<HTMLAnchorElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top, sx: e.clientX, sy: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLAnchorElement>) {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < MOVE_THRESHOLD) return;
    d.moved = true;
    setPos(clamp({ x: e.clientX - d.dx, y: e.clientY - d.dy }));
  }
  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    suppressClick.current = true;
    setPos((p) => {
      if (p) {
        try {
          localStorage.setItem(KEY, JSON.stringify(p));
        } catch {}
      }
      return p;
    });
  }

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat on WhatsApp (drag to move)"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(e) => {
        if (suppressClick.current) {
          e.preventDefault();
          suppressClick.current = false;
        }
      }}
      onDragStart={(e) => e.preventDefault()}
      style={pos ? { left: pos.x, top: pos.y } : undefined}
      className={`fixed z-30 flex h-14 w-14 touch-none select-none items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-colors hover:bg-[#1ebe5b] ${pos ? "" : "bottom-24 right-4 md:bottom-6 md:right-6"}`}
    >
      <WhatsAppIcon size={30} />
    </a>
  );
}
