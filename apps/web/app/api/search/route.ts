import { NextRequest, NextResponse } from "next/server";

import { searchQuran } from "@/lib/quran-data";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const limit = request.nextUrl.searchParams.get("limit") ?? undefined;
  const results = await searchQuran(query, limit);

  return NextResponse.json({
    query,
    total: results.length,
    results,
  });
}
