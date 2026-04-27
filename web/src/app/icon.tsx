import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

const SIGH_PATH = "public/assets/freepik__small-retru-device-with-soft-diffused-light-coming__23594 2.png";

export default async function Icon() {
  const sighBytes = await readFile(join(process.cwd(), SIGH_PATH));
  const sighSrc = `data:image/png;base64,${sighBytes.toString("base64")}`;

  // The source PNG is 1042x1042 with the device in the upper-left ~50%.
  // Render at 800x800 inside a 512x512 canvas and offset so the device
  // (centered around 50%, 44% of the source) lands at the canvas center.
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
          width={650}
          height={650}
          style={{
            position: "absolute",
            left: -90,
            top: -50,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
