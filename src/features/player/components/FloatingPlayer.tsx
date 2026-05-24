"use client";
import type {
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  TouchEvent as ReactTouchEvent,
} from "react";
import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "../player-store";
import { getTrack, TRACK_CATALOG } from "../track-catalog";
import AudioPlayer from "./AudioPlayer";
import PlaybackControls from "./PlaybackControls";
import ProgressBar from "./ProgressBar";
import TrackArtwork from "./TrackArtwork";
import VolumeControl from "./VolumeControl";
import {
  MdShuffle,
  MdRepeat,
  MdRemove,
} from "react-icons/md";

type Props = HTMLAttributes<HTMLElement>;
type DragPosition = { x: number; y: number };

/* ─────────────────────────────────────────────────────────
   Waveform  —  5 bars that animate while playing
───────────────────────────────────────────────────────── */
const Waveform = ({ active }: { active: boolean }) => (
  <div className="flex items-end gap-[3px] h-5 flex-shrink-0" aria-hidden>
    {[0, 120, 60, 200, 80].map((delay, i) => (
      <span
        key={i}
        className="w-[3px] rounded-full bg-violet-400"
        style={{
          height: active ? undefined : "3px",
          opacity: active ? 0.7 : 0.22,
          animation: active
            ? `sbWave 0.9s ease-in-out ${delay}ms infinite alternate`
            : "none",
        }}
      />
    ))}
    <style>{`
      @keyframes sbWave {
        from { height: 3px; }
        to   { height: 16px; }
      }
    `}</style>
  </div>
);

/* ─────────────────────────────────────────────────────────
   ModeBtn  —  shuffle / repeat toggle with active dot
───────────────────────────────────────────────────────── */
const ModeBtn = ({
  on,
  onClick,
  label,
  children,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`
      relative flex items-center justify-center
      p-1.5 rounded-lg transition-all cursor-pointer select-none
      ${
        on
          ? "text-violet-400 hover:text-violet-300"
          : "player-subtle player-control"
      }
    `}
  >
    {children}
    {on && (
      <span className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400" />
    )}
  </button>
);

