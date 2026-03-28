import type { Metadata } from "next";
import SessionProvider from "@/components/SessionProvider";
import ThemeProvider from "@/components/ThemeProvider";
import LanguageProvider from "@/lib/i18n/LanguageProvider";
import "./globals.css";

const baseUrl = process.env.NEXTAUTH_URL || "https://portfolio404new.vercel.app";

export const metadata: Metadata = {
  title: "Portfolio 404 — Build Your Personal Portfolio",
  description:
    "Create a stunning personal portfolio in minutes. Free to start. No coding required. Perfect for developers, designers, photographers, freelancers and creators.",
  openGraph: {
    title: "Portfolio 404 — Build Your Personal Portfolio",
    description:
      "Create a stunning personal portfolio in minutes. Free to start. No coding required.",
    url: baseUrl,
    siteName: "Portfolio 404",
    images: [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio 404 — Build Your Personal Portfolio",
    description:
      "Create a stunning personal portfolio in minutes. Free to start. No coding required.",
    images: [`${baseUrl}/og-image.png`],
  },
  metadataBase: new URL(baseUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('theme');
              if (t === 'light') document.documentElement.classList.remove('dark');
              else if (t === 'dark') document.documentElement.classList.add('dark');
              else if (!window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.remove('dark');
            } catch(e) {}
          })();
        ` }} />
      </head>
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)]">
        <SessionProvider>
          <ThemeProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
