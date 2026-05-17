"use client";
import React, { ChangeEvent } from "react";
import { usePlayerStore } from "@/feature/player/store";

type Props = {
  width?: number;
  height?: number;
  className?: string;
};

const Progress = ({ width = 64, height = 64, className }: Props) => {
  const { currentTime, duration, isSeeking, setCurrentTime, setSeeking } =
    usePlayerStore();
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setCurrentTime(Number(event.target.value));
  };
  const handleMouseDown = (): void => {
    setSeeking(true);
  };
  const handleMouseUp = (event: React.MouseEvent<HTMLInputElement>): void => {
    const audio = document.querySelector("audio") as HTMLAudioElement | null;
    if (audio) {
      audio.currentTime = Number(event.currentTarget.value);
    }
    setSeeking(false);
  };
  const formatTime = (time: number): string => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };
  return (
    <div
      style={{ width, height }}
      className={`flex items-center gap-3 ${className}`}
    >
      <input
        type="range"
        value={currentTime}
        min={0}
        max={duration || 0}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onChange={handleChange}
        className="flex-1 accent-white"
      />
      <span className="text-xs text-white">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
};

export default Progress;
