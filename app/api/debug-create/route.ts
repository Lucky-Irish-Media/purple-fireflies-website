import { NextResponse } from "next/server";
import { createNewsletterAction } from "@/app/actions/newsletter";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const result = await createNewsletterAction(undefined as any, formData);
    console.error("debug-create result:", JSON.stringify(result));
    return NextResponse.json(result);
  } catch (e) {
    console.error("debug-create exception:", e);
    return NextResponse.json({ error: String(e), stack: (e as Error)?.stack }, { status: 500 });
  }
}