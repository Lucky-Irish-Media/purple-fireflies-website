import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = Array.isArray(key) ? key.join("/") : String(key);
  try {
    const { env } = await getCloudflareContext({ async: true });
    const bucket = env.NEWSLETTER_IMAGES;
    const obj = await bucket.get(objectKey);
    if (!obj) {
      return new NextResponse("Not found", { status: 404 });
    }
    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set("etag", obj.httpEtag);
    return new NextResponse(obj.body, { headers });
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    console.error("newsletter image fetch error:", msg);
    return new NextResponse(`Error: ${msg}`, { status: 500 });
  }
}