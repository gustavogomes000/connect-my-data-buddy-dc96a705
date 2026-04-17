import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { Link } from "@tanstack/react-router";
import topLogo from "@/assets/top100-logo.png";
import { radioAudio } from "@/lib/radio-audio";
import { AudioVisualizer } from "@/components/AudioVisualizer";

export function SiteHeader() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const sync = () => {
      const s = radioAudio.getState();
      setIsPlaying(s.isPlaying);
      setVolume(s.volume);
    };
    sync();
    const unsub = radioAudio.subscribe(sync);
    radioAudio.autoStart();

    const startOnInteract = () => {
      radioAudio.play();
      window.removeEventListener("pointerdown", startOnInteract);
      window.removeEventListener("keydown", startOnInteract);
    };
    if (!radioAudio.getState().isPlaying) {
      window.addEventListener("pointerdown", startOnInteract, { once: true });
      window.addEventListener("keydown", startOnInteract, { once: true });
    }
    return () => {
      unsub();
      window.removeEventListener("pointerdown", startOnInteract);
      window.removeEventListener("keydown", startOnInteract);
    };
  }, []);

  const togglePlay = useCallback(() => radioAudio.toggle(), []);
  const handleVolume = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    radioAudio.setVolume(v);
  }, []);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* Logo (left) */}
        <Link to="/" className="header-logo-wrap" aria-label="TOP100 FM Home">
          <img src={topLogo} alt="TOP100 FM" className="site-header-logo-img" />
        </Link>

        {/* Centered nav (desktop) */}
        <nav className="header-nav-desktop" aria-label="Principal">
          <Link to="/" className="header-nav-link" activeProps={{ className: "header-nav-link active" }} activeOptions={{ exact: true }}>HOME</Link>
          <Link to="/noticias" className="header-nav-link" activeProps={{ className: "header-nav-link active" }}>NOTÍCIAS</Link>
          <Link to="/programacao" className="header-nav-link" activeProps={{ className: "header-nav-link active" }}>PROGRAMAÇÃO</Link>
          <Link to="/promocoes" className="header-nav-link" activeProps={{ className: "header-nav-link active" }}>PROMOÇÃO</Link>
          <Link to="/contato" className="header-nav-link" activeProps={{ className: "header-nav-link active" }}>CONTATO</Link>
        </nav>

        {/* Player original (right) */}
        <div className={`header-player ${isPlaying ? "is-playing" : ""}`}>
          <button
            onClick={togglePlay}
            className="header-play-btn"
            aria-label={isPlaying ? "Pausar" : "Tocar"}
          >
            {isPlaying ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <span className="viz-desktop"><AudioVisualizer active={isPlaying} bars={6} intensity={volume} /></span>
          <span className="viz-mobile"><AudioVisualizer active={isPlaying} bars={28} intensity={volume} /></span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolume}
            className="header-vol"
            aria-label="Volume"
          />
          <div className="header-live">
            <span className="header-live-dot" />
            <span className="header-live-label">AO VIVO</span>
          </div>
        </div>
      </div>

      {/* Mobile pills */}
      <nav className="header-nav-mobile" aria-label="Principal">
        <Link to="/" className="header-pill" activeProps={{ className: "header-pill active" }} activeOptions={{ exact: true }}>Home</Link>
        <Link to="/noticias" className="header-pill" activeProps={{ className: "header-pill active" }}>Notícias</Link>
        <Link to="/programacao" className="header-pill" activeProps={{ className: "header-pill active" }}>Programação</Link>
        <Link to="/promocoes" className="header-pill" activeProps={{ className: "header-pill active" }}>Promoção</Link>
        <Link to="/contato" className="header-pill" activeProps={{ className: "header-pill active" }}>Contato</Link>
      </nav>
    </header>
  );
}
