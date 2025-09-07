import type { Metadata } from "next";
export const dynamic = 'force-dynamic';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { ConditionalCategoryBar } from "@/components/layout/conditional-category-bar";
import { Footer } from "@/components/layout/footer";
import { QueryProvider } from "@/components/query-provider";
import { getCurrentUser } from "@/lib/auth-helpers";
import { SavedItemsProvider } from "@/contexts/SavedItemsContext";
import { MobileBanner } from "@/components/ads/mobile-banner";
import { BannerProvider } from "@/contexts/banner-context";

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
          <BannerProvider>
            <SavedItemsProvider>
              <Header user={user} />
              <ConditionalCategoryBar />
              {children}
              <Footer />
              <MobileBanner />
            </SavedItemsProvider>
          </BannerProvider>
        </QueryProvider>
      </body>
    </html>
  );
}