import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "China Travel Agent - Your Digital Local Guide in China",
  description:
    "A context-aware digital local guide for foreign travelers in China. Prepare your apps before departure, understand what is around you, solve travel problems, and connect with a real local guide.",
  keywords: [
    "China travel agent",
    "China local guide",
    "AI travel assistant China",
    "China travel apps",
    "China menu translation",
    "China travel preparation",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "China Agent",
  },
};

export const viewport: Viewport = {
  themeColor: "#13120f",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
