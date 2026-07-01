import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'scheduling — 予約ページをURLで即公開',
  description:
    'URLを渡すだけで予約枠を即公開できるOSSスケジューラー。Calendlyの無料オープンソース代替。',
  openGraph: {
    title: 'scheduling',
    description: '予約ページをURLで即公開。Calendlyの無料OSSオルタナティブ。',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
