import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Portfolio 404",
  description: "Sign in to your Portfolio 404 account to manage and publish your personal portfolio.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
