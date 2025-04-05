import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Navigation } from "~/app/_components/navigation";

export const metadata: Metadata = {
  title: "Project Y",
  description: "Your personal wardrobe assistant",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="bg-black text-white min-h-screen">
        <TRPCReactProvider>
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
