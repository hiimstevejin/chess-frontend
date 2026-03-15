import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_BASE_URL =
  process.env.BACKEND_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000";

export async function GET(request: NextRequest) {
  const params = new URLSearchParams();
  const page = request.nextUrl.searchParams.get("page");
  const limit = request.nextUrl.searchParams.get("limit") ?? "24";
  const minRating = request.nextUrl.searchParams.get("min_rating");
  const maxRating = request.nextUrl.searchParams.get("max_rating");

  params.set("limit", limit);
  if (page) params.set("page", page);
  if (minRating) params.set("min_rating", minRating);
  if (maxRating) params.set("max_rating", maxRating);

  try {
    const response = await fetch(
      `${BACKEND_API_BASE_URL}/api/puzzles?${params.toString()}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend request failed with ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach backend.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
