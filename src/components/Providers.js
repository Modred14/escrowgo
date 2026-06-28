"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#0E1A17",
            color: "#F3F5F2",
            border: "1px solid #22362D",
            borderRadius: "10px",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#4FD1AE", secondary: "#0E1A17" } },
          error: { iconTheme: { primary: "#B23B3B", secondary: "#0E1A17" } },
        }}
      />
    </SessionProvider>
  );
}