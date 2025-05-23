import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/components/context/UserContext";
import MessageModalProvider from "@/components/MessageModalProvider";
import { MessagesProvider } from "@/components/context/MessagesContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ünit Rezervasyon Sistemi",
  description: "Diş Hekimliği Fakültesi Ünit Rezervasyon Sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Sunucu tarafı için pathname ve cookie kontrolü
  const pathname =
    typeof window === "undefined" ? "" : window.location.pathname;
  const isPublic =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  // Eğer public sayfa ise provider'lar olmadan render et
  if (isPublic) {
    return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    );
  }
  // Diğer tüm sayfalarda provider'lar ile sarmala
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <MessagesProvider>
            {children}
            <MessageModalProvider />
          </MessagesProvider>
        </UserProvider>
      </body>
    </html>
  );
}
