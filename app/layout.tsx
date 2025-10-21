import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Chatbot from "@/components/Chatbot";

export const metadata: Metadata = {
  title: "SEES - Student Enrollment & Evaluation System",
  description: "Academic management platform for university IT degree programs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        {children}
        <Toaster />
        <Chatbot />
      </body>
    </html>
  );
}
