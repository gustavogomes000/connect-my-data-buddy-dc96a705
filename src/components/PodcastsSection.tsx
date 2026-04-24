import { useEffect, useState } from "react";
import { getActivePodcasts, type PodcastItem } from "@/lib/public-api";
import { motion, AnimatePresence, type Variants } from "framer-motion";

function getYoutubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, bounce: 0.4 } },
};

const MAX_HOME = 3;

function PodcastCard({
  p,
  isPlaying,
  onPlay,
}: {
  p: PodcastItem;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  const ytId = getYoutubeId(p.youtube_url);
  const thumb = p.thumbnail_url || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "");

  return (
    <motion.article
      className="podcast-card"
      variants={itemVariants}
      whileHover={{ y: -6, boxShadow: "0 12px 32px rgba(12,38,81,0.15)" }}
    >
      <div className="podcast-media">
        {isPlaying && ytId ? (
          <iframe
            className="podcast-iframe"
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
            title={p.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="podcast-thumb"
            onClick={onPlay}
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
        {!isPlaying && (
          <motion.button
            className="podcast-cta"
            onClick={onPlay}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ▶ Escutar agora
          </motion.button>
        )}
      </div>
    </motion.article>
  );
}

export function PodcastsSection() {
  const [items, setItems] = useState<PodcastItem[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPlaying, setModalPlaying] = useState<string | null>(null);

  useEffect(() => {
    getActivePodcasts().then(setItems).catch(() => setItems([]));
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setModalOpen(false);
    window.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  if (items.length === 0) return null;

  const visible = items.slice(0, MAX_HOME);
  const hasMore = items.length > MAX_HOME;

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
          {visible.map((p) => (
            <PodcastCard
              key={p.id}
              p={p}
              isPlaying={playing === p.id}
              onPlay={() => setPlaying(p.id)}
            />
          ))}
        </motion.div>

        {hasMore && (
          <div className="podcasts-more-wrap">
            <motion.button
              className="podcasts-more-btn"
              onClick={() => setModalOpen(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Ver todos os podcasts ({items.length})
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="podcasts-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className="podcasts-modal"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              transition={{ type: "spring", bounce: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="podcasts-modal-header">
                <h3>Todos os podcasts</h3>
                <button
                  type="button"
                  className="podcasts-modal-close"
                  onClick={() => setModalOpen(false)}
                  aria-label="Fechar"
                >
                  ✕
                </button>
              </div>
              <div className="podcasts-modal-grid">
                {items.map((p) => (
                  <PodcastCard
                    key={p.id}
                    p={p}
                    isPlaying={modalPlaying === p.id}
                    onPlay={() => setModalPlaying(p.id)}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          justify-content: center;
          gap: 12px;
          margin-bottom: 28px;
          text-align: center;
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
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          justify-content: center;
        }
        .podcast-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(12,38,81,0.08);
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
          text-align: center;
          align-items: center;
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
          background: #0c2651;
          color: #ffc107;
          border: 0;
          padding: 10px 22px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: background .2s;
        }
        .podcast-cta:hover { background: #163a7a; }

        .podcasts-more-wrap {
          display: flex;
          justify-content: center;
          margin-top: 32px;
        }
        .podcasts-more-btn {
          background: #ffc107;
          color: #0c2651;
          border: 0;
          padding: 14px 32px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(255,193,7,0.35);
        }

        .podcasts-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(8, 18, 40, 0.75);
          backdrop-filter: blur(6px);
          z-index: 9998;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 32px 16px;
          overflow-y: auto;
        }
        .podcasts-modal {
          background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
          border-radius: 20px;
          width: 100%;
          max-width: 1100px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        .podcasts-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding: 0 4px;
        }
        .podcasts-modal-header h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          color: #0c2651;
        }
        .podcasts-modal-close {
          background: #0c2651;
          color: #ffc107;
          border: 0;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .podcasts-modal-close:hover { background: #163a7a; }
        .podcasts-modal-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
        }

        @media (max-width: 640px) {
          .podcasts-header h2 { font-size: 26px; }
          .podcasts-modal { padding: 16px; border-radius: 16px; }
          .podcasts-modal-header h3 { font-size: 20px; }
        }
      `}</style>
    </section>
  );
}
