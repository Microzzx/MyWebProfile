import { NextResponse } from "next/server";
import type { Track } from "@/features/player/track-catalog";

type ImportBody = {
  url?: unknown;
};

type YouTubeVideoResponse = {
  items?: Array<{
    snippet?: {
      title?: string;
      thumbnails?: Record<string, { url?: string }>;
    };
    status?: {
      embeddable?: boolean;
    };
  }>;
  error?: {
    message?: string;
  };
};

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const getVideoId = (input: string) => {
  try {
    const url = new URL(input.trim());
    const hostname = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
    let videoId: string | null = null;

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/")[1] ?? null;
    } else if (hostname === "youtube.com" || hostname === "music.youtube.com") {
      const [resource, id] = url.pathname.split("/").filter(Boolean);
      if (resource === "watch") {
        videoId = url.searchParams.get("v");
      } else if (resource === "shorts" || resource === "embed" || resource === "live") {
        videoId = id ?? null;
      }
    }

    return videoId && VIDEO_ID_PATTERN.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  let body: ImportBody;

  try {
    body = (await request.json()) as ImportBody;
  } catch {
    return NextResponse.json({ error: "Enter a valid YouTube link." }, { status: 400 });
  }

  const videoId = typeof body.url === "string" ? getVideoId(body.url) : null;

  if (!videoId) {
    return NextResponse.json(
      { error: "Use a YouTube video, Shorts, live, embed, or youtu.be link." },
      { status: 400 }
    );
  }

  const apiKey = process.env.YOUTUBE_DATA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "YouTube import is not configured. Add YOUTUBE_DATA_API_KEY." },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    part: "snippet,status",
    id: videoId,
    key: apiKey,
  });
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`,
    { cache: "no-store" }
  );
  const result = (await response.json()) as YouTubeVideoResponse;

  if (!response.ok) {
    return NextResponse.json(
      { error: result.error?.message ?? "YouTube could not load this video." },
      { status: response.status }
    );
  }

  const video = result.items?.[0];
  const snippet = video?.snippet;

  if (!snippet?.title) {
    return NextResponse.json({ error: "YouTube video not found." }, { status: 404 });
  }

  if (video?.status?.embeddable === false) {
    return NextResponse.json(
      { error: "This YouTube video does not allow playback in embedded players." },
      { status: 422 }
    );
  }

  const thumbnails = snippet.thumbnails ?? {};
  const artwork =
    thumbnails.maxres?.url ??
    thumbnails.standard?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.default?.url ??
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const track: Track = {
    id: `youtube:${videoId}`,
    title: snippet.title,
    artwork,
    source: {
      provider: "youtube",
      externalId: videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    },
  };

  return NextResponse.json({ track });
}
