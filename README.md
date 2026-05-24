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
other playback providers later can be handled at the provider boundary.

### YouTube Import

The song list accepts YouTube video links. Metadata is loaded server-side with
the YouTube Data API v3, and imported tracks play through the official YouTube
IFrame player.

Create `.env.local` from `.env.example` and provide a YouTube Data API v3 key:

```bash
YOUTUBE_DATA_API_KEY=your_youtube_data_api_v3_key
```

The key remains server-side in the `/api/tracks/youtube` route and is never
exposed to the browser.
Imported YouTube tracks and each track's last progress position are saved in
the current browser's local storage. Playback is restored paused, so the user
must press Play after a page reload in accordance with browser autoplay rules.
Videos whose owners disable embedded playback cannot be played inside the
portfolio player.

## Commands

```bash
npm run dev
npm run build
npm run lint
```
