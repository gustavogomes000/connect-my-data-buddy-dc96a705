import { useEffect, useState } from "react";
import { getActivePodcasts, type PodcastItem } from "@/lib/public-api";

function getYoutubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function PodcastsSection() {
  const [items, setItems] = useState<PodcastItem[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    getActivePodcasts().then(setItems).catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="podcasts-section">
      <div className="podcasts-container">
        <div className="podcasts-header">
          <span className="podcasts-icon" aria-hidden>🎧</span>
          <h2>Podcasts</h2>
        </div>

        <div className="podcasts-grid">
          {items.map((p) => {
            const ytId = getYoutubeId(p.youtube_url);
            const isPlaying = playing === p.id;
            const thumb = p.thumbnail_url || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "");

            return (
              <article key={p.id} className="podcast-card">
                <div className="podcast-media">
                  {isPlaying && ytId ? (
                    <iframe
                      className="podcast-iframe"
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                      title={p.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      type="button"
                      className="podcast-thumb"
                      onClick={() => setPlaying(p.id)}
                      style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
                      aria-label={`Reproduzir ${p.title}`}
                    >
                      <span className="podcast-play">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden>
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </button>
                  )}
                </div>
                <div className="podcast-info">
                  <h3 className="podcast-title">{p.title}</h3>
                  {p.description && <p className="podcast-desc">{p.description}</p>}
                  {!isPlaying && (
                    <button className="podcast-cta" onClick={() => setPlaying(p.id)}>
                      ▶ Escutar episódio
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <style>{`
        .podcasts-section {
          background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
          padding: 48px 16px;
        }
        .podcasts-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .podcasts-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }
        .podcasts-icon {
          font-size: 32px;
          filter: drop-shadow(0 2px 4px rgba(255,193,7,0.4));
        }
        .podcasts-header h2 {
          font-size: 32px;
          font-weight: 800;
          color: #0c2651;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .podcasts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }
        .podcast-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(12,38,81,0.08);
          transition: transform .2s ease, box-shadow .2s ease;
          display: flex;
          flex-direction: column;
        }
        .podcast-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(12,38,81,0.15);
        }
        .podcast-media {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background: #0c2651;
          overflow: hidden;
        }
        .podcast-iframe {
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
        }
        .podcast-thumb {
          width: 100%;
          height: 100%;
          border: 0;
          cursor: pointer;
          background-color: #0c2651;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: filter .2s;
        }
        .podcast-thumb::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,.45) 100%);
        }
        .podcast-thumb:hover { filter: brightness(1.1); }
        .podcast-play {
          position: relative;
          z-index: 2;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #ffc107;
          color: #0c2651;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(0,0,0,0.4);
          transition: transform .2s;
        }
        .podcast-thumb:hover .podcast-play { transform: scale(1.1); }
        .podcast-info {
          padding: 18px 20px 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .podcast-title {
          font-size: 18px;
          font-weight: 700;
          color: #0c2651;
          margin: 0;
          line-height: 1.3;
        }
        .podcast-desc {
          font-size: 14px;
          color: #5a6b85;
          margin: 0;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .podcast-cta {
          margin-top: auto;
          align-self: flex-start;
          background: #0c2651;
          color: #ffc107;
          border: 0;
          padding: 10px 18px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: background .2s, transform .1s;
        }
        .podcast-cta:hover { background: #163a7a; }
        .podcast-cta:active { transform: scale(0.97); }
      `}</style>
    </section>
  );
}
