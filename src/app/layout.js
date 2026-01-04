import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kickoff Kits | Premium Jerseys in Bangladesh",
  description: "Buy authentic player version and fan version football jerseys. Fast delivery in Dhaka and nationwide. Cash on delivery available.",
  keywords: "football jersey bd, argentina jersey bd, kickoff kits, messi jersey, online jersey shop bangladesh",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}