"use client";

import type { HTMLAttributes } from "react";
import { MdClose, MdGraphicEq, MdMusicNote } from "react-icons/md";
import type { Track } from "../track-catalog";

type Props = HTMLAttributes<HTMLDivElement> & {
  tracks: Track[];
  activeTrack: number;
  isPlaying: boolean;
  onTrackSelect: (index: number) => void;
  onTrackRemove: (trackId: string) => void;
};

const SOURCE_LABELS = {
  local: "Local",
  spotify: "Spotify",
  youtube: "YouTube",
};

const TrackList = ({
  tracks,
  activeTrack,
  isPlaying,
  onTrackSelect,
  onTrackRemove,
  className,
  ...rest
}: Props) => (
  <div
    aria-label="Song list"
    className={`hide-scrollbar max-h-52 space-y-1 overflow-y-auto ${className ?? ""}`}
    {...rest}
  >
    {tracks.map((track, index) => {
      const isActive = index === activeTrack;

      return (
        <div
          key={track.id}
          className={`
            flex w-full items-center rounded-xl border
            transition-colors player-control
            ${
              isActive
                ? "border-violet-400/35 bg-violet-500/10"
                : "border-transparent"
            }
          `}
        >
          <button
            type="button"
            onClick={() => onTrackSelect(index)}
            aria-label={`Select ${track.title}`}
            aria-current={isActive ? "true" : undefined}
            className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left"
          >
            {/* Track images may later be supplied by external music providers. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={track.artwork}
              alt=""
              className="h-9 w-9 flex-shrink-0 rounded-lg object-cover"
            />
            <span className="min-w-0 flex-1">
              <span className="player-text block truncate text-sm font-medium">
                {track.title}
              </span>
              <span className="player-muted block text-[11px]">
                {SOURCE_LABELS[track.source.provider]}
              </span>
            </span>
            {isActive && isPlaying ? (
              <MdGraphicEq aria-hidden className="flex-shrink-0 text-violet-400" size={18} />
            ) : (
              <MdMusicNote aria-hidden className="player-subtle flex-shrink-0" size={16} />
            )}
          </button>
          {track.source.provider === "youtube" && (
            <button
              type="button"
              onClick={() => onTrackRemove(track.id)}
              aria-label={`Remove ${track.title}`}
              className="player-muted player-control mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
            >
              <MdClose size={16} />
            </button>
          )}
        </div>
      );
    })}
  </div>
);

export default TrackList;
