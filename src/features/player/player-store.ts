import { create } from "zustand";

interface PlayerState {
  activeTrack: number;
  isPlaying: boolean;
  isExpanded: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isSeeking: boolean;

  setActiveTrack: (index: number) => void;
  setPlaying: (isPlaying: boolean) => void;
  setExpanded: (isExpanded: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (currentTime: number) => void;
  setDuration: (duration: number) => void;
  setSeeking: (isSeeking: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  activeTrack: 0,
  isPlaying: false,
  isExpanded: true,
  volume: 0.2,
  currentTime: 0,
  duration: 0,
  isSeeking: false,

  setActiveTrack: (activeTrack) => set({ activeTrack }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setExpanded: (isExpanded) => set({ isExpanded }),
  setVolume: (volume) => set({ volume }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setSeeking: (isSeeking) => set({ isSeeking }),
}));
