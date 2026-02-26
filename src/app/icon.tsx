import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b1116",
        }}
      >
        <div
          style={{
            width: 18,
            height: 22,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            borderRadius: 999,
            background: "#f7f8fb",
            border: "1px solid #d2dae8",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              display: "block",
              borderRadius: 999,
              background: "#f2c14f",
              position: "absolute",
              left: 6,
              top: 9,
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
