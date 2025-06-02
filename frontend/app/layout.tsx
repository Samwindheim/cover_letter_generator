import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from "../components/ui/toaster"

export const metadata: Metadata = {
  title: 'Cover Letter Generator',
  description: '',
  generator: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
