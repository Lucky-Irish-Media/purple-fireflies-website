import { getMediaObject, isServableMediaKey } from "@/app/lib/media";

/**
 * Public, read-only image route for Community Pet Fund photos.
 *
 * Keys are content-addressed by a UUID, so an object at a given key never
 * changes. That is what makes the year-long immutable cache safe: replacing a
 * photo writes a new key, and the old key is deleted.
 *
 * `middleware.ts` excludes `/api` from its matcher, so this route is reachable
 * without a session by design. There is no write method here.
 */
export const dynamic = "force-dynamic";

function notFound(): Response {
  return new Response("Not found", { status: 404 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = key.join("/");

  if (!isServableMediaKey(objectKey)) {
    return notFound();
  }

  const object = await getMediaObject(objectKey);
  if (!object) {
    return notFound();
  }

  const headers = new Headers({
    "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  });

  if (object.httpEtag) {
    headers.set("ETag", object.httpEtag);
  }
  if (object.size) {
    headers.set("Content-Length", String(object.size));
  }

  return new Response(object.body, { headers });
}
