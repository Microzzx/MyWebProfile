import { LayoutProps } from "@/types/types";
import VideoBox from "../VideoBox";
import NavBar from "../NavBar/NavBar";
import SongBar from "../SongBar/SongBar";
export default function MainLayout({ children }: LayoutProps) {
  return (
    <>
      <NavBar className="z-50" />
      <SongBar className="z-40" />
      <VideoBox className="z-0" />
      <main className="relative mx-auto max-w-6xl px-4 pb-28 pt-[108px] sm:px-6 sm:pt-[116px]">
        {children}
      </main>
    </>
  );
}
