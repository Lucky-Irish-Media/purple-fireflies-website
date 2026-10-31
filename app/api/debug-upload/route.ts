import { NextResponse } from "next/server";
import { uploadNewsletterImageAction } from "@/app/actions/newsletter";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const result = await uploadNewsletterImageAction(formData);
    console.error("debug-upload result:", JSON.stringify(result));
    return NextResponse.json(result);
  } catch (e) {
    console.error("debug-upload exception:", e);
    return NextResponse.json({ error: String(e), stack: (e as Error)?.stack }, { status: 500 });
  }
}