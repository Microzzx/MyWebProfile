"use client";
import type { ChangeEvent } from "react";
import {
  BsFillVolumeUpFill,
  BsVolumeDownFill,
  BsFillVolumeMuteFill,
} from "react-icons/bs";
import { usePlayerStore } from "../player-store";

type VolumeProps = {
  min?: number;
  max?: number;
};

const VolumeControl = ({ min = 0, max = 1 }: VolumeProps) => {
  const { volume, setVolume } = usePlayerStore();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const toggleMute = () => {
    setVolume(volume === 0 ? 0.7 : 0);
  };

  const VolumeIcon =
    volume === 0
      ? BsFillVolumeMuteFill
      : volume <= 0.5
      ? BsVolumeDownFill
      : BsFillVolumeUpFill;

  const percent = (volume / max) * 100;

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={toggleMute}
        aria-label={volume === 0 ? "Unmute" : "Mute"}
        className="player-muted player-control rounded-lg transition-colors cursor-pointer p-1"
      >
        <VolumeIcon size={17} />
      </button>

      {/* Slider with violet fill */}
      <div className="relative flex items-center group" style={{ width: 64, height: 16 }}>
        <div className="absolute inset-y-0 flex items-center w-full pointer-events-none">
          <div className="player-track w-full h-[3px] rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-400 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <input
          type="range"
          value={volume}
          min={min}
          max={max}
          step={0.01}
          onChange={handleChange}
          aria-label="Volume"
          className="
            relative w-full h-[3px] appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            player-thumb
            [&::-webkit-slider-thumb]:opacity-0
            group-hover:[&::-webkit-slider-thumb]:opacity-100
            [&::-webkit-slider-thumb]:transition-opacity
            [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:h-3
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:opacity-0
            group-hover:[&::-moz-range-thumb]:opacity-100
          "
        />
      </div>
    </div>
  );
};

export default VolumeControl;
