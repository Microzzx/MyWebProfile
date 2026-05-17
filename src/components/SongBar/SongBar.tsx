"use client";
import { useState, useEffect, useRef } from "react";
import { usePlayerStore } from "@/feature/player/store";
import Track from "./SongbarComponents/Track";
import Progress from "./SongbarComponents/Progress";
import Control from "./SongbarComponents/Control";
import Volume from "./SongbarComponents/Volume";
import Player from "./SongbarComponents/Player";
import data from "../../../public/data/myChart.json";
import {
  MdShuffle,
  MdRepeat,
  MdFavoriteBorder,
  MdFavorite,
  MdRemove,
} from "react-icons/md";

type Props = React.HTMLAttributes<HTMLElement>;
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
  children: React.ReactNode;
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
          : "text-white/25 hover:text-white/60"
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
const SongBar = ({ className, ...rest }: Props) => {
  const playerRef = useRef<HTMLElement | null>(null);
  const dragOffsetRef = useRef<DragPosition>({ x: 0, y: 0 });
  const dragStartRef = useRef<DragPosition>({ x: 0, y: 0 });
  const suppressToggleClickRef = useRef(false);
  const cleanupDragListenersRef = useRef<(() => void) | null>(null);
  const {
    songList,
    activeSong,
    isPlaying,
    toggle,
    currentTime,
    duration,
    setSong,
    setActive,
    setPlaying,
    setToggle,
    setCurrentTime,
  } = usePlayerStore();

  const [liked, setLiked] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [dragPosition, setDragPosition] = useState<DragPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  /* Load playlist once */
  useEffect(() => {
    setSong(data.tracks);
  }, []);

  /* Auto-play on track change */
  useEffect(() => {
    if (songList) setPlaying(true);
  }, [activeSong]);

  const handlePlayPause = () => setPlaying(!isPlaying);

  const handleNextSong = () => {
    if (!songList) return;
    setPlaying(false);
    if (shuffle) {
      let next: number;
      do {
        next = Math.floor(Math.random() * songList.length);
      } while (next === activeSong && songList.length > 1);
      setActive(next);
    } else {
      setActive((activeSong + 1) % songList.length);
    }
  };

  const handlePrevSong = () => {
    if (!songList) return;
    setPlaying(false);
    setActive(activeSong === 0 ? songList.length - 1 : activeSong - 1);
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

  const handleMouseDragStart = (event: React.MouseEvent<HTMLElement>) => {
    if (!startDrag(event.clientX, event.clientY, event.target, event.button)) {
      return;
    }

    event.preventDefault();
  };

  const handleTouchDragStart = (event: React.TouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    startDrag(touch.clientX, touch.clientY, event.target);
  };

  const handleHandleMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    handleMouseDragStart(event);
  };

  const handleHandleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
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

    setToggle(!toggle);
  };

  const currentTrack = songList?.[activeSong];
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isFreePositioned = dragPosition !== null;

  return (
    <>
      <Player onEnded={handleEnded} />

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
          hidden lg:flex items-stretch
          fixed z-50 select-none touch-none
          ${isDragging ? "cursor-grabbing" : "cursor-grab"}
          ${isFreePositioned ? "" : "bottom-8 transition-[right] duration-500 ease-in-out"}
          ${isFreePositioned ? "" : toggle ? "right-0" : "right-[-436px]"}
          ${className ?? ""}
        `}
        aria-label="Music player"
        {...rest}
      >
        {/* Toggle tab */}
        <button
          data-songbar-drag-handle
          onMouseDown={handleHandleMouseDown}
          onTouchStart={handleHandleTouchStart}
          onClick={handleTogglePlayer}
          aria-label={toggle ? "Hide player" : "Show player"}
          className={`
            flex flex-col items-center justify-center gap-1.5 flex-shrink-0
            bg-zinc-950/90 hover:bg-zinc-900/95 backdrop-blur-xl
            border border-white/[0.07]
            text-white/35 hover:text-white/75
            shadow-2xl shadow-black/45
            transition-all duration-300 ease-in-out cursor-grab active:cursor-grabbing
            ${
              toggle
                ? "w-10 self-stretch rounded-l-2xl border-r-0"
                : "h-16 w-16 self-center rounded-xl"
            }
          `}
        >
          <MdRemove size={16} />
          {isPlaying && (
            <span className="w-[5px] h-[5px] rounded-full bg-violet-400 animate-pulse" />
          )}
        </button>

        {/* Card */}
        <div
          className={`
            flex min-w-0 flex-col
            bg-[linear-gradient(145deg,rgba(24,24,27,0.96),rgba(9,9,11,0.98))]
            backdrop-blur-xl
            rounded-r-2xl overflow-hidden
            shadow-2xl shadow-black/50
            ring-1 ring-white/[0.04]
            transition-[width,opacity,border-color,transform] duration-300 ease-in-out
            ${
              toggle
                ? "w-[436px] translate-x-0 opacity-100 border border-l-0 border-white/[0.07]"
                : "w-0 -translate-x-2 opacity-0 border-0 pointer-events-none"
            }
          `}
        >
          {/* Top accent line */}
          <div className="h-[2px] flex-shrink-0 bg-gradient-to-r from-violet-600 via-violet-400 to-transparent" />

          <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
            {/* ── Row 1: Album art | info | waveform | like ── */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden ring-1 ring-white/[0.12]">
                <Track width={48} height={48} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/90 truncate leading-tight tracking-tight">
                  {currentTrack?.title ?? "—"}
                </p>
                {/* <p className="text-[11px] text-white/35 truncate mt-0.5">
                  {currentTrack?.artist ?? "—"}
                  {songList && (
                    <span className="ml-2 text-white/18 tabular-nums">
                      {activeSong + 1}&nbsp;/&nbsp;{songList.length}
                    </span>
                  )}
                </p> */}
              </div>

              <Waveform active={isPlaying} />

              <button
                onClick={() => setLiked(!liked)}
                aria-label={liked ? "Unlike" : "Like"}
                className={`
                  flex-shrink-0 p-1.5 rounded-lg
                  transition-all cursor-pointer active:scale-90
                  ${liked ? "text-pink-400" : "text-white/25 hover:text-pink-400"}
                `}
              >
                {liked ? (
                  <MdFavorite size={20} />
                ) : (
                  <MdFavoriteBorder size={20} />
                )}
              </button>
            </div>

            {/* ── Row 2: Progress bar ── */}
            <Progress className="w-full" />

            {/* ── Row 3: Shuffle | Controls | Volume | Repeat ── */}
            <div className="flex items-center justify-between">
              <ModeBtn
                on={shuffle}
                onClick={() => setShuffle(!shuffle)}
                label="Shuffle"
              >
                <MdShuffle size={18} />
              </ModeBtn>

              <Control
                handlePlayPause={handlePlayPause}
                handleNextSong={handleNextSong}
                handlePrevSong={handlePrevSong}
              />

              <Volume />

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
        className="
          flex lg:hidden flex-col
          fixed bottom-0 left-0 right-0 z-50
          bg-zinc-900/98 backdrop-blur-xl
          border-t border-white/[0.07]
          pb-[env(safe-area-inset-bottom)]
        "
        aria-label="Music player"
      >
        {/* Thin seek-progress line */}
        <div className="h-[2px] w-full bg-white/[0.06]">
          <div
            className="h-full bg-violet-500 transition-none rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          {/* Album art */}
          <div className="flex-shrink-0 w-11 h-11 rounded-full overflow-hidden ring-1 ring-white/10">
            <Track width={44} height={44} />
          </div>

          {/* Song info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white/90 truncate leading-tight">
              {currentTrack?.title ?? "—"}
            </p>
            {/* <p className="text-[11px] text-white/35 truncate">
              {currentTrack?.artist ?? "—"}
            </p> */}
          </div>

          {/* Like */}
          <button
            onClick={() => setLiked(!liked)}
            aria-label={liked ? "Unlike" : "Like"}
            className={`
              p-2 transition-all cursor-pointer active:scale-90 flex-shrink-0
              ${liked ? "text-pink-400" : "text-white/25 hover:text-pink-400"}
            `}
          >
            {liked ? <MdFavorite size={22} /> : <MdFavoriteBorder size={22} />}
          </button>

          {/* Play + Next only (prev hidden on mobile via Control's hidden lg:flex) */}
          <Control
            handlePlayPause={handlePlayPause}
            handleNextSong={handleNextSong}
            handlePrevSong={handlePrevSong}
          />
        </div>
      </div>
    </>
  );
};

export default SongBar;
