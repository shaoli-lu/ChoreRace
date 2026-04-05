import type { Metadata } from "next";
import { Toaster } from "sonner";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Decision Dash",
  description: "Turn boring decisions into a fast, playful game!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster richColors position="top-center" />
        {children}
        <Footer />
      </body>
    </html>
  );
}
