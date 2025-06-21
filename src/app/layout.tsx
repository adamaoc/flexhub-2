import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlexHub CMS",
  description: "Secure, invite-based content management system",
};

// --- ClientLayout for SessionProvider ---
// This must be a client component
import ClientLayout from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <ClientLayout>{children}</ClientLayout>
        </SidebarProvider>
      </body>
    </html>
  );
}
