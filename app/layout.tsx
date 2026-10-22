import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import { ConfirmProvider } from "@/components/ConfirmProvider";
import { StoreProvider } from "@/components/StoreProvider";
import { Toaster } from "@/components/Toaster";
import "./globals.css";

const display = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["600"] });
const body = Manrope({ variable: "--font-manrope", subsets: ["latin"], weight: ["400", "600"] });

// Absolute base so og:image and canonical URLs resolve. Defaults to the live domain; override with NEXT_PUBLIC_SITE_URL.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fresh-ora.store";
const description = "Premium dental and oral-care products, delivered fresh to your door across Pakistan.";

// The share image comes from app/opengraph-image.png and app/twitter-image.png.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Freshora | Dental & Oral Care", template: "%s | Freshora" },
  description,
  applicationName: "Freshora",
  openGraph: { type: "website", siteName: "Freshora", title: "Freshora | Dental & Oral Care", description, locale: "en_PK" },
  twitter: { card: "summary_large_image", title: "Freshora | Dental & Oral Care", description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4fbfa" },
    { media: "(prefers-color-scheme: dark)", color: "#06141b" },
  ],
};

// Runs before first paint so a saved theme never flashes the wrong colors.
const themeScript = `try{var t=localStorage.getItem("freshora_theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <StoreProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
