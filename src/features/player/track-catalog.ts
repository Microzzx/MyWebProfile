export type LocalTrackSource = {
  provider: "local";
  src: string;
};

export type ExternalTrackSource = {
  provider: "spotify" | "youtube";
  externalId: string;
  url: string;
};

export type TrackSource = LocalTrackSource | ExternalTrackSource;

export type Track = {
  id: string;
  title: string;
  artwork: string;
  source: TrackSource;
};

export const TRACK_CATALOG: Track[] = [
  {
    id: "furret-theme",
    title: "Furret Theme",
    artwork: "/data/track/images/0_furret_theme.png",
    source: { provider: "local", src: "/data/track/songs/0_furret_theme.mp3" },
  },
  {
    id: "azalea-town",
    title: "Azalea Town OST",
    artwork: "/data/track/images/song1.png",
    source: { provider: "local", src: "/data/track/songs/1_Azalea Town OST.mp3" },
  },
  {
    id: "jubilife-city",
    title: "Jubilife City",
    artwork: "/data/track/images/song1.png",
    source: {
      provider: "local",
      src: "/data/track/songs/2_Jubilife City (Night)[Pok%C3%A9mon Diamond Pearl].mp3",
    },
  },
  {
    id: "andrew-cupid",
    title: "Andrew Cupid",
    artwork: "/data/track/images/song1.png",
    source: { provider: "local", src: "/data/track/songs/3_andrew_cupid.mp3" },
  },
];

export const getTrack = (index: number) => TRACK_CATALOG[index];

export const resolveAudioSource = (track: Track | undefined) => {
  if (!track || track.source.provider !== "local") return null;
  return track.source.src;
};
