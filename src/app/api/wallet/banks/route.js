// src/app/api/wallet/banks/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchBanks } from "@/lib/nomba";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const banks = await fetchBanks();
    return NextResponse.json({ banks });
  } catch (err) {
    console.error("[wallet/banks] failed to fetch banks", err);
    return NextResponse.json(
      { error: "Couldn't load the list of banks. Please try again." },
      { status: 502 },
    );
  }
}