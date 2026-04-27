import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

const SIGH_PATH = "public/assets/freepik__small-retru-device-with-soft-diffused-light-coming__23594 2.png";

export default async function Icon() {
  const sighBytes = await readFile(join(process.cwd(), SIGH_PATH));
  const sighSrc = `data:image/png;base64,${sighBytes.toString("base64")}`;

  // The source PNG is 1042x1042; the device center sits at ~57% horizontal,
  // ~50% vertical. Render at 760x760 so the device fills ~89% of the 512
  // canvas, with offsets that land its center at canvas center.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000",
          display: "flex",
          overflow: "hidden",
        }}
      >
        <img
          src={sighSrc}
          alt=""
          width={760}
          height={760}
          style={{
            position: "absolute",
            left: -177,
            top: -124,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
