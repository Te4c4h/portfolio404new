"use client";


interface FooterProps {
  name: string;
  footerText?: string;
  textColor?: string;
  textFont?: string;
  textWeight?: string;
}

export default function Footer({ name, footerText, textColor, textFont, textWeight }: FooterProps) {
  const copyright = footerText || `\u00A9 ${new Date().getFullYear()} ${name}`;

  return (
    <footer
      className="border-t py-8 px-6"
      style={{ borderColor: "var(--surface)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs" style={{
        color: textColor || "var(--text)",
        opacity: textColor ? 0.7 : 0.4,
        fontFamily: textFont ? textFont + ", sans-serif" : undefined,
        fontWeight: textWeight || undefined,
      }}>
        <span>{copyright}</span>
        <a href="/login" className="hover:opacity-100 transition-opacity">
          Login
        </a>
      </div>
    </footer>
  );
}
