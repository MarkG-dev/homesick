import { NextRequest, NextResponse } from "next/server";

const FROM = "Homesick <hello@homesick.dev>";
const NOTIFY = "markgny@gmail.com";

async function sendEmail(apiKey: string, to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body}`);
  }
}

export async function POST(req: NextRequest) {
  const { type, value, message } = await req.json();

  if (!value?.trim()) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "misconfigured" }, { status: 500 });
  }

  try {
    if (type === "contact") {
      await sendEmail(
        apiKey,
        NOTIFY,
        `Homesick — message from ${value}`,
        `<p><strong>From:</strong> ${value}</p><p>${message ?? "(no message)"}</p>`
      );
    } else {
      // Newsletter: Ghost magic-link + admin notification
      await Promise.all([
        fetch("https://gentlefuture.net/members/api/send-magic-link/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: value, emailType: "subscribe" }),
        }),
        sendEmail(apiKey, NOTIFY, "New Homesick subscriber", `<p>${value}</p>`),
      ]);
    }
  } catch (err) {
    console.error("[subscribe]", err);
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
