import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Define Inter font with all required weights
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Metadata
export const metadata: Metadata = {
  title: "Social",
  description: "A social media app",
};

// RootLayout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-dark-1 text-light-1">
        {children}
      </body>
    </html>
  );
}
