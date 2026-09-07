import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Peta Interaktif Resort | The Highland Park Resort - Hotel Bogor",
  description:
    "Eksplorasi seluruh fasilitas, villa camp, wahana outbound, restoran, dan area rekreasi di The Highland Park Resort - Hotel Bogor secara interaktif 3D.",
  keywords: [
    "Highland Park Resort Bogor",
    "Peta Resort Bogor",
    "Glamping Bogor",
    "Mongolian Camp",
    "Apache Camp",
    "Waterboom Bogor",
    "Peta Interaktif",
  ],
  authors: [{ name: "The Highland Park Resort Hotel Bogor" }],
  openGraph: {
    title: "Peta Interaktif Resort | The Highland Park Resort - Hotel Bogor",
    description:
      "Denah & Peta 3D Interaktif The Highland Park Resort Hotel Bogor dengan 86 titik lokasi fasilitas lengkap.",
    images: [{ url: "/maps-area.png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="font-sans antialiased selection:bg-gold-500 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
