import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — Portfolio 404",
  description: "Sign up for Portfolio 404 and build your stunning personal portfolio in minutes.",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
