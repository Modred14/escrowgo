"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner({ onResult, disabled = false }) {
  const scannerRef = useRef(null);
  const html5QrcodeRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (disabled) {
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current
          .stop()
          .then(() => html5QrcodeRef.current.clear())
          .catch(() => {});
      }
      return;
    }

    const elementId = "qr-scanner";
    const qrCodeRegionId = scannerRef.current?.id || elementId;
    const html5Qrcode = new Html5Qrcode(qrCodeRegionId, {
      formatsToSupport: ["QR_CODE"],
    });
    html5QrcodeRef.current = html5Qrcode;

    const config = {
      fps: 10,
      qrbox: { width: 280, height: 280 },
    };

    const onScanSuccess = (decodedText) => {
      if (typeof onResult === "function") {
        onResult(decodedText);
      }
    };

    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (cameras && cameras.length) {
          const cameraId = cameras[0].id;
          html5Qrcode.start(cameraId, config, onScanSuccess).catch((err) => {
            setError("Unable to start camera scanner.");
            console.error(err);
          });
        } else {
          setError("No camera devices found.");
        }
      })
      .catch((err) => {
        setError("Unable to access camera devices.");
        console.error(err);
      });

    return () => {
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current
          .stop()
          .then(() => html5QrcodeRef.current.clear())
          .catch(() => {});
      }
    };
  }, [disabled, onResult]);

  return (
    <div className="space-y-3">
      <div
        id="qr-scanner"
        ref={scannerRef}
        className="h-96 w-full rounded-3xl bg-ink/5"
      />
      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <p className="text-sm text-ink/60">Point your camera at a QR code to scan.</p>
      )}
    </div>
  );
}
