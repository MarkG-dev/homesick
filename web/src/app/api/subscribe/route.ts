import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { type, value, message } = await req.json();

  if (!value?.trim()) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (type === "contact") {
    // Personal note → email to markgny@gmail.com
    if (apiKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Homesick <onboarding@resend.dev>",
          to: ["markgny@gmail.com"],
          subject: `Homesick — message from ${value}`,
          html: `<p><strong>From:</strong> ${value}</p><p>${message ?? "(no message)"}</p>`,
        }),
      });
    }
  } else {
    // Newsletter signup → Ghost magic link + Resend notification
    const ghostCall = fetch("https://gentlefuture.net/members/api/send-magic-link/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: value, emailType: "subscribe" }),
    });

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
  }

  return NextResponse.json({ ok: true });
}
