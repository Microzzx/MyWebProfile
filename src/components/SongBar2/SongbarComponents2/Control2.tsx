"use client";
import React from "react";
import { MdSkipNext, MdSkipPrevious } from "react-icons/md";
import { BsFillPauseFill, BsFillPlayFill } from "react-icons/bs";
import { usePlayerStore } from "@/feature/player/store";

type ControlProps = {
  handlePlayPause: () => void;
  handleNextSong: () => void;
  handlePrevSong: () => void;
};

const Control: React.FC<ControlProps> = ({
  handlePlayPause,
  handleNextSong,
  handlePrevSong,
}) => {
  const { songList, isPlaying } = usePlayerStore();

  const iconBtn =
    "flex items-center justify-center p-2 rounded-xl text-white/40 hover:text-white/90 hover:bg-white/8 transition-all cursor-pointer";

  return (
    <div className="flex items-center gap-1">
      {/* Prev — hidden on mobile, parent controls visibility */}
      <div className="hidden lg:flex">
        {songList?.length && (
          <button
            aria-label="Previous song"
            onClick={handlePrevSong}
            className={iconBtn}
          >
            <MdSkipPrevious size={22} />
          </button>
        )}
      </div>

      {/* Play / Pause — primary action, violet pill */}
      <button
        aria-label={isPlaying ? "Pause" : "Play"}
        onClick={handlePlayPause}
        className="
          flex items-center justify-center
          w-10 h-10 rounded-xl
          bg-violet-500 hover:bg-violet-400
          active:scale-95
          text-white
          transition-all cursor-pointer
          shadow-lg shadow-violet-900/40
        "
      >
        {isPlaying ? <BsFillPauseFill size={18} /> : <BsFillPlayFill size={18} />}
      </button>

      {/* Next — hidden on mobile */}
      <div className="hidden lg:flex">
        {songList?.length && (
          <button
            aria-label="Next song"
            onClick={handleNextSong}
            className={iconBtn}
          >
            <MdSkipNext size={22} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Control;
