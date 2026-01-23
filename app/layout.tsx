import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Teardown - Reverse-engineer any SaaS in 60 seconds",
  description: "Free tool to analyze any SaaS website. Detect tech stack, scrape pricing pages, audit SEO, and estimate build time. No signup required.",
  keywords: ["saas analysis", "tech stack detector", "competitor analysis", "seo audit tool", "saas teardown", "reverse engineer", "pricing analysis"],
  authors: [{ name: "Teardown" }],
  openGraph: {
    title: "Teardown - Reverse-engineer any SaaS in 60 seconds",
    description: "Free tool to analyze any SaaS website. Detect tech stack, scrape pricing pages, audit SEO, and estimate build time.",
    url: "https://teardown.dev",
    siteName: "Teardown",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Teardown - Reverse-engineer any SaaS in 60 seconds",
    description: "Free tool to analyze any SaaS website. Detect tech stack, scrape pricing pages, audit SEO, and estimate build time.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
