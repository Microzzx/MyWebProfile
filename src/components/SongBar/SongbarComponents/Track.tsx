"use client";
import React from "react";
import { usePlayerStore } from "@/feature/player/store";
import WaveText from "@/components/WaveText/WaveText";

type Props = {
  width?: number;
  height?: number;
  className?: string;
  /** Show song title + now playing text below the art (desktop sidebar) */
  showInfo?: boolean;
};

const Track = ({ width = 48, height = 48, className, showInfo = false }: Props) => {
  const { songList, activeSong, isPlaying } = usePlayerStore();
  if (!songList || !songList[activeSong]) return null;

  const currentTrack = songList[activeSong];

  return (
    <div className={`flex flex-col items-center gap-3 ${className ?? ""}`}>
      {/* Album art — spins while playing */}
      <div
        style={{ width, height }}
        className={`
          rounded-full overflow-hidden flex-shrink-0
          ring-1 ring-white/10
          animate-[spin_8s_linear_infinite]
          ${!isPlaying ? "[animation-play-state:paused]" : ""}
        `}
      >
        <img
          src={currentTrack.image}
          alt={currentTrack.title}
          className="w-full h-full rounded-full object-cover"
          draggable={false}
        />
      </div>

      {/* Optional info block — shown only in full desktop bar */}
      {showInfo && (
        <div className="w-full text-center text-xs font-medium text-white/80 truncate px-1">
          {isPlaying ? (
            <WaveText text={`Now playing · ${currentTrack.title}`} />
          ) : (
            <span className="text-white/40">Paused</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Track;
