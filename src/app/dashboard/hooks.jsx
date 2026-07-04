"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export function useCountUp(
  target,
  { duration = 1400, start = false, decimals = 0 } = {},
) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    function tick(now) {
      const p = Math.min((now - t0) / duration, 1);
      setValue(target * ease(p));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [start, target, duration]);

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value);
}

export function formatNaira(n) {
  return "₦" + " " + Math.round(n).toLocaleString("en-NG");
}

export const C = {
  ink: "#16130D",
  inkSoft: "#221C13",
  inkFaint: "#3A3122",
  cream: "#FBF7EF",
  surface: "#FFFFFF",
  gold: "#FEC417",
  goldSoft: "#FCDD83",
  goldDeep: "#AA8109",
  green: "#1F9D55",
  greenSoft: "#E7F5EC",
  red: "#D64545",
  redSoft: "#FBEAEA",
  textMuted: "#8A8171",
  line: "#ECE5D6",
};
