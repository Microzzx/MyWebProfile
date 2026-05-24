# My Web Profile

A personal portfolio built with Next.js, Tailwind CSS, and Zustand. The page
includes a themed navigation bar, resume-based content, a video background,
and a floating music player.

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

```text
src/
  app/                       Route entry points and document metadata
  components/layout/         Shared app shell, header, and background
  features/portfolio/        Portfolio page and content sections
  features/player/           Player state, UI, and track catalog
  styles/                    Global theme and component tokens
public/
  data/track/                Local music artwork and audio files
  videos/                    Background video
```

## Track Sources

Tracks are declared in `src/features/player/track-catalog.ts` rather than
loaded from a public JSON file. The `TrackSource` type supports local audio,
Spotify references, and YouTube references without changing the player UI.

Local tracks play through the current HTML audio component. Adding Spotify or
YouTube playback later only requires a provider adapter at the
`resolveAudioSource` boundary, plus any provider-specific authorization or
embed handling.

## Commands

```bash
npm run dev
npm run build
npm run lint
```
