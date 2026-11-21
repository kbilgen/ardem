import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteShell } from "@/components/SiteShell";
import { site } from "@/content/site";
import { BOOT_SCRIPT, PRELOAD_FONTS } from "@/lib/boot";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s — ${site.name}` },
  description: site.description,
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "A round brilliant solitaire on black velvet" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0d",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-tone="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        {PRELOAD_FONTS.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="" />
        ))}
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
