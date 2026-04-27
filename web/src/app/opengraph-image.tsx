import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Homesick — building magical objects";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SIGH_PATH = "public/assets/freepik__small-retru-device-with-soft-diffused-light-coming__23594 2.png";
const FONT_PATH = "src/app/fonts/PilatTest-Demi.otf";

export default async function Image() {
  const [sighBytes, fontBytes] = await Promise.all([
    readFile(join(process.cwd(), SIGH_PATH)),
    readFile(join(process.cwd(), FONT_PATH)),
  ]);
  const sighSrc = `data:image/png;base64,${sighBytes.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000",
          display: "flex",
          alignItems: "center",
          padding: "80px",
          fontFamily: "Pilat",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            color: "#fff",
            fontSize: 104,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          building magical objects
        </div>
        <img
          src={sighSrc}
          alt=""
          width={520}
          height={520}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pilat", data: fontBytes, style: "normal", weight: 600 },
      ],
    },
  );
}
