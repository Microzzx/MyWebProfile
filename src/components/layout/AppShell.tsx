import type { PropsWithChildren } from "react";
import BackgroundVideo from "./BackgroundVideo";
import SiteHeader from "./SiteHeader";
import FloatingPlayer from "@/features/player/components/FloatingPlayer";

export default function AppShell({ children }: PropsWithChildren) {
  return (
    <>
      <SiteHeader className="z-50" />
      <FloatingPlayer className="z-40" />
      <BackgroundVideo className="z-0" />
      <main className="relative mx-auto max-w-6xl px-4 pb-28 pt-[108px] sm:px-6 sm:pt-[116px]">
        {children}
      </main>
    </>
  );
}
