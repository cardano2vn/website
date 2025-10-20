// "use client";
import Footer from "~/components/footer";
// import dynamic from "next/dynamic";
// const Header = dynamic(() => import("~/components/header"), { ssr: false });


// seo basic -- start
import Header from "~/components/header";
import BackToTop from "~/components/ui/BackToTop";
import BackToBottom from "~/components/ui/BackToBottom";
// import LightBulbScene from "~/components/ui/LightBulbScene";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to Cardano2VN - Vietnam's premier blockchain innovation hub. Discover Cardano ecosystem development, smart contracts, and decentralized applications.",
  keywords: ["Cardano Vietnam", "blockchain development", "smart contracts", "DeFi", "Cardano ecosystem", "Vietnam blockchain"],
  openGraph: {
    title: "Cardano2VN - Vietnam's Blockchain Innovation Hub",
    description: "Welcome to Cardano2VN - Vietnam's premier blockchain innovation hub. Discover Cardano ecosystem development, smart contracts, and decentralized applications.",
    url: "https://cardano2vn.io",
    images: [
      {
        url: "/images/og-home.png",
        width: 1200,
        height: 630,
        alt: "Cardano2VN Homepage",
      },
    ],
  },
  twitter: {
    title: "Cardano2VN - Vietnam's Blockchain Innovation Hub",
    description: "Welcome to Cardano2VN - Vietnam's premier blockchain innovation hub. Discover Cardano ecosystem development, smart contracts, and decentralized applications.",
  },
};
// seo basic -- end
export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-white relative">
        {/* <LightBulbScene /> */}
        <Header />
        <div>{children}</div>
        <Footer />
        <BackToTop />
        <BackToBottom />
      </div>
    </div>
  );
}
