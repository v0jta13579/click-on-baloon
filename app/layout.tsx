import type { Metadata, Viewport } from "next"
import { Fredoka } from "next/font/google"
import "./globals.css"

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin", "latin-ext"],
})

export const metadata: Metadata = {
  title: "Balónky – hra na praskání balónků",
  description:
    "Praskej barevné balónky, plň úkoly v levelech, chytej bronzové, stříbrné a zlaté bonusy a překonej svůj rekord.",
}

export const viewport: Viewport = {
  themeColor: "#38bdf8",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={`${fredoka.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
