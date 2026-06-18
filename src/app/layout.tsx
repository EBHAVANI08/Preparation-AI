import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Preparation AI — AI Educational Operating System",
  description: "11 specialised AI agents for exam prep, university admissions, scholarships and career coaching. Real exam patterns, AI-generated mock papers, syllabus weightage, and YouTube fixes for every weak topic.",
  keywords: ["JEE", "NEET", "GRE", "GMAT", "GATE", "UPSC", "SAT", "IELTS", "TOEFL", "CAT", "AI mock exam", "exam coach", "study abroad", "scholarships"],
  authors: [{ name: "Preparation AI" }],
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "Preparation AI — AI Educational Operating System",
    description: "Crack any exam with 11 specialised AI agents working for you 24/7.",
    siteName: "Preparation AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Preparation AI",
    description: "AI-powered competitive exam coaching with real exam patterns.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
