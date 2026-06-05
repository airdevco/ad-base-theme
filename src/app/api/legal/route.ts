import { NextRequest, NextResponse } from "next/server";
import { mockLegalPages } from "@/mock/legal";

export async function GET() {
  return NextResponse.json(mockLegalPages);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, content } = body as {
    id: string;
    content: string;
  };

  if (!id || !content) {
    return NextResponse.json(
      { error: "Missing id or content" },
      { status: 400 }
    );
  }

  const page = mockLegalPages.find((p) => p.id === id);
  if (!page) {
    return NextResponse.json(
      { error: "Page not found" },
      { status: 404 }
    );
  }

  // In production this would persist to a database
  page.content = content;
  page.updatedAt = new Date().toISOString();

  return NextResponse.json({ success: true });
}
