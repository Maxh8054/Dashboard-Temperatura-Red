import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Analise Alarme e Temperatura ZA",
  description: "Dashboard para análise de alarmes e temperatura industrial. Importe dados Excel e visualize métricas em tempo real.",
  keywords: ["Alarmes", "Temperatura", "Dashboard", "Industrial", "Monitoramento", "ZA"],
  authors: [{ name: "ZA Team" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Analise Alarme e Temperatura ZA",
    description: "Dashboard para análise de alarmes e temperatura industrial",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Analise Alarme e Temperatura ZA",
    description: "Dashboard para análise de alarmes e temperatura industrial",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
