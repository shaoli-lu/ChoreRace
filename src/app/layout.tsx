import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chore Race",
  description: "Turn boring decisions into a fast, playful race!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
