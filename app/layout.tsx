import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HeaderWrapper } from "@/components/layout/header-wrapper";
import { CategoryBarWrapper } from "@/components/layout/category-bar-wrapper";
import { Footer } from "@/components/layout/footer";
import { QueryProvider } from "@/components/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RentParlo",
  description: "Rent Out Anything, Anywhere, Any Time",
  keywords: ["rent", "parlo", "rentparlo"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <HeaderWrapper />
          <div className="sticky top-0 z-50">
            <CategoryBarWrapper />
          </div>
          {children}
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}