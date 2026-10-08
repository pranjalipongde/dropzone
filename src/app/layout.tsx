import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import StoreInitializer from "@/components/ui/StoreInitializer";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "DropZone — Streetwear Drops",
  description: "Limited drops, unlimited style.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body
        suppressHydrationWarning
        className="font-body bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 antialiased"
      >
        <StoreInitializer />
        {children}
      </body>
    </html>
  );
}
