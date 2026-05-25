import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NBAI Intranet",
  description: "NBAI Digital Workers documentation intake portal",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
