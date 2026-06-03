import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/layout/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Educamagics – Reforç escolar d'estiu",
  description: "Connectem nens amb professors particulars en remot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ca">
      <head>
        {/* Això injecta Tailwind a la força sense passar pel teu ordinador */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}