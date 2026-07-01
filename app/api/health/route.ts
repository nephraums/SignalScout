import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    product: "SignalScout",
    timestamp: new Date().toISOString()
  });
}
