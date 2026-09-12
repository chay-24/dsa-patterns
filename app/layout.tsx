import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { categories } from "@/data/categories";
import { patterns } from "@/data/patterns";
import { Shell } from "@/components/shell";
import "./globals.css";

const sans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "go/dsa — Data Structures & Algorithms in Go",
    template: "%s · go/dsa",
  },
  description:
    "A pattern-first field guide to solving algorithmic problems in Go. Recognise the pattern, write the template, solve the problem.",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

const referenceNav = [
  { title: "Problems", href: "/problems" },
  { title: "Go Cheatsheet", href: "/cheatsheet" },
  { title: "Templates", href: "/templates" },
  { title: "Complexity", href: "/complexity" },
  { title: "Find the pattern", href: "/decide" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const patternCategory = Object.fromEntries(
    patterns.map((p) => [p.slug, p.category]),
  );
  const patternNav = [
    { title: "All patterns", href: "/patterns" },
    ...categories.map((c) => ({ title: c.title, href: `/categories/${c.slug}` })),
  ];

  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Shell
          patternNav={patternNav}
          referenceNav={referenceNav}
          patternCategory={patternCategory}
        >
          {children}
        </Shell>
      </body>
    </html>
  );
}
