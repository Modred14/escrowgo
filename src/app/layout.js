import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    default: "EscrowGO — Secure deals, verified delivery",
    template: "%s · EscrowGO",
  },
  description:
    "EscrowGO holds payment in escrow until delivery is confirmed by QR scan, protecting both buyers and sellers on every transaction.",
  keywords: [
    "escrow",
    "secure payments",
    "delivery",
    "Nigeria",
    "Nomba",
    "buyer protection",
  ],
  openGraph: {
    title: "EscrowGO — Secure deals, verified delivery",
    description:
      "Funds stay locked in escrow until delivery is verified. No trust required.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} ${mono.variable}`}
    >
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
