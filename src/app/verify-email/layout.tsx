import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email — Portfolio 404",
  robots: { index: false, follow: false },
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
