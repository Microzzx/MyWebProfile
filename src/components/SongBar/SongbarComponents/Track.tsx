"use client";
import React from "react";
import { usePlayerStore } from "@/feature/player/store";
import styles from "@/styles/songBar.module.css";
import WaveText from "@/components/WaveText/WaveText";

type Props = {
  width?: number;
  height?: number;
  className?: string;
};

const Track = ({ width = 64, height = 64, className }: Props) => {
  const { songList, activeSong, isPlaying } = usePlayerStore();
  if (!songList || !songList[activeSong]) return null;
  const currentTrack = songList[activeSong];
  return (
    <div
      style={{ width, height }}
      className={`flex flex-col items-center gap-4 ${className}`}
    >
      <div
        className={`h-16 w-16 rounded-full overflow-hidden animate-[spin_6s_linear_infinite] 
          ${!isPlaying ? "[animation-play-state:paused]" : ""}`}
      >
        <img
          src={currentTrack.image}
          alt={currentTrack.title}
          className="rounded-full"
        />
      </div>

      <div className="hidden lg:flex flex-col gap-3 w-60">
        <div
          className={`text-center text-white font-bold text-xs ${styles["songbar-text"]}`}
        >
          {isPlaying ? (
            <WaveText text={`Now playing - ${currentTrack.title}`} />
          ) : (
            <span>Paused</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Track;
