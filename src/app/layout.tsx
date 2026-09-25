import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Student Manager — Portal",
  description: "Modern, minimal academic administration & student records portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0b0f17] text-slate-100 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
