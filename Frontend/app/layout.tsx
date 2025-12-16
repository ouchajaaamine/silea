import type React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { TranslationProvider } from "@/lib/translation-context"
import { CategoryDialogProvider } from "@/lib/category-dialog-context"
import PageTransition from "@/components/page-transition"
import ThikrNotification from "@/components/thikr-notification"
import { Almarai, Tajawal } from "next/font/google"
import { headers } from "next/headers"
import "./globals.css"

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  display: "swap",
})

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Silea – Pure Treasures from Beni Mellal",
  description:
    "Discover authentic Moroccan honey and mountain oils sourced directly from the mountains of Beni Mellal. Premium natural products for wellness and culinary excellence.",
  keywords: "Moroccan honey, mountain oils, Beni Mellal, natural products, olive oil, argan oil, thyme honey, organic",
  authors: [{ name: "Silea" }],
  creator: "Silea",
  openGraph: {
    title: "Silea – Pure Treasures from Beni Mellal",
    description: "Authentic Moroccan natural products sourced from the mountains. Premium honey and oils crafted with tradition.",
    type: "website",
    locale: "en_US",
    siteName: "Silea",
  },
  twitter: {
    card: "summary_large_image",
    title: "Silea – Pure Treasures from Beni Mellal",
    description: "Authentic Moroccan natural products sourced from the mountains.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: "#556B2F",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth" dir="ltr">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${almarai.variable} ${tajawal.variable} antialiased min-h-screen`}>
        <AdminWrapper>
          <AuthProvider>
            <CartProvider>
              <ThikrNotification />
              <PageTransition>
                {children}
              </PageTransition>
            <Toaster 
              position="top-right"
              duration={1000}
              toastOptions={{
                style: {
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(85, 107, 47, 0.2)',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                  animation: 'slideInRight 0.3s ease-out, fadeOut 0.2s ease-in 0.8s',
                },
                classNames: {
                  success: 'border-l-4 !border-l-[#556B2F]',
                  error: 'border-l-4 !border-l-red-500',
                  info: 'border-l-4 !border-l-[#D6A64F]',
                },
              }}
            />
            </CartProvider>
          </AuthProvider>
        </AdminWrapper>
        <Analytics />
      </body>
    </html>
  )
}

// Wrapper to conditionally apply TranslationProvider and CategoryDialogProvider
function AdminWrapper({ children }: { children: React.ReactNode }) {
  'use client'
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isAdmin = pathname.startsWith('/admin')
  
  if (isAdmin) {
    return <>{children}</>
  }
  
  return (
    <TranslationProvider>
      <CategoryDialogProvider>
        {children}
      </CategoryDialogProvider>
    </TranslationProvider>
  )
}
