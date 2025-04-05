/**
 * Root layout component for the application.
 * This file defines the base HTML structure, global styles, and providers.
 * It includes:
 * - Global CSS imports
 * - Metadata configuration
 * - Font setup (Geist)
 * - tRPC provider for API calls
 * - Navigation component
 * - Main content container
 */

// Import global styles
import "~/styles/globals.css";

// Import necessary types and components
import { type Metadata } from "next";
import { Geist } from "next/font/google";

// Import custom providers and components
import { TRPCReactProvider } from "~/trpc/react";
import { Navigation } from "~/app/_components/navigation";

// Define metadata for the application
export const metadata: Metadata = {
  title: "Project Y", // Application title
  description: "Your personal wardrobe assistant", // Application description
  icons: [{ rel: "icon", url: "/favicon.ico" }], // Favicon configuration
};

// Initialize Geist font with specific configuration
const geist = Geist({
  subsets: ["latin"], // Use Latin character subset
  variable: "--font-geist-sans", // CSS variable name for the font
});

// Root layout component that wraps the entire application
export default function RootLayout({
  children, // React children components
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // HTML root with language and font class
    <html lang="en" className={`${geist.variable}`}>
      {/* Body with dark theme styling */}
      <body className="bg-black text-white min-h-screen">
        {/* tRPC provider for API calls */}
        <TRPCReactProvider>
          {/* Navigation component */}
          <Navigation />
          {/* Main content area with container styling */}
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
