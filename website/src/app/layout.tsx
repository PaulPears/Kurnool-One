import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Kurnool One (కర్నూలు వన్) | Official City Business Directory & Local Services",
  description: "Find verified restaurants, biryani spots, hospitals, doctors, skilled electricians, plumbers, tourist places, and exclusive discounts across Kurnool City, Andhra Pradesh.",
  keywords: [
    "Kurnool",
    "Kurnool One",
    "Kurnool Business Directory",
    "Restaurants in Kurnool",
    "Konda Reddy Buruju",
    "Orvakal Rock Garden",
    "Electricians in Kurnool",
    "Doctors in Kurnool",
    "Rayalaseema Food",
  ],
  metadataBase: new URL("https://kurnoolone.com"),
  openGraph: {
    title: "Kurnool One | Digital City Directory & Services",
    description: "The official private digital platform for Kurnool City, connecting residents with verified local businesses and services.",
    url: "https://kurnoolone.com",
    siteName: "Kurnool One",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
