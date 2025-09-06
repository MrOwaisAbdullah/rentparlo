import type { Metadata } from "next";
export const dynamic = 'force-dynamic';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { CategoryBarWrapper } from "@/components/layout/category-bar-wrapper";
import { Footer } from "@/components/layout/footer";
import { QueryProvider } from "@/components/query-provider";
import { getCurrentUser } from "@/lib/auth-helpers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rentparlo.pk"),
  title: "RentParlo",
  description: "Rent Out Anything, Anywhere, Any Time",
  keywords: ["rent", "parlo", "rentparlo"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <Header user={user} />
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