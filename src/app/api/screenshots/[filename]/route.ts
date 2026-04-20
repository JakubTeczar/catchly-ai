import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Zabezpieczenie przed path traversal
  const safe = path.basename(filename);
  if (!safe.match(/^[a-z0-9_-]+\.(jpg|jpeg|png|webp)$/i)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filepath = path.join(process.cwd(), "public", "screenshots", safe);

  try {
    const file = await readFile(filepath);
    const ext = safe.split(".").pop()?.toLowerCase();
    const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
