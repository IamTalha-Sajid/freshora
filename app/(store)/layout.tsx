import Link from "next/link";
import { BackToTop } from "@/components/BackToTop";
import { Logo } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import { StoreChrome } from "@/components/StoreChrome";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { getCategories, getFeaturedProducts } from "@/lib/data";
import { getSettings } from "@/lib/models/Settings";
import { WHATSAPP_URL } from "@/lib/whatsapp";

// All storefront pages read live data from MongoDB.
export const dynamic = "force-dynamic";

const footLink = "-mx-2 inline-flex min-h-9 w-fit items-center px-2 text-[#cfe3e6] transition-colors hover:text-[#4fd3c4]";
const footHead = "mb-1.5 font-sans text-xs font-bold uppercase tracking-[0.1em] text-[#7fa3ab]";
const helpCard = "flex min-w-[240px] flex-1 basis-[240px] items-center gap-4 rounded-xl border border-[#1e3c4b] bg-[#0a1d25] px-5 py-[18px] text-[#e6f4f2] transition-colors hover:border-mint";
const helpIcon = "flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-navy text-[#4fd3c4]";
const helpLabel = "text-xs font-bold uppercase tracking-[0.08em] text-[#7fa3ab]";
const chip = "flex h-[30px] items-center gap-1.5 rounded-md border border-[#1e3c4b] bg-[#0a1d25] px-2.5 text-xs font-bold text-[#e6f4f2]";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const [settings, categories, upsell] = await Promise.all([getSettings(), getCategories(), getFeaturedProducts(6)]);
  const announcement = settings.announcementEnabled && !!settings.announcementText;
  const phone = settings.contactPhone;

  return (
    <div className="relative flex flex-1 flex-col">
      {announcement && <div className="flex min-h-[38px] items-center justify-center bg-[#06141b] px-4 py-1.5 text-center text-[13px] text-[#cfe3e6]">{settings.announcementText}</div>}

      <StoreChrome categories={categories} shipping={{ fee: settings.shippingFee, threshold: settings.freeShippingThreshold }} upsell={upsell} />

      <WhatsAppButton />

      <main className="flex-1">{children}</main>

      <footer className="mt-24 border-t border-[#12303c] bg-[#041016] pb-20 text-[#e6f4f2] md:pb-0">
        <div className="container-x pt-12">
          <div className="flex flex-wrap items-stretch gap-x-6 gap-y-5 border-b border-[#12303c] pb-12">
            <div className="flex min-w-[260px] flex-1 basis-[280px] flex-col justify-center gap-1.5 py-1">
              <h2 className="text-[clamp(1.5rem,2.4vw,1.875rem)] font-bold text-white">Need help with an order?</h2>
              <p className="text-sm text-[#9db9bf]">Call, email or message us and we&apos;ll sort it out.</p>
            </div>
            {phone && (
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className={helpCard}>
                <span className={helpIcon}>
                  <Icon name="phone" />
                </span>
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className={helpLabel}>Call us</span>
                  <b className="tabular text-lg font-bold">{phone}</b>
                </span>
              </a>
            )}
            {settings.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className={helpCard}>
                <span className={helpIcon}>
                  <Icon name="mail" />
                </span>
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className={helpLabel}>Email us</span>
                  <b className="text-lg font-bold [overflow-wrap:anywhere]">{settings.contactEmail}</b>
                </span>
              </a>
            )}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={helpCard}>
              <span className={helpIcon}>
                <WhatsAppIcon size={20} />
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className={helpLabel}>Chat with us</span>
                <b className="text-lg font-bold">WhatsApp</b>
              </span>
            </a>
          </div>

          <div className="grid gap-10 py-12 text-sm md:grid-cols-[minmax(0,1.4fr)_minmax(150px,1fr)]">
            <div className="flex flex-col gap-4">
              <Logo className="h-9" onDark />
              <p className="max-w-[300px] text-pretty text-[#9db9bf]">Dental and oral-care essentials, delivered to your door.</p>
            </div>
            <nav aria-label="Help" className="flex flex-col">
              <h3 className={footHead}>Help</h3>
              <Link href="/track" className={footLink}>
                Track your order
              </Link>
              <Link href="/wishlist" className={footLink}>
                Wishlist
              </Link>
              <Link href="/cart" className={footLink}>
                Cart
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-[#12303c]">
          <div className="container-x grid items-center gap-4 py-[18px] text-[13px] text-[#9db9bf] lg:grid-cols-3">
            <span>
              © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
            </span>
            <a href="https://talha.is-a.dev/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 justify-self-start text-[15px] font-semibold text-white transition-opacity hover:opacity-80 lg:justify-self-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/talha.png" alt="" width={28} height={28} className="rounded-lg" />
              Made by Talha
            </a>
            <div className="flex flex-wrap items-center gap-2 lg:justify-self-end">
              <span>We accept</span>
              <span className={chip}>
                <Icon name="cash" size={14} className="text-[#4fd3c4]" />
                Cash on delivery
              </span>
              <span className={chip}>
                <Icon name="bank" size={14} className="text-[#4fd3c4]" />
                Bank transfer
              </span>
              <BackToTop />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
