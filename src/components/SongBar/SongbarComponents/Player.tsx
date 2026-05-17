"use client";
import React, { useRef, useEffect } from "react";
import { usePlayerStore } from "@/feature/player/store";

type PlayerProps = {
  onEnded: () => void;
};

const Player: React.FC<PlayerProps> = ({ onEnded }) => {
  const ref = useRef<HTMLAudioElement | null>(null);
  const {
    songList,
    activeSong,
    isPlaying,
    volume,
    isSeeking,
    setCurrentTime,
    setDuration,
  } = usePlayerStore();

  const handleTimeUpdate = (): void => {
    if (!ref.current || isSeeking) return;
    setCurrentTime(ref.current.currentTime);
  };

  const handleLoadedMetadata = (): void => {
    if (!ref.current) return;
    setDuration(ref.current.duration);
    ref.current.volume = volume;
  };

  // Play / pause when state changes
  useEffect(() => {
    if (!ref.current || !songList) return;
    if (isPlaying) {
      ref.current.play().catch(() => {});
    } else {
      ref.current.pause();
    }
  }, [isPlaying, activeSong, songList]);

  // Sync volume
  useEffect(() => {
    if (!ref.current) return;
    ref.current.volume = volume;
  }, [volume]);

  if (!songList) return null;

  return (
    <audio
      crossOrigin="anonymous"
      ref={ref}
      src={songList[activeSong].url}
      loop={false}
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={onEnded}
    />
  );
};

export default Player;
