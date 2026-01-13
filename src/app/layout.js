import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

// --- THIS IS THE SEO & SOCIAL MEDIA CONFIG ---
export const metadata = {
  // 1. The URL of your deployed site (Change this if you get a .com domain later)
  metadataBase: new URL('https://kickoff-kits.vercel.app'), 

  // 2. Browser Tab Title
  title: 'Kickoff Kits | Premium Jerseys in BD',
  
  // 3. Google Search Description
  description: 'The best player version and fan version jerseys in Bangladesh. Cash on delivery available nationwide.',

  // 4. Social Media Previews (WhatsApp, Facebook, etc.)
  openGraph: {
    title: 'Kickoff Kits - Wear Your Passion',
    description: 'Premium quality jerseys delivered to your doorstep. Order now!',
    url: 'https://kickoff-kits.vercel.app',
    siteName: 'Kickoff Kits',
    images: [
      {
        url: '/hero-bg.jpg', // We are reusing your hero image as the preview!
        width: 1200,
        height: 630,
        alt: 'Kickoff Kits Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}