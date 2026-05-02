import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { type, value } = await req.json();

  if (!value?.trim()) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;

  if (apiKey && to) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Homesick <onboarding@resend.dev>",
        to: [to],
        subject: `New Homesick follower — ${type}`,
        html: `<p><strong>${type}:</strong> ${value}</p>`,
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
