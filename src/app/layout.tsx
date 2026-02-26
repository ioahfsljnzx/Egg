import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "The Eggcellent Adventure",
  description:
    "A glitch-first platformer ARG where an egg escapes the pan and breaks into a hidden vault.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <div className="relative min-h-screen overflow-x-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#a5e8ff_0%,#b5dbff_28%,#cab7ff_65%,#e6acd8_100%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.8)_0px,transparent_36%),radial-gradient(circle_at_80%_24%,rgba(255,255,255,0.65)_0px,transparent_40%),radial-gradient(circle_at_58%_14%,rgba(255,196,245,0.6)_0px,transparent_34%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-8 h-[34vh] origin-bottom [transform:perspective(1100px)_rotateX(73deg)_scale(1.4)] bg-[linear-gradient(to_right,rgba(255,255,255,0.72)_2px,transparent_2px),linear-gradient(to_bottom,rgba(255,255,255,0.72)_2px,transparent_2px)] [background-size:56px_56px] opacity-55" />
          <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 sm:py-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
