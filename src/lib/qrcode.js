import QRCodeLib from "qrcode";
import { randomToken } from "@/lib/utils";

export function generateDealCode(dealId) {
  return `EGO-${dealId.slice(-6).toUpperCase()}-${randomToken(10)}`;
}


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
