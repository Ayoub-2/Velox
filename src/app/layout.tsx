import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Velox - Security by Design",
  description: "Security Knowledge Base and DAST Orchestrator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-900 text-white`}>
        <Navbar />
        <div className="flex-grow pt-16">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
