import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HospitalProvider } from "@/context/HospitalContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MedCare EHR - ABDM Hospital System",
  description: "Next.js ABHA/ABDM Compliant Hospital Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <HospitalProvider>{children}</HospitalProvider>
      </body>
    </html>
  );
}