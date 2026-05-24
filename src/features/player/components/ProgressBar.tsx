"use client";
import type { ChangeEvent, MouseEvent, TouchEvent } from "react";
import { usePlayerStore } from "../player-store";

type Props = {
  width?: number;
  className?: string;
};

const formatTime = (time: number): string => {
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

const ProgressBar = ({ width, className }: Props) => {
  const { currentTime, duration, setCurrentTime, setSeeking } =
    usePlayerStore();

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  const handleMouseDown = () => setSeeking(true);

  const handleMouseUp = (e: MouseEvent<HTMLInputElement>) => {
    const audio = document.querySelector("audio") as HTMLAudioElement | null;
    if (audio) audio.currentTime = Number(e.currentTarget.value);
    setSeeking(false);
  };

  // Touch support for mobile
  const handleTouchEnd = (e: TouchEvent<HTMLInputElement>) => {
    const audio = document.querySelector("audio") as HTMLAudioElement | null;
    if (audio) audio.currentTime = Number(e.currentTarget.value);
    setSeeking(false);
  };

  return (
    <div
      style={width ? { width } : undefined}
      className={`flex items-center gap-2.5 ${className ?? ""}`}
    >
      {/* Elapsed */}
      <span className="player-muted font-mono text-[11px] tabular-nums w-8 text-right flex-shrink-0">
        {formatTime(currentTime)}
      </span>

      {/* Slider track with gradient fill overlay */}
      <div className="relative flex-1 flex items-center group" style={{ height: 16 }}>
        {/* Visual filled track */}
        <div className="absolute inset-y-0 flex items-center w-full pointer-events-none">
          <div className="player-track w-full h-[3px] rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-400 rounded-full transition-none"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Actual range input (transparent, on top) */}
        <input
          type="range"
          value={currentTime}
          min={0}
          max={duration || 0}
          step="any"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleTouchEnd}
          onChange={handleChange}
          className="
            relative w-full h-[3px] appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            player-thumb
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:opacity-0
            group-hover:[&::-webkit-slider-thumb]:opacity-100
            [&::-webkit-slider-thumb]:transition-opacity
            [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:h-3
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:opacity-0
            group-hover:[&::-moz-range-thumb]:opacity-100
          "
          aria-label="Song progress"
        />
      </div>

      {/* Duration */}
      <span className="player-subtle font-mono text-[11px] tabular-nums w-8 flex-shrink-0">
        {formatTime(duration)}
      </span>
    </div>
  );
};

export default ProgressBar;
