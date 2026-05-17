"use client";
import { useState, useEffect } from "react";
import { usePlayerStore } from "@/feature/player/store";
import Track from "./SongbarComponents2/Track2";
import Progress from "./SongbarComponents2/Progress2";
import Control from "./SongbarComponents2/Control2";
import Volume from "./SongbarComponents2/Volume2";
import Player from "./SongbarComponents2/Player2";
import data from "../../../public/data/myChart.json";
import {
  MdOutlineArrowForwardIos,
  MdOutlineArrowBackIos,
  MdShuffle,
  MdRepeat,
  MdFavoriteBorder,
  MdFavorite,
} from "react-icons/md";

type Props = React.HTMLAttributes<HTMLElement>;

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

  const currentTrack = songList?.[activeSong];
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <Player onEnded={handleEnded} />

      {/* ══════════════════════════════════════════════════
          DESKTOP — slide-in panel  (lg and above)
      ══════════════════════════════════════════════════ */}
      <aside
        className={`
          hidden lg:flex items-stretch
          fixed bottom-8 z-50
          transition-[right] duration-500 ease-in-out
          ${toggle ? "right-0" : "right-[-436px]"}
          ${className ?? ""}
        `}
        aria-label="Music player"
        {...rest}
      >
        {/* Toggle tab */}
        <button
          onClick={() => setToggle(!toggle)}
          aria-label={toggle ? "Hide player" : "Show player"}
          className="
            flex flex-col items-center justify-center gap-1.5
            w-7 self-center py-6 flex-shrink-0
            bg-zinc-900/90 hover:bg-zinc-800/90
            rounded-l-2xl
            border border-r-0 border-white/[0.07]
            text-white/35 hover:text-white/75
            transition-all cursor-pointer
          "
        >
          {toggle ? (
            <MdOutlineArrowForwardIos size={12} />
          ) : (
            <MdOutlineArrowBackIos size={12} />
          )}
          {isPlaying && (
            <span className="w-[5px] h-[5px] rounded-full bg-violet-400 animate-pulse" />
          )}
        </button>

        {/* Card */}
        <div
          className="
            w-[436px] flex flex-col
            bg-zinc-900/95 backdrop-blur-xl
            border border-l-0 border-white/[0.07]
            rounded-r-2xl overflow-hidden
            shadow-2xl shadow-black/50
          "
        >
          {/* Top accent line */}
          <div className="h-[2px] flex-shrink-0 bg-gradient-to-r from-violet-600 via-violet-400 to-transparent" />

          <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
            {/* ── Row 1: Album art | info | waveform | like ── */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden ring-1 ring-white/[0.12]">
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
          <div className="flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden ring-1 ring-white/10">
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
