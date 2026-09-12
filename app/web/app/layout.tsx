import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ProveedorTema } from "@/components/tema";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// The nova style reads the UI font from --font-sans (app/globals.css).
const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Print.ai · Panel de Printos",
  description: "La cola de pedidos de Printos: la IA propone, una persona confirma.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <body className="antialiased">
        <ProveedorTema>
          {children}
          <Toaster richColors position="bottom-right" />
        </ProveedorTema>
      </body>
    </html>
  );
}
