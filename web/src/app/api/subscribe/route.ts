import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { value } = await req.json();

  if (!value?.trim()) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const ghostCall = fetch("https://gentlefuture.net/members/api/send-magic-link/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: value, emailType: "subscribe" }),
  });

  const apiKey = process.env.RESEND_API_KEY;
  const resendCall = apiKey
    ? fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Homesick <onboarding@resend.dev>",
          to: ["markgny@gmail.com"],
          subject: "New Homesick subscriber",
          html: `<p>${value}</p>`,
        }),
      })
    : Promise.resolve();

  await Promise.all([ghostCall, resendCall]);

  return NextResponse.json({ ok: true });
}
