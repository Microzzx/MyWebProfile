"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayerStore } from "../player-store";
import type { Track } from "../track-catalog";

type Props = {
  track: Track | undefined;
  onEnded: () => void;
  onReadyChange?: (isReady: boolean) => void;
  className?: string;
};

export const YOUTUBE_PLAYBACK_EVENT = "player:youtube-playback";

type PlaybackCommand = "play" | "pause";

type YouTubePlayerInstance = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  mute: () => void;
  pauseVideo: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  unMute: () => void;
};

type YouTubePlayerApi = {
  Player: new (
    element: HTMLElement,
    options: {
      height?: string;
      width?: string;
      videoId?: string;
      playerVars?: {
        origin: string;
        playsinline: number;
      };
      events: {
        onReady: (event: { target: YouTubePlayerInstance }) => void;
        onStateChange: (event: { data: number }) => void;
        onError: (event: { data: number }) => void;
        onAutoplayBlocked: () => void;
      };
    }
  ) => Partial<YouTubePlayerInstance>;
  PlayerState: {
    ENDED: number;
    PAUSED: number;
    PLAYING: number;
  };
};

declare global {
  interface Window {
    YT?: YouTubePlayerApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YouTubePlayerApi> | null = null;

const loadYouTubePlayerApi = () => {
  if (window.YT?.Player) return Promise.resolve(window.YT);

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise<YouTubePlayerApi>((resolve, reject) => {
      const previousReadyHandler = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReadyHandler?.();

        if (window.YT?.Player) {
          resolve(window.YT);
        } else {
          reject(new Error("YouTube player API did not initialize."));
        }
      };

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        script.onerror = () => reject(new Error("YouTube player API could not load."));
        document.head.appendChild(script);
      }
    });
  }

  return youtubeApiPromise;
};

const YouTubePlayer = ({ track, onEnded, onReadyChange, className }: Props) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const provisionalPlayerRef = useRef<Partial<YouTubePlayerInstance> | null>(null);
  const onEndedRef = useRef(onEnded);
  const [iframeHasLoaded, setIframeHasLoaded] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const {
    isPlaying,
    volume,
    isSeeking,
    seekTarget,
    setCurrentTime,
    setDuration,
    setPlaying,
    clearSeekRequest,
  } = usePlayerStore();
  const videoId = track?.source.provider === "youtube" ? track.source.externalId : null;
  const videoUrl = track?.source.provider === "youtube" ? track.source.url : null;
  const ownsActivePlayback = useCallback(() => {
    const active = usePlayerStore.getState();
    const activeSource = active.tracks[active.activeTrack]?.source;

    return activeSource?.provider === "youtube" && activeSource.externalId === videoId;
  }, [videoId]);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    if (!videoId || !iframeHasLoaded || !iframeRef.current) {
      onReadyChange?.(false);
      return;
    }

    let isDisposed = false;
    setPlaybackError(null);
    onReadyChange?.(false);

    loadYouTubePlayerApi()
      .then((api) => {
        if (isDisposed || !iframeRef.current) return;

        provisionalPlayerRef.current = new api.Player(iframeRef.current, {
          events: {
            onReady: ({ target }) => {
              if (!ownsActivePlayback()) return;

              playerRef.current = target;
              onReadyChange?.(true);
              const state = usePlayerStore.getState();
              target.setVolume(state.volume * 100);

              if (state.volume === 0) {
                target.mute();
              } else {
                target.unMute();
              }

              setDuration(target.getDuration());

              if (state.seekTarget !== null) {
                target.seekTo(state.seekTarget, true);
                clearSeekRequest();
              }

              if (state.isPlaying) {
                target.playVideo();
              }
            },
            onStateChange: ({ data }) => {
              if (!ownsActivePlayback()) return;

              if (data === api.PlayerState.ENDED) {
                onEndedRef.current();
              } else if (data === api.PlayerState.PLAYING) {
                setPlaying(true);
              } else if (data === api.PlayerState.PAUSED) {
                setPlaying(false);
              }
            },
            onError: ({ data }) => {
              if (!ownsActivePlayback()) return;

              const message =
                data === 101 || data === 150
                  ? "This video owner does not allow embedded playback."
                  : data === 153
                    ? "YouTube could not identify this embedded player. Open the video on YouTube."
                    : "YouTube could not play this video in the embedded player.";

              setPlaybackError(message);
              setPlaying(false);
            },
            onAutoplayBlocked: () => {
              if (!ownsActivePlayback()) return;

              setPlaybackError("Use the YouTube play button in the video above to start audio.");
              setPlaying(false);
            },
          },
        });
      })
      .catch(() => {
        onReadyChange?.(false);
        setPlaying(false);
      });

    return () => {
      isDisposed = true;
      onReadyChange?.(false);
      if (ownsActivePlayback() && playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
      provisionalPlayerRef.current?.destroy?.();
      provisionalPlayerRef.current = null;
      playerRef.current = null;
    };
  }, [
    clearSeekRequest,
    iframeHasLoaded,
    onReadyChange,
    ownsActivePlayback,
    setCurrentTime,
    setDuration,
    setPlaying,
    videoId,
  ]);

  useEffect(() => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying]);

  useEffect(() => {
    const handlePlaybackCommand = (event: Event) => {
      const command = (event as CustomEvent<PlaybackCommand>).detail;
      const player = playerRef.current;
      if (!player) return;

      if (command === "play") {
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    };

    window.addEventListener(YOUTUBE_PLAYBACK_EVENT, handlePlaybackCommand);

    return () => {
      window.removeEventListener(YOUTUBE_PLAYBACK_EVENT, handlePlaybackCommand);
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    player.setVolume(volume * 100);

    if (volume === 0) {
      player.mute();
    } else {
      player.unMute();
    }
  }, [volume]);

  useEffect(() => {
    if (seekTarget === null || !playerRef.current) return;

    playerRef.current.seekTo(seekTarget, true);
    clearSeekRequest();
  }, [clearSeekRequest, seekTarget]);

  useEffect(() => {
    if (!videoId) return;

    const intervalId = window.setInterval(() => {
      if (!ownsActivePlayback()) return;

      const player = playerRef.current;
      if (
        !player ||
        isSeeking ||
        typeof player.getCurrentTime !== "function" ||
        typeof player.getDuration !== "function"
      ) {
        return;
      }

      setCurrentTime(player.getCurrentTime());
      setDuration(player.getDuration());
    }, 350);

    return () => window.clearInterval(intervalId);
  }, [isSeeking, ownsActivePlayback, setCurrentTime, setDuration, videoId]);

  if (!videoId) return null;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1`;

  return (
    <section
      aria-label="YouTube player"
      className={`overflow-hidden rounded-xl border border-[var(--player-border)] bg-black p-1.5 ${
        className ?? ""
      }`}
    >
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={track?.title ?? "YouTube song"}
        className="aspect-video min-h-[200px] w-full overflow-hidden rounded-xl"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        onLoad={() => setIframeHasLoaded(true)}
      />
      {playbackError && (
        <div className="space-y-1 px-2 pb-1 pt-2 text-xs text-red-400" role="alert">
          <p>{playbackError}</p>
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-violet-400 underline underline-offset-2"
            >
              Open on YouTube
            </a>
          )}
        </div>
      )}
    </section>
  );
};

export default YouTubePlayer;
