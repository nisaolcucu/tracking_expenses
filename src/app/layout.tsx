import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fisly | Akıllı Fiş & Harcama Takibi",
  description: "Yapay zeka ile fişlerinizi saniyeler içinde tarayın, harcamalarınızı ve aboneliklerinizi yönetin, birikim hedeflerinize Fisly ile ulaşın.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

import { Providers } from "./providers";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try {
              const t = localStorage.getItem('theme');
              if (t === 'light') {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
              } else {
                document.documentElement.classList.add('dark');
              }
            } catch (e) {}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
