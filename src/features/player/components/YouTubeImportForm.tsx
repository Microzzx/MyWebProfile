"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { MdAdd, MdLink } from "react-icons/md";
import type { Track } from "../track-catalog";

type Props = {
  onTrackImported: (track: Track) => void;
};

type ImportResponse = {
  track?: Track;
  error?: string;
};

const YouTubeImportForm = ({ onTrackImported }: Props) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/tracks/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const result = (await response.json()) as ImportResponse;

      if (!response.ok || !result.track) {
        throw new Error(result.error ?? "Unable to import this YouTube video.");
      }

      onTrackImported(result.track);
      setUrl("");
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : "Unable to import this YouTube video."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor="youtube-track-url" className="player-muted text-[11px] font-medium">
        Add from YouTube
      </label>
      <div className="flex items-center gap-2">
        <div className="player-track flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2.5">
          <MdLink aria-hidden className="player-muted flex-shrink-0" />
          <input
            id="youtube-track-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste YouTube link"
            required
            className="player-text min-w-0 flex-1 bg-transparent py-2 text-xs outline-none placeholder:text-[var(--player-subtle)]"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          aria-label="Add YouTube song"
          className="flex h-9 items-center gap-1 rounded-lg bg-violet-500 px-3 text-xs font-medium text-white transition-colors hover:bg-violet-400 disabled:cursor-wait disabled:opacity-60"
        >
          <MdAdd size={16} />
          {isLoading ? "Adding" : "Add"}
        </button>
      </div>
      {error && (
        <p className="text-[11px] leading-4 text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  );
};

export default YouTubeImportForm;
