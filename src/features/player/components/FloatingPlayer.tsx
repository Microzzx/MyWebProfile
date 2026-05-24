"use client";
import type {
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  TouchEvent as ReactTouchEvent,
} from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  PLAYER_SESSION_STORAGE_KEY,
  type PersistedPlayerSession,
  usePlayerStore,
} from "../player-store";
import type { Track } from "../track-catalog";
import AudioPlayer from "./AudioPlayer";
import PlaybackControls from "./PlaybackControls";
import ProgressBar from "./ProgressBar";
import TrackArtwork from "./TrackArtwork";
import TrackList from "./TrackList";
import VolumeControl from "./VolumeControl";
import YouTubeImportForm from "./YouTubeImportForm";
import YouTubePlayer, { YOUTUBE_PLAYBACK_EVENT } from "./YouTubePlayer";
import {
  MdShuffle,
  MdRepeat,
  MdRemove,
  MdQueueMusic,
} from "react-icons/md";

type Props = HTMLAttributes<HTMLElement>;
type DragPosition = { x: number; y: number };
type DragBounds = DragPosition & { width: number; height: number };

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
  const desktopToggleRef = useRef<HTMLButtonElement | null>(null);
  const dragOffsetRef = useRef<DragPosition>({ x: 0, y: 0 });
  const toggleOffsetRef = useRef<DragBounds>({ x: 0, y: 0, width: 44, height: 44 });
  const dragStartRef = useRef<DragPosition>({ x: 0, y: 0 });
  const expandToggleAnchorRef = useRef<DragPosition | null>(null);
  const suppressToggleClickRef = useRef(false);
  const cleanupDragListenersRef = useRef<(() => void) | null>(null);
  const {
    tracks,
    activeTrack,
    isPlaying,
    isExpanded,
    volume,
    currentTime,
    duration,
    addTrack,
    removeImportedTrack,
    setActiveTrack,
    setPlaying,
    setExpanded,
    setCurrentTime,
    setDuration,
    requestSeek,
    clearSeekRequest,
    progressByTrackId,
    hasRestoredSession,
    restoreSession,
  } = usePlayerStore();

  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [showTrackList, setShowTrackList] = useState(false);
  const [isYouTubeReady, setYouTubeReady] = useState(false);
  const [playerViewport, setPlayerViewport] = useState<"desktop" | "mobile" | null>(null);
  const [dragPosition, setDragPosition] = useState<DragPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const currentTrack = tracks[activeTrack];
  const isYouTubeLoading =
    currentTrack?.source.provider === "youtube" && !isYouTubeReady;

  useEffect(() => {
    let storedSession: PersistedPlayerSession | null = null;

    try {
      const storedValue = window.localStorage.getItem(PLAYER_SESSION_STORAGE_KEY);
      storedSession = storedValue ? (JSON.parse(storedValue) as PersistedPlayerSession) : null;
    } catch {
      window.localStorage.removeItem(PLAYER_SESSION_STORAGE_KEY);
    }

    restoreSession(storedSession);
  }, [restoreSession]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const updateViewport = () => {
      setPlayerViewport(desktopQuery.matches ? "desktop" : "mobile");
    };

    updateViewport();
    desktopQuery.addEventListener("change", updateViewport);

    return () => desktopQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (!hasRestoredSession) return;

    const session = {
      youtubeTracks: tracks.filter((track) => track.source.provider === "youtube"),
      activeTrackId: currentTrack?.id,
      progressByTrackId,
      volume,
    };

    window.localStorage.setItem(PLAYER_SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [currentTrack?.id, hasRestoredSession, progressByTrackId, tracks, volume]);

  const handlePlayPause = () => {
    const shouldPlay = !isPlaying;

    if (currentTrack?.source.provider === "youtube") {
      window.dispatchEvent(
        new CustomEvent(YOUTUBE_PLAYBACK_EVENT, {
          detail: shouldPlay ? "play" : "pause",
        })
      );
      return;
    }

    setPlaying(shouldPlay);
  };

  const handleNextSong = () => {
    const continuePlaying = isPlaying;
    let nextTrack: number;

    if (shuffle) {
      do {
        nextTrack = Math.floor(Math.random() * tracks.length);
      } while (nextTrack === activeTrack && tracks.length > 1);
    } else {
      nextTrack = (activeTrack + 1) % tracks.length;
    }

    setActiveTrack(nextTrack);
    setPlaying(continuePlaying);
  };

  const handlePrevSong = () => {
    const continuePlaying = isPlaying;
    const previousTrack = activeTrack === 0 ? tracks.length - 1 : activeTrack - 1;
    setActiveTrack(previousTrack);
    setPlaying(continuePlaying);
  };

  const handleSelectTrack = (index: number) => {
    if (index === activeTrack) {
      if (currentTrack?.source.provider === "youtube") {
        window.dispatchEvent(
          new CustomEvent(YOUTUBE_PLAYBACK_EVENT, { detail: "play" })
        );
      } else {
        setPlaying(true);
      }

      return;
    }

    setDuration(0);
    clearSeekRequest();
    setPlaying(false);
    setActiveTrack(index);

    if (tracks[index]?.source.provider === "local") {
      setPlaying(true);
    }
  };

  const handleImportedTrack = (track: Track) => {
    const existingIndex = tracks.findIndex((existingTrack) => existingTrack.id === track.id);
    const selectedIndex = existingIndex >= 0 ? existingIndex : tracks.length;

    if (existingIndex < 0) {
      addTrack(track);
    }

    handleSelectTrack(selectedIndex);
  };

  const handleRemoveTrack = (trackId: string) => {
    removeImportedTrack(trackId);
  };

  /* Repeat: seek audio back to 0 and play directly.
     Cannot just setPlaying(true) — state didn't change so
     Player's useEffect won't re-trigger audio.play(). */
  const handleEnded = () => {
    setCurrentTime(0);

    if (repeat) {
      const provider = tracks[activeTrack]?.source.provider;

      if (provider === "local") {
        const audio = document.querySelector("audio") as HTMLAudioElement | null;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      } else if (provider === "youtube") {
        requestSeek(0);
        setPlaying(false);
        window.setTimeout(() => setPlaying(true), 0);
      } else {
        handleNextSong();
        return;
      }

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
    const toggleRect = isExpanded
      ? desktopToggleRef.current?.getBoundingClientRect()
      : rect;

    if (toggleRect) {
      toggleOffsetRef.current = {
        x: toggleRect.left - rect.left,
        y: toggleRect.top - rect.top,
        width: toggleRect.width,
        height: toggleRect.height,
      };
    }

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
    const toggleOffset = toggleOffsetRef.current;

    const moved =
      Math.abs(clientX - dragStartRef.current.x) +
      Math.abs(clientY - dragStartRef.current.y);

    if (moved > 3) {
      suppressToggleClickRef.current = true;
    }

    const nextX = clientX - dragOffsetRef.current.x;
    const nextY = clientY - dragOffsetRef.current.y;
    const toggleX = clamp(
      nextX + toggleOffset.x,
      0,
      window.innerWidth - toggleOffset.width
    );
    const toggleY = clamp(
      nextY + toggleOffset.y,
      0,
      window.innerHeight - toggleOffset.height
    );

    setDragPosition({
      x: toggleX - toggleOffset.x,
      y: toggleY - toggleOffset.y,
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

  useLayoutEffect(() => {
    const anchor = expandToggleAnchorRef.current;
    const toggleRect = desktopToggleRef.current?.getBoundingClientRect();
    if (!isExpanded || !anchor || !toggleRect) return;

    setDragPosition((position) =>
      position
        ? {
            x: position.x + anchor.x - toggleRect.left,
            y: position.y + anchor.y - toggleRect.top,
          }
        : position
    );
    expandToggleAnchorRef.current = null;
  }, [isExpanded]);

  const handleTogglePlayer = () => {
    if (suppressToggleClickRef.current) {
      suppressToggleClickRef.current = false;
      return;
    }

    const rect = (isExpanded ? desktopToggleRef.current : playerRef.current)?.getBoundingClientRect();

    if (rect) {
      const togglePosition = { x: rect.left, y: rect.top };

      setDragPosition(togglePosition);

      if (!isExpanded) {
        expandToggleAnchorRef.current = togglePosition;
      }
    }

    if (currentTrack?.source.provider === "youtube") {
      if (isExpanded) {
        setPlaying(false);
      } else {
        const savedTime = usePlayerStore.getState().progressByTrackId[currentTrack.id] ?? 0;
        requestSeek(savedTime);
      }
    }

    setExpanded(!isExpanded);
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isFreePositioned = dragPosition !== null;

  return (
    <>
      <AudioPlayer onEnded={handleEnded} />

      {/* ══════════════════════════════════════════════════
          DESKTOP — slide-in panel  (lg and above)
      ══════════════════════════════════════════════════ */}
      {isExpanded && (
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
        <div
          className={`
            flex min-w-0 flex-col
            player-surface
            backdrop-blur-xl
            rounded-2xl overflow-hidden
            shadow-2xl shadow-black/50
            ring-1 ring-[var(--player-border)]
            transition-[opacity,border-color,transform] duration-300 ease-in-out
            w-[436px] translate-x-0 opacity-100 border
          `}
        >
          {/* Top accent line */}
          <div className="h-[2px] flex-shrink-0 bg-gradient-to-r from-violet-600 via-violet-400 to-transparent" />

          {playerViewport === "desktop" && (
            <YouTubePlayer
              key={currentTrack?.id ?? "no-track"}
              track={currentTrack}
              onEnded={handleEnded}
              onReadyChange={setYouTubeReady}
              className="mx-4 mt-4"
            />
          )}

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
                <button
                  type="button"
                  onClick={() => setShowTrackList(!showTrackList)}
                  aria-label={showTrackList ? "Hide song list" : "Show song list"}
                  aria-expanded={showTrackList}
                  className="player-muted player-control mt-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] transition-colors"
                >
                  <MdQueueMusic size={13} />
                  {showTrackList ? "Close list" : "Song list"}
                </button>
              </div>

              <Waveform active={isPlaying} />

              <button
                ref={desktopToggleRef}
                data-songbar-drag-handle
                onMouseDown={handleHandleMouseDown}
                onTouchStart={handleHandleTouchStart}
                onClick={handleTogglePlayer}
                aria-label="Hide player"
                className="player-subtle player-control -m-1.5 flex h-11 w-11 flex-shrink-0 touch-none cursor-grab items-center justify-center rounded-xl transition-colors active:cursor-grabbing"
              >
                <MdRemove size={18} />
              </button>
            </div>

            {/* ── Row 2: Progress bar ── */}
            <ProgressBar className="w-full" />

            {showTrackList && (
              <div className="space-y-3">
                <YouTubeImportForm onTrackImported={handleImportedTrack} />
                <TrackList
                  tracks={tracks}
                  activeTrack={activeTrack}
                  isPlaying={isPlaying}
                  onTrackSelect={handleSelectTrack}
                  onTrackRemove={handleRemoveTrack}
                />
              </div>
            )}

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
                playDisabled={isYouTubeLoading}
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
      )}
      {!isExpanded && (
        <button
          ref={(node) => {
            playerRef.current = node;
          }}
          data-songbar-drag-handle
          onMouseDown={handleHandleMouseDown}
          onTouchStart={handleHandleTouchStart}
          onClick={handleTogglePlayer}
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
          aria-label="Show player"
          className={`
            player-float-button fixed z-50 hidden h-11 w-11 touch-none items-center justify-center rounded-xl
            border shadow-2xl shadow-black/20 backdrop-blur-xl transition-colors lg:flex
            ${isDragging ? "cursor-grabbing" : "cursor-grab"}
            ${isFreePositioned ? "" : "right-8 bottom-8"}
          `}
        >
          <MdRemove size={18} />
        </button>
      )}

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

        {playerViewport === "mobile" && (
          <YouTubePlayer
            key={currentTrack?.id ?? "no-track"}
            track={currentTrack}
            onEnded={handleEnded}
            onReadyChange={setYouTubeReady}
            className="mx-3 mt-3"
          />
        )}

        {showTrackList && (
          <div className="space-y-3 border-b border-[var(--player-border)] px-3 py-2">
            <YouTubeImportForm onTrackImported={handleImportedTrack} />
            <TrackList
              tracks={tracks}
              activeTrack={activeTrack}
              isPlaying={isPlaying}
              onTrackSelect={handleSelectTrack}
              onTrackRemove={handleRemoveTrack}
            />
          </div>
        )}

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
            <button
              type="button"
              onClick={() => setShowTrackList(!showTrackList)}
              aria-label={showTrackList ? "Hide song list" : "Show song list"}
              aria-expanded={showTrackList}
              className="player-muted player-control mt-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] transition-colors"
            >
              <MdQueueMusic size={13} />
              {showTrackList ? "Close list" : "Song list"}
            </button>
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
            playDisabled={isYouTubeLoading}
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
