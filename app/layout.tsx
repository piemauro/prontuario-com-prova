import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  icons: { icon: "/icon.svg" },
  title: "Prontuário com Prova · Cada evento, uma origem",
  description:
    "Três textos. Uma história rastreável. Protótipo para organização documental de saúde com fontes, conflitos e revisão humana.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
