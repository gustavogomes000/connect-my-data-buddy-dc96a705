import { useCallback, useEffect, useState } from "react";
import { getNews, createNews, updateNews, deleteNews } from "@/lib/admin-api";
import { ImageUploader } from "./ImageUploader";
import { NewsIcon, PencilIcon, PinIcon, PlusIcon, PowerIcon, TrashIcon } from "./icons";
import type { NewsItem } from "./types";

const EMPTY = {
  title: "",
  content: "",
  summary: "",
  image_url: "",
  podcast_link: "",
  display_order: 0,
};

export function NewsManager() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await getNews();
    setNews(data as NewsItem[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reset = () => {
    setForm(EMPTY);
    setEditing(null);
    setShowForm(false);
  };

  const save = async () => {
    if (!form.title.trim()) {
      alert("Informe o título");
      return;
    }
    setSaving(true);
    try {
      if (editing) await updateNews({ data: { id: editing.id, ...form } });
      else await createNews({ data: form });
      reset();
      load();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (n: NewsItem) => {
    setForm({
      title: n.title,
      content: n.content || "",
      summary: n.summary || "",
      image_url: n.image_url || "",
      podcast_link: n.podcast_link || "",
      display_order: n.display_order ?? 0,
    });
    setEditing(n);
    setShowForm(true);
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta notícia?")) return;
    await deleteNews({ data: { id } });
    load();
  };

  const togglePub = async (n: NewsItem) => {
    await updateNews({ data: { id: n.id, is_published: !n.is_published } });
    load();
  };

  const PIN_LIMIT = 3;
  const togglePin = async (n: NewsItem) => {
    const isPinned = !!n.is_pinned;
    if (!isPinned) {
      const pinnedCount = news.filter((x) => x.is_pinned).length;
      if (pinnedCount >= PIN_LIMIT) {
        alert(`Você já fixou ${PIN_LIMIT} notícias. Desafixe uma antes de fixar outra.`);
        return;
      }
    }
    await updateNews({
      data: {
        id: n.id,
        is_pinned: !isPinned,
        pinned_at: !isPinned ? new Date().toISOString() : null,
      },
    });
    load();
  };

  return (
    <section className="admin-section">
      <header className="admin-section-header">
        <h1>
          <NewsIcon /> <span>Notícias</span>
        </h1>
        <button
          className="admin-btn-primary"
          onClick={() => {
            reset();
            setShowForm(true);
          }}
        >
          <PlusIcon /> Nova notícia
        </button>
      </header>

      {showForm && (
        <div className="admin-form-card">
          <h3>{editing ? "Editar notícia" : "Nova notícia"}</h3>
          <div className="admin-field">
            <label>Título *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Título da notícia"
              maxLength={180}
            />
          </div>
          <div className="admin-field">
            <label>Resumo (aparece na listagem)</label>
            <textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Resumo curto..."
              rows={2}
              maxLength={300}
            />
          </div>
          <div className="admin-field">
            <label>Conteúdo completo</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Texto completo..."
              rows={8}
            />
          </div>
          <div className="admin-field">
            <label>Imagem de capa</label>
            {form.image_url && <img src={form.image_url} alt="" className="admin-preview-img" />}
            <ImageUploader onUploaded={(url) => setForm({ ...form, image_url: url })} />
            <input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="ou cole uma URL"
            />
          </div>
          <div className="admin-field">
            <label>Link de podcast (opcional)</label>
            <input
              value={form.podcast_link}
              onChange={(e) => setForm({ ...form, podcast_link: e.target.value })}
              placeholder="https://podcast..."
            />
          </div>
          <div className="admin-field">
            <label>Ordem de exibição</label>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
            />
          </div>
          <div className="admin-form-actions">
            <button className="admin-btn-primary" onClick={save} disabled={saving}>
              {saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar notícia"}
            </button>
            <button className="admin-btn-secondary" onClick={reset}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="admin-list">
        {news.length === 0 && <p className="admin-empty">Nenhuma notícia cadastrada.</p>}
        {news.map((n) => (
          <article key={n.id} className={`admin-list-item ${!n.is_published ? "inactive" : ""}`}>
            {n.image_url && <img src={n.image_url} alt="" className="admin-list-thumb" />}
            <div className="admin-list-info">
              <h4>{n.title}</h4>
              <p>{n.summary || n.content?.slice(0, 140) || "—"}</p>
              <div className="admin-list-tags">
                <span className={`admin-tag ${n.is_published ? "tag-success" : "tag-muted"}`}>
                  {n.is_published ? "Publicada" : "Rascunho"}
                </span>
                {n.is_pinned && <span className="admin-tag tag-warning">Fixada</span>}
                {n.podcast_link && <span className="admin-tag">Podcast</span>}
              </div>
            </div>
            <div className="admin-list-actions">
              <button onClick={() => togglePub(n)} title={n.is_published ? "Despublicar" : "Publicar"}>
                <PowerIcon />
              </button>
              <button
                onClick={() => togglePin(n)}
                title={n.is_pinned ? "Desafixar" : "Fixar (máx. 3)"}
                className={n.is_pinned ? "active" : ""}
              >
                <PinIcon />
              </button>
              <button onClick={() => startEdit(n)} title="Editar">
                <PencilIcon />
              </button>
              <button className="danger" onClick={() => remove(n.id)} title="Excluir">
                <TrashIcon />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
