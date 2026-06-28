import QRCodeLib from "qrcode";
import { randomToken } from "@/lib/utils";

/**
 * Generates a unique opaque token for a deal's release QR code.
 * The token itself carries no readable data — verification happens
 * server-side by looking it up against the QRCode table.
 */
export function generateDealCode(dealId) {
  return `EGO-${dealId.slice(-6).toUpperCase()}-${randomToken(10)}`;
}

/**
 * Renders a QR code as a data URL (PNG) for the given code string.
 */
export async function renderQrDataUrl(code) {
  return QRCodeLib.toDataURL(code, {
    margin: 2,
    width: 320,
    color: {
      dark: "#0E1A17",
      light: "#F3F5F2",
    },
  });
}