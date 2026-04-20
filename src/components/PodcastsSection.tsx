import { useEffect, useState } from "react";
import { getActivePodcasts, type PodcastItem } from "@/lib/public-api";
import { motion, type Variants } from "framer-motion";

function getYoutubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, bounce: 0.4 } }
};

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
        <motion.div 
          className="podcasts-header"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <span className="podcasts-icon" aria-hidden>🎧</span>
          <h2>Podcasts</h2>
        </motion.div>

        <motion.div 
          className="podcasts-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {items.map((p) => {
            const ytId = getYoutubeId(p.youtube_url);
            const isPlaying = playing === p.id;
            const thumb = p.thumbnail_url || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "");

            return (
              <motion.article 
                key={p.id} 
                className="podcast-card"
                variants={itemVariants}
                whileHover={{ y: -6, boxShadow: "0 12px 32px rgba(12,38,81,0.15)" }}
              >
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
                      <motion.span 
                        className="podcast-play"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden>
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </motion.span>
                    </button>
                  )}
                </div>
                <div className="podcast-info">
                  <h3 className="podcast-title">{p.title}</h3>
                  {p.description && <p className="podcast-desc">{p.description}</p>}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
                    {!isPlaying && (
                      <motion.button 
                        className="podcast-cta" 
                        onClick={() => setPlaying(p.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ▶ Escutar no site
                      </motion.button>
                    )}
                    {p.youtube_url && (
                      <motion.a 
                        className="podcast-cta podcast-cta-yt" 
                        href={p.youtube_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ background: '#c8102e', color: '#fff', textDecoration: 'none' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        📺 Ver no YouTube
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
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
          transition: border-radius .2s ease;
          display: flex;
          flex-direction: column;
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
        }
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
          transition: background .2s;
        }
        .podcast-cta:hover { background: #163a7a; }
      `}</style>
    </section>
  );
}

