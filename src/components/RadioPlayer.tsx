import { useState, useRef, useCallback, type ChangeEvent } from "react";

export function RadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      audio.src = "";
      setIsPlaying(false);
    } else {
      audio.src = "https://server29.srvsh.com.br:7618/;?type=http&nocache";
      audio.load();
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleVolume = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  }, []);

  return (
    <div className="radio-player-shell">
      <div className="radio-player-inner">
        <button
          onClick={togglePlay}
          className="radio-play-button"
          aria-label={isPlaying ? "Pausar" : "Tocar"}
        >
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolume}
          className="radio-volume-slider"
        />

        <div className="radio-live-badge">
          <span className="radio-live-dot" />
          <span className="radio-live-text">AO VIVO</span>
        </div>
      </div>
      <audio ref={audioRef} preload="none" />
    </div>
  );
}
