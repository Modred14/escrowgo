import { Bricolage_Grotesque, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "EscrowGo — Secure deals, verified delivery",
    template: "%s · EscrowGo",
  },
  description:
    "EscrowGo holds payment in escrow until delivery is confirmed by QR scan, protecting both buyers and sellers on every transaction.",
  keywords: ["escrow", "secure payments", "delivery", "Nigeria", "Nomba", "buyer protection"],
  openGraph: {
    title: "EscrowGo — Secure deals, verified delivery",
    description: "Funds stay locked in escrow until delivery is verified. No trust required.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${manrope.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}