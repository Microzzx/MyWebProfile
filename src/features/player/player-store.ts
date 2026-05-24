import { create } from "zustand";
import { TRACK_CATALOG, type Track } from "./track-catalog";

export const PLAYER_SESSION_STORAGE_KEY = "portfolio-player-session";

export type PersistedPlayerSession = {
  youtubeTracks?: unknown;
  activeTrackId?: unknown;
  progressByTrackId?: unknown;
  volume?: unknown;
};

interface PlayerState {
  tracks: Track[];
  activeTrack: number;
  isPlaying: boolean;
  isExpanded: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isSeeking: boolean;
  seekTarget: number | null;
  progressByTrackId: Record<string, number>;
  hasRestoredSession: boolean;

  addTrack: (track: Track) => void;
  removeImportedTrack: (trackId: string) => void;
  restoreSession: (session: PersistedPlayerSession | null) => void;
  setActiveTrack: (index: number) => void;
  setPlaying: (isPlaying: boolean) => void;
  setExpanded: (isExpanded: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (currentTime: number) => void;
  setDuration: (duration: number) => void;
  setSeeking: (isSeeking: boolean) => void;
  requestSeek: (time: number) => void;
  clearSeekRequest: () => void;
}

const isStoredYouTubeTrack = (value: unknown): value is Track => {
  if (!value || typeof value !== "object") return false;

  const track = value as Partial<Track>;
  return (
    typeof track.id === "string" &&
    typeof track.title === "string" &&
    typeof track.artwork === "string" &&
    track.source?.provider === "youtube" &&
    typeof track.source.externalId === "string" &&
    typeof track.source.url === "string"
  );
};

const parseProgress = (value: unknown) => {
  if (!value || typeof value !== "object") return {};

  return Object.fromEntries(
    Object.entries(value).filter(
      ([trackId, time]) =>
        trackId.length > 0 && typeof time === "number" && Number.isFinite(time) && time >= 0
    )
  );
};

export const usePlayerStore = create<PlayerState>((set) => ({
  tracks: TRACK_CATALOG,
  activeTrack: 0,
  isPlaying: false,
  isExpanded: true,
  volume: 0.2,
  currentTime: 0,
  duration: 0,
  isSeeking: false,
  seekTarget: null,
  progressByTrackId: {},
  hasRestoredSession: false,

  addTrack: (track) =>
    set((state) =>
      state.tracks.some((existingTrack) => existingTrack.id === track.id)
        ? state
        : { tracks: [...state.tracks, track] }
    ),
  removeImportedTrack: (trackId) =>
    set((state) => {
      const removedIndex = state.tracks.findIndex(
        (track) => track.id === trackId && track.source.provider === "youtube"
      );
      if (removedIndex < 0) return state;

      const tracks = state.tracks.filter((track) => track.id !== trackId);
      const progressByTrackId = { ...state.progressByTrackId };
      delete progressByTrackId[trackId];

      if (removedIndex !== state.activeTrack) {
        return {
          tracks,
          progressByTrackId,
          activeTrack:
            removedIndex < state.activeTrack ? state.activeTrack - 1 : state.activeTrack,
        };
      }

      const activeTrack = Math.min(removedIndex, tracks.length - 1);
      const currentTime = progressByTrackId[tracks[activeTrack].id] ?? 0;

      return {
        tracks,
        activeTrack,
        currentTime,
        duration: 0,
        seekTarget: currentTime > 0 ? currentTime : null,
        progressByTrackId,
        isPlaying: false,
      };
    }),
  restoreSession: (session) =>
    set(() => {
      const youtubeTracks = Array.isArray(session?.youtubeTracks)
        ? session.youtubeTracks.filter(isStoredYouTubeTrack)
        : [];
      const tracks = [
        ...TRACK_CATALOG,
        ...youtubeTracks.filter(
          (track) => !TRACK_CATALOG.some((catalogTrack) => catalogTrack.id === track.id)
        ),
      ];
      const progressByTrackId = parseProgress(session?.progressByTrackId);
      const activeTrackId =
        typeof session?.activeTrackId === "string" ? session.activeTrackId : TRACK_CATALOG[0].id;
      const restoredIndex = tracks.findIndex((track) => track.id === activeTrackId);
      const activeTrack = restoredIndex >= 0 ? restoredIndex : 0;
      const currentTime = progressByTrackId[tracks[activeTrack].id] ?? 0;
      const volume =
        typeof session?.volume === "number" && session.volume >= 0 && session.volume <= 1
          ? session.volume
          : 0.2;

      return {
        tracks,
        activeTrack,
        volume,
        currentTime,
        seekTarget: currentTime > 0 ? currentTime : null,
        progressByTrackId,
        isPlaying: false,
        hasRestoredSession: true,
      };
    }),
  setActiveTrack: (activeTrack) =>
    set((state) => {
      const currentTime = state.progressByTrackId[state.tracks[activeTrack]?.id] ?? 0;

      return {
        activeTrack,
        currentTime,
        seekTarget: currentTime > 0 ? currentTime : null,
      };
    }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setExpanded: (isExpanded) => set({ isExpanded }),
  setVolume: (volume) => set({ volume }),
  setCurrentTime: (currentTime) =>
    set((state) => {
      const trackId = state.tracks[state.activeTrack]?.id;
      if (!trackId) return { currentTime };

      return {
        currentTime,
        progressByTrackId: {
          ...state.progressByTrackId,
          [trackId]: currentTime,
        },
      };
    }),
  setDuration: (duration) => set({ duration }),
  setSeeking: (isSeeking) => set({ isSeeking }),
  requestSeek: (seekTarget) => set({ seekTarget }),
  clearSeekRequest: () => set({ seekTarget: null }),
}));
