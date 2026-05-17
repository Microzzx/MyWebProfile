import { ReactNode } from "react";
import { LayoutProps } from "@/types/types";
import VideoBox from "../VideoBox";
import NavBar from "../NavBar/NavBar";
import SongBar from "../SongBar/SongBar";
import SongBar2 from "../SongBar2/SongBar2";
export default function MainLayout({ children }: LayoutProps) {
  return (
    <>
      <NavBar className="z-50" />
      {/* <SongBar className="z-40" /> */}
      <SongBar2 className="z-40" />
      <VideoBox className="z-0" />
      <div className="relative p-10 pt-[120px] pb-20">{children}</div>
    </>
  );
}
