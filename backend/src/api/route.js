import { NextResponse } from "next/server";
import { testOpenAI } from "../aiClient";

export async function GET() {
  try {
    const text = await testOpenAI();
    return NextResponse.json({ ok: true, message: text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