/* ─────────────────────────────────────────────────────────
   SongBar  —  desktop panel + mobile bottom bar
───────────────────────────────────────────────────────── */
const FloatingPlayer = ({ className, ...rest }: Props) => {
  const playerRef = useRef<HTMLElement | null>(null);
  const dragOffsetRef = useRef<DragPosition>({ x: 0, y: 0 });
  const dragStartRef = useRef<DragPosition>({ x: 0, y: 0 });
  const suppressToggleClickRef = useRef(false);
  const cleanupDragListenersRef = useRef<(() => void) | null>(null);
  const {
    activeTrack,
    isPlaying,
    isExpanded,
    currentTime,
    duration,
    setActiveTrack,
    setPlaying,
    setExpanded,
    setCurrentTime,
  } = usePlayerStore();

  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [dragPosition, setDragPosition] = useState<DragPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  /* Auto-play on track change */
  useEffect(() => {
    setPlaying(true);
  }, [activeTrack, setPlaying]);

  const handlePlayPause = () => setPlaying(!isPlaying);

  const handleNextSong = () => {
    setPlaying(false);
    if (shuffle) {
      let next: number;
      do {
        next = Math.floor(Math.random() * TRACK_CATALOG.length);
      } while (next === activeTrack && TRACK_CATALOG.length > 1);
      setActiveTrack(next);
    } else {
      setActiveTrack((activeTrack + 1) % TRACK_CATALOG.length);
    }
  };

  const handlePrevSong = () => {
    setPlaying(false);
    setActiveTrack(activeTrack === 0 ? TRACK_CATALOG.length - 1 : activeTrack - 1);
  };

  /* Repeat: seek audio back to 0 and play directly.
     Cannot just setPlaying(true) — state didn't change so
     Player's useEffect won't re-trigger audio.play(). */
  const handleEnded = () => {
    if (repeat) {
      const audio = document.querySelector("audio") as HTMLAudioElement | null;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
      setCurrentTime(0);
      return;
    }
    handleNextSong();
  };

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), Math.max(min, max));

  const canStartDrag = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    if (target.closest("[data-songbar-drag-handle]")) return true;

    return !target.closest(
      "button, input, a, textarea, select, [role='button']"
    );
  };

  const startDrag = (
    clientX: number,
    clientY: number,
    target: EventTarget | null,
    button = 0
  ) => {
    if (button > 1 || !canStartDrag(target)) return false;
    const rect = playerRef.current?.getBoundingClientRect();
    if (!rect) return false;

    dragOffsetRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
    dragStartRef.current = { x: clientX, y: clientY };
    suppressToggleClickRef.current = false;
    setDragPosition({ x: rect.left, y: rect.top });
    setIsDragging(true);
    cleanupDragListenersRef.current?.();

    const handleMouseMove = (event: MouseEvent) => {
      moveDrag(event.clientX, event.clientY);
    };
    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      moveDrag(touch.clientX, touch.clientY);
    };
    const cleanup = () => {
      cleanupDragListenersRef.current?.();
      cleanupDragListenersRef.current = null;
      endDrag();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", cleanup, { once: true });
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", cleanup, { once: true });
    cleanupDragListenersRef.current = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };

    return true;
  };

  const moveDrag = (clientX: number, clientY: number) => {
    const rect = playerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const moved =
      Math.abs(clientX - dragStartRef.current.x) +
      Math.abs(clientY - dragStartRef.current.y);

    if (moved > 5) {
      suppressToggleClickRef.current = true;
    }

    setDragPosition({
      x: clamp(
        clientX - dragOffsetRef.current.x,
        0,
        window.innerWidth - rect.width
      ),
      y: clamp(
        clientY - dragOffsetRef.current.y,
        0,
        window.innerHeight - rect.height
      ),
    });
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  const handleMouseDragStart = (event: ReactMouseEvent<HTMLElement>) => {
    if (!startDrag(event.clientX, event.clientY, event.target, event.button)) {
      return;
    }

    event.preventDefault();
  };

  const handleTouchDragStart = (event: ReactTouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    startDrag(touch.clientX, touch.clientY, event.target);
  };

  const handleHandleMouseDown = (event: ReactMouseEvent<HTMLElement>) => {
    event.stopPropagation();
    handleMouseDragStart(event);
  };

  const handleHandleTouchStart = (event: ReactTouchEvent<HTMLElement>) => {
    event.stopPropagation();
    handleTouchDragStart(event);
  };

  useEffect(() => {
    return () => {
      cleanupDragListenersRef.current?.();
      cleanupDragListenersRef.current = null;
    };
  }, []);

  const handleTogglePlayer = () => {
    if (suppressToggleClickRef.current) {
      suppressToggleClickRef.current = false;
      return;
    }

    const rect = playerRef.current?.getBoundingClientRect();

    if (rect) {
      setDragPosition({
        x: clamp(rect.left, 0, window.innerWidth - rect.width),
        y: clamp(rect.top, 0, window.innerHeight - rect.height),
      });
    }

    setExpanded(!isExpanded);
  };

  const currentTrack = getTrack(activeTrack);
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isFreePositioned = dragPosition !== null;

  return (
    <>
      <AudioPlayer onEnded={handleEnded} />

      {/* ══════════════════════════════════════════════════
          DESKTOP — slide-in panel  (lg and above)
      ══════════════════════════════════════════════════ */}
      <aside
        ref={playerRef}
        onMouseDown={handleMouseDragStart}
        onTouchStart={handleTouchDragStart}
        style={
          dragPosition
            ? {
                left: dragPosition.x,
                top: dragPosition.y,
                right: "auto",
                bottom: "auto",
              }
            : undefined
        }
        className={`
          hidden lg:block
          fixed z-50 select-none touch-none
          ${isDragging ? "cursor-grabbing" : "cursor-grab"}
          ${isFreePositioned ? "" : "right-8 bottom-8"}
          ${className ?? ""}
        `}
        aria-label="Music player"
        {...rest}
      >
        <button
          data-songbar-drag-handle
          onMouseDown={handleHandleMouseDown}
          onTouchStart={handleHandleTouchStart}
          onClick={handleTogglePlayer}
          aria-label={isExpanded ? "Hide player" : "Show player"}
          className={`
            absolute right-[36px] top-[27px] z-10 flex h-8 w-8 items-center justify-center rounded-lg
            transition-all duration-300 ease-in-out cursor-grab active:cursor-grabbing
            ${
              isExpanded
                ? "player-subtle player-control"
                : "player-float-button border shadow-2xl shadow-black/20 backdrop-blur-xl player-control"
            }
          `}
        >
          <MdRemove size={18} />
        </button>

        {/* Card */}
        <div
          className={`
            flex min-w-0 flex-col
            player-surface
            backdrop-blur-xl
            rounded-2xl overflow-hidden
            shadow-2xl shadow-black/50
            ring-1 ring-[var(--player-border)]
            transition-[opacity,border-color,transform] duration-300 ease-in-out
            ${
              isExpanded
                ? "w-[436px] translate-x-0 opacity-100 border"
                : "w-[436px] scale-95 opacity-0 border border-transparent pointer-events-none"
            }
          `}
        >
          {/* Top accent line */}
          <div className="h-[2px] flex-shrink-0 bg-gradient-to-r from-violet-600 via-violet-400 to-transparent" />

          <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
            {/* ── Row 1: Album art | info | waveform | like ── */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden ring-1 ring-[var(--player-border)]">
                <TrackArtwork width={48} height={48} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="player-text text-sm font-semibold truncate leading-tight tracking-tight">
                  {currentTrack?.title ?? "—"}
                </p>
              </div>

              <Waveform active={isPlaying} />

              <div className="h-8 w-12 flex-shrink-0" aria-hidden />
            </div>

            {/* ── Row 2: Progress bar ── */}
            <ProgressBar className="w-full" />

            {/* ── Row 3: Shuffle | Controls | Volume | Repeat ── */}
            <div className="flex items-center justify-between">
              <ModeBtn
                on={shuffle}
                onClick={() => setShuffle(!shuffle)}
                label="Shuffle"
              >
                <MdShuffle size={18} />
              </ModeBtn>

              <PlaybackControls
                handlePlayPause={handlePlayPause}
                handleNextSong={handleNextSong}
                handlePrevSong={handlePrevSong}
              />

              <VolumeControl />

              <ModeBtn
                on={repeat}
                onClick={() => setRepeat(!repeat)}
                label="Repeat"
              >
                <MdRepeat size={18} />
              </ModeBtn>
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════
          MOBILE — full-width bottom bar
      ══════════════════════════════════════════════════ */}
      <div
        className={`
          ${isExpanded ? "flex" : "hidden"} lg:hidden flex-col
          fixed bottom-0 left-0 right-0 z-50
          player-surface backdrop-blur-xl
          border-t
          pb-[env(safe-area-inset-bottom)]
        `}
        aria-label="Music player"
      >
        {/* Thin seek-progress line */}
        <div className="player-track h-[2px] w-full">
          <div
            className="h-full bg-violet-500 transition-none rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          {/* Album art */}
          <div className="flex-shrink-0 w-11 h-11 rounded-full overflow-hidden ring-1 ring-[var(--player-border)]">
            <TrackArtwork width={44} height={44} />
          </div>

          {/* Song info */}
          <div className="flex-1 min-w-0">
            <p className="player-text text-sm font-semibold truncate leading-tight">
              {currentTrack?.title ?? "—"}
            </p>
          </div>

          <button
            onClick={handleTogglePlayer}
            aria-label="Hide player"
            className="
              p-2 transition-all cursor-pointer active:scale-90 flex-shrink-0
              player-subtle player-control
            "
          >
            <MdRemove size={22} />
          </button>

          {/* Play + Next only (prev hidden on mobile via Control's hidden lg:flex) */}
          <PlaybackControls
            handlePlayPause={handlePlayPause}
            handleNextSong={handleNextSong}
            handlePrevSong={handlePrevSong}
          />
        </div>
      </div>
      {!isExpanded && (
        <button
          onClick={handleTogglePlayer}
          aria-label="Show player"
          className="
            fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center
            player-float-button rounded-xl border backdrop-blur-xl
            shadow-2xl shadow-black/20 transition-all player-control
            active:scale-95 lg:hidden
          "
        >
          <MdRemove size={22} />
        </button>
      )}
    </>
  );
};

export default FloatingPlayer;
