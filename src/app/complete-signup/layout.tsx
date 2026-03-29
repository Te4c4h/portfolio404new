import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Sign Up — Portfolio 404",
  robots: { index: false, follow: false },
};

export default function CompleteSignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
