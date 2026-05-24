"use client";

import { usePlayerStore } from "../player-store";

type Props = {
  width?: number;
  height?: number;
  className?: string;
};

const TrackArtwork = ({ width = 48, height = 48, className }: Props) => {
  const { tracks, activeTrack, isPlaying } = usePlayerStore();
  const track = tracks[activeTrack];

  if (!track) return null;

  return (
    <div className={`flex items-center ${className ?? ""}`}>
      <div
        style={{ width, height }}
        className={`
          flex-shrink-0 overflow-hidden rounded-full ring-1 ring-[var(--player-border)]
          animate-[spin_8s_linear_infinite]
          ${!isPlaying ? "[animation-play-state:paused]" : ""}
        `}
      >
        {/* Artwork URLs may later come from external track providers. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={track.artwork}
          alt={track.title}
          className="h-full w-full rounded-full object-cover"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default TrackArtwork;
