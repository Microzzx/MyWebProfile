"use client";

import { BsFillPauseFill, BsFillPlayFill } from "react-icons/bs";
import { MdSkipNext, MdSkipPrevious } from "react-icons/md";
import { usePlayerStore } from "../player-store";

type Props = {
  handlePlayPause: () => void;
  handleNextSong: () => void;
  handlePrevSong: () => void;
  playDisabled?: boolean;
};

const PlaybackControls = ({
  handlePlayPause,
  handleNextSong,
  handlePrevSong,
  playDisabled = false,
}: Props) => {
  const { isPlaying, tracks } = usePlayerStore();
  const showStepControls = tracks.length > 1;
  const iconButtonClass =
    "player-muted player-control flex items-center justify-center p-2 rounded-xl transition-all cursor-pointer";

  return (
    <div className="flex items-center gap-1">
      <div className="hidden lg:flex">
        {showStepControls && (
          <button
            aria-label="Previous song"
            onClick={handlePrevSong}
            className={iconButtonClass}
          >
            <MdSkipPrevious size={22} />
          </button>
        )}
      </div>

      <button
        aria-label={playDisabled ? "Loading YouTube player" : isPlaying ? "Pause" : "Play"}
        onClick={handlePlayPause}
        disabled={playDisabled}
        className="
          flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl
          bg-violet-500 text-white shadow-lg shadow-violet-900/40 transition-all
          hover:bg-violet-400 active:scale-95 disabled:cursor-wait
          disabled:bg-violet-500/45 disabled:shadow-none disabled:active:scale-100
        "
      >
        {isPlaying ? <BsFillPauseFill size={18} /> : <BsFillPlayFill size={18} />}
      </button>

      <div className="hidden lg:flex">
        {showStepControls && (
          <button
            aria-label="Next song"
            onClick={handleNextSong}
            className={iconButtonClass}
          >
            <MdSkipNext size={22} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PlaybackControls;
