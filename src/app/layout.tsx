import type { Metadata } from "next";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio 404 — Build Your Personal Portfolio",
  description:
    "Create a stunning personal portfolio in minutes. Free to start. No coding required. Perfect for developers, designers, photographers, freelancers and creators.",
  openGraph: {
    title: "Portfolio 404 — Build Your Personal Portfolio",
    description:
      "Create a stunning personal portfolio in minutes. Free to start. No coding required.",
    url: "https://www.portfolio404.site",
    siteName: "Portfolio 404",
    images: [{ url: "https://www.portfolio404.site/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio 404 — Build Your Personal Portfolio",
    description:
      "Create a stunning personal portfolio in minutes. Free to start. No coding required.",
    images: ["https://www.portfolio404.site/og-image.png"],
  },
  metadataBase: new URL("https://www.portfolio404.site"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
