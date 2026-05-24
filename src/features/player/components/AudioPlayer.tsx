"use client";

import { useEffect, useRef } from "react";
import { usePlayerStore } from "../player-store";
import { getTrack, resolveAudioSource } from "../track-catalog";

type Props = {
  onEnded: () => void;
};

const AudioPlayer = ({ onEnded }: Props) => {
  const ref = useRef<HTMLAudioElement | null>(null);
  const {
    activeTrack,
    isPlaying,
    volume,
    isSeeking,
    setCurrentTime,
    setDuration,
  } = usePlayerStore();
  const source = resolveAudioSource(getTrack(activeTrack));

  const handleTimeUpdate = () => {
    if (!ref.current || isSeeking) return;
    setCurrentTime(ref.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!ref.current) return;
    setDuration(ref.current.duration);
    ref.current.volume = volume;
  };

  useEffect(() => {
    if (!ref.current || !source) return;
    if (isPlaying) {
      ref.current.play().catch(() => {});
    } else {
      ref.current.pause();
    }
  }, [activeTrack, isPlaying, source]);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.volume = volume;
  }, [volume]);

  if (!source) return null;

  return (
    <audio
      crossOrigin="anonymous"
      ref={ref}
      src={source}
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={onEnded}
    />
  );
};

export default AudioPlayer;
