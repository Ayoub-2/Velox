import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StackProvider } from "@/lib/stack-context";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "Velox - Security by Design Knowledge Base",
  description: "Comprehensive security patterns and DAST orchestration for modern engineering teams. Shift left on security with developer-friendly guidance.",
  keywords: ["security", "knowledge base", "DAST", "security patterns", "application security"],
  openGraph: {
    title: "Velox - Security by Design",
    description: "Security Knowledge Base and DAST Orchestrator",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-900 text-white`}>
        <StackProvider>
          <Navbar />
          <div className="flex-grow pt-16">
            {children}
          </div>
          <Footer />
        </StackProvider>
      </body>
    </html>
  );
}
