import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { checkAdminSession, adminLogout } from "@/lib/admin-auth";
import {
  getPromotions, createPromotion, updatePromotion, deletePromotion,
  getNews, createNews, updateNews, deleteNews,
  getProgramacaoAdmin, createProgramacao, updateProgramacao, deleteProgramacao,
  getPodcastsAdmin, createPodcast, updatePodcast, deletePodcast,
  getPromotionEntries, deletePromotionEntry,
  createAdminUser, getUploadUrl,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Painel Admin - TOP100 FM" }],
  }),
  component: AdminDashboard,
});

type Promotion = {
  id: string; title: string; description: string | null; image_url: string | null;
  link: string | null; is_active: boolean; display_order: number;
  popup_duration_seconds: number; show_as_popup: boolean;
};

type NewsItem = {
  id: string;
  title: string;
  content: string | null;
  summary: string | null;
  image_url: string | null;
  podcast_link: string | null;
  is_published: boolean | null;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"promos" | "entries" | "news" | "programacao" | "podcasts" | "users">("promos");

  useEffect(() => {
    checkAdminSession().then((r) => {
      if (!r.authenticated) navigate({ to: "/admin/login" });
      else { setAuthenticated(true); setLoading(false); }
    }).catch(() => navigate({ to: "/admin/login" }));
  }, [navigate]);

  const handleLogout = async () => {
    await adminLogout();
    navigate({ to: "/admin/login" });
  };

  if (loading || !authenticated) return <div className="admin-loading">Carregando...</div>;

  const NAV: { key: typeof tab; label: string; icon: JSX.Element }[] = [
    { key: "promos", label: "Promoções", icon: <GiftIcon /> },
    { key: "entries", label: "Inscritos", icon: <UsersIcon /> },
    { key: "news", label: "Notícias", icon: <NewsIcon /> },
    { key: "programacao", label: "Programação", icon: <CalendarIcon /> },
    { key: "podcasts", label: "Podcasts", icon: <MicIcon /> },
    { key: "users", label: "Administradores", icon: <ShieldIcon /> },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">T</div>
          <div>
            <h2>TOP100 FM</h2>
            <span>Painel administrativo</span>
          </div>
        </div>
        <nav className="admin-nav">
          {NAV.map((n) => (
            <button key={n.key} className={tab === n.key ? "active" : ""} onClick={() => setTab(n.key)}>
              <span className="admin-nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-link">↗ Ver site público</Link>
          <button onClick={handleLogout} className="admin-logout-btn">Sair</button>
        </div>
      </aside>
      <main className="admin-main">
        {tab === "promos" && <PromotionsManager />}
        {tab === "entries" && <EntriesManager />}
        {tab === "news" && <NewsManager />}
        {tab === "programacao" && <ProgramacaoManager />}
        {tab === "podcasts" && <PodcastsManager />}
        {tab === "users" && <UsersManager />}
      </main>
    </div>
  );
}

// ── Inline SVG icons (Material-style, 18x18) ──
const Svg = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const GiftIcon = () => <Svg d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />;
const UsersIcon = () => <Svg d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />;
const NewsIcon = () => <Svg d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2M18 14h-8M15 18h-5M10 6h8v4h-8z" />;
const CalendarIcon = () => <Svg d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18" />;
const MicIcon = () => <Svg d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />;
const ShieldIcon = () => <Svg d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;

// ── Image Upload Helper ──
function ImageUploader({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { signedUrl, token, publicUrl } = await getUploadUrl({
        data: { filename: file.name, contentType: file.type },
      });
      await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type, "x-upsert": "true" },
        body: file,
      });
      onUploaded(publicUrl);
    } catch (err) {
      alert("Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-uploader">
      <label className="admin-upload-btn">
        {uploading ? "Enviando..." : "📷 Escolher Imagem"}
        <input type="file" accept="image/*" onChange={handleFile} hidden />
      </label>
    </div>
  );
}

// ── Promotions Manager ──
function PromotionsManager() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", image_url: "", link: "",
    popup_duration_seconds: 10, show_as_popup: true, display_order: 0,
  });

  const load = useCallback(async () => {
    const data = await getPromotions();
    setPromos(data as Promotion[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ title: "", description: "", image_url: "", link: "", popup_duration_seconds: 10, show_as_popup: true, display_order: 0 });
    setEditing(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.title) { alert("Título obrigatório!"); return; }
    if (editing) {
      await updatePromotion({ data: { id: editing.id, ...form } });
    } else {
      await createPromotion({ data: form });
    }
    resetForm();
    load();
  };

  const handleEdit = (p: Promotion) => {
    setForm({
      title: p.title, description: p.description || "", image_url: p.image_url || "",
      link: p.link || "", popup_duration_seconds: p.popup_duration_seconds,
      show_as_popup: p.show_as_popup, display_order: p.display_order,
    });
    setEditing(p);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    await deletePromotion({ data: { id } });
    load();
  };

  const toggleActive = async (p: Promotion) => {
    await updatePromotion({ data: { id: p.id, is_active: !p.is_active } });
    load();
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>🎉 Promoções</h1>
        <button className="admin-btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          + Nova Promoção
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h3>{editing ? "Editar Promoção" : "Nova Promoção"}</h3>
          <div className="admin-field">
            <label>Título *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Concorra a ingressos!" />
          </div>
          <div className="admin-field">
            <label>Descrição</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreva a promoção..." rows={3} />
          </div>
          <div className="admin-field">
            <label>Link (opcional)</label>
            <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." />
          </div>
          <div className="admin-field">
            <label>Imagem</label>
            {form.image_url && <img src={form.image_url} alt="" className="admin-preview-img" />}
            <ImageUploader onUploaded={(url) => setForm({ ...form, image_url: url })} />
            <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Ou cole a URL da imagem" />
          </div>
          <div className="admin-row">
            <div className="admin-field">
              <label>Tempo do popup (seg)</label>
              <input type="number" value={form.popup_duration_seconds} onChange={(e) => setForm({ ...form, popup_duration_seconds: Number(e.target.value) })} min={3} max={120} />
            </div>
            <div className="admin-field">
              <label>Ordem</label>
              <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
            </div>
          </div>
          <div className="admin-field admin-checkbox">
            <label>
              <input type="checkbox" checked={form.show_as_popup} onChange={(e) => setForm({ ...form, show_as_popup: e.target.checked })} />
              Mostrar como popup na página
            </label>
          </div>
          <div className="admin-form-actions">
            <button className="admin-btn-primary" onClick={handleSave}>
              {editing ? "Salvar Alterações" : "Criar Promoção"}
            </button>
            <button className="admin-btn-secondary" onClick={resetForm}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="admin-list">
        {promos.length === 0 && <p className="admin-empty">Nenhuma promoção cadastrada.</p>}
        {promos.map((p) => (
          <div key={p.id} className={`admin-list-item ${!p.is_active ? "inactive" : ""}`}>
            {p.image_url && <img src={p.image_url} alt="" className="admin-list-thumb" />}
            <div className="admin-list-info">
              <h4>{p.title}</h4>
              <p>{p.description}</p>
              <span className="admin-tag">{p.is_active ? "✅ Ativa" : "❌ Inativa"}</span>
              {p.show_as_popup && <span className="admin-tag">🔔 Popup</span>}
              <span className="admin-tag">⏱ {p.popup_duration_seconds}s</span>
            </div>
            <div className="admin-list-actions">
              <button onClick={() => toggleActive(p)}>{p.is_active ? "Desativar" : "Ativar"}</button>
              <button onClick={() => handleEdit(p)}>Editar</button>
              <button className="danger" onClick={() => handleDelete(p.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── News Manager ──
function NewsManager() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", content: "", summary: "", image_url: "", podcast_link: "", display_order: 0,
  });

  const load = useCallback(async () => {
    const data = await getNews();
    setNews(data as NewsItem[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ title: "", content: "", summary: "", image_url: "", podcast_link: "", display_order: 0 });
    setEditing(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.title) { alert("Título obrigatório!"); return; }
    if (editing) {
      await updateNews({ data: { id: editing.id, ...form } });
    } else {
      await createNews({ data: form });
    }
    resetForm();
    load();
  };

  const handleEdit = (n: NewsItem) => {
    setForm({
      title: n.title, content: n.content || "", summary: n.summary || "",
      image_url: n.image_url || "", podcast_link: n.podcast_link || "",
      display_order: n.display_order ?? 0,
    });
    setEditing(n);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    await deleteNews({ data: { id } });
    load();
  };

  const togglePublished = async (n: NewsItem) => {
    await updateNews({ data: { id: n.id, is_published: !n.is_published } });
    load();
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>📰 Notícias</h1>
        <button className="admin-btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          + Nova Notícia
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h3>{editing ? "Editar Notícia" : "Nova Notícia"}</h3>
          <div className="admin-field">
            <label>Título *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título da notícia" />
          </div>
          <div className="admin-field">
            <label>Resumo (aparece na listagem)</label>
            <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Resumo curto..." rows={2} />
          </div>
          <div className="admin-field">
            <label>Conteúdo completo</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Texto completo da notícia..." rows={6} />
          </div>
          <div className="admin-field">
            <label>Imagem</label>
            {form.image_url && <img src={form.image_url} alt="" className="admin-preview-img" />}
            <ImageUploader onUploaded={(url) => setForm({ ...form, image_url: url })} />
            <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Ou cole a URL da imagem" />
          </div>
          <div className="admin-field">
            <label>🎙️ Link do Podcast (opcional)</label>
            <input value={form.podcast_link} onChange={(e) => setForm({ ...form, podcast_link: e.target.value })} placeholder="https://podcast..." />
          </div>
          <div className="admin-field">
            <label>Ordem de exibição</label>
            <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
          </div>
          <div className="admin-form-actions">
            <button className="admin-btn-primary" onClick={handleSave}>
              {editing ? "Salvar Alterações" : "Criar Notícia"}
            </button>
            <button className="admin-btn-secondary" onClick={resetForm}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="admin-list">
        {news.length === 0 && <p className="admin-empty">Nenhuma notícia cadastrada.</p>}
        {news.map((n) => (
          <div key={n.id} className={`admin-list-item ${!n.is_published ? "inactive" : ""}`}>
            {n.image_url && <img src={n.image_url} alt="" className="admin-list-thumb" />}
            <div className="admin-list-info">
              <h4>{n.title}</h4>
              <p>{n.summary || n.content?.slice(0, 100)}</p>
              <span className="admin-tag">{n.is_published ? "✅ Publicada" : "📝 Rascunho"}</span>
              {n.podcast_link && <span className="admin-tag">🎙️ Podcast</span>}
            </div>
            <div className="admin-list-actions">
              <button onClick={() => togglePublished(n)}>{n.is_published ? "Despublicar" : "Publicar"}</button>
              <button onClick={() => handleEdit(n)}>Editar</button>
              <button className="danger" onClick={() => handleDelete(n.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Users Manager ──
function UsersManager() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleCreate = async () => {
    if (!username || !password) { alert("Preencha usuário e senha"); return; }
    try {
      await createAdminUser({ data: { username, password } });
      setMsg(`Usuário "${username}" criado com sucesso!`);
      setUsername("");
      setPassword("");
    } catch {
      setMsg("Erro ao criar usuário");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>👤 Gerenciar Usuários Admin</h1>
      </div>
      <div className="admin-form-card">
        <h3>Criar Novo Administrador</h3>
        {msg && <div className="admin-success">{msg}</div>}
        <div className="admin-field">
          <label>Nome de Usuário</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nome do novo admin" />
        </div>
        <div className="admin-field">
          <label>Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha segura" />
        </div>
        <button className="admin-btn-primary" onClick={handleCreate}>Criar Administrador</button>
      </div>
    </div>
  );
}

// ── Programação Manager ──
type ProgItem = {
  id: string;
  day_of_week: number;
  program_name: string;
  presenter: string | null;
  start_time: string;
  end_time: string;
  display_order: number;
  is_active: boolean;
};

const DAYS_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function ProgramacaoManager() {
  const [items, setItems] = useState<ProgItem[]>([]);
  const [editing, setEditing] = useState<ProgItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    day_of_week: 1,
    program_name: "",
    presenter: "",
    start_time: "08:00",
    end_time: "10:00",
    display_order: 0,
  });

  const load = useCallback(async () => {
    const data = await getProgramacaoAdmin();
    setItems(data as ProgItem[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ day_of_week: 1, program_name: "", presenter: "", start_time: "08:00", end_time: "10:00", display_order: 0 });
    setEditing(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.program_name) { alert("Nome do programa obrigatório!"); return; }
    if (editing) {
      await updateProgramacao({ data: { id: editing.id, ...form } });
    } else {
      await createProgramacao({ data: form });
    }
    resetForm();
    load();
  };

  const handleEdit = (p: ProgItem) => {
    setForm({
      day_of_week: p.day_of_week,
      program_name: p.program_name,
      presenter: p.presenter || "",
      start_time: p.start_time.slice(0, 5),
      end_time: p.end_time.slice(0, 5),
      display_order: p.display_order ?? 0,
    });
    setEditing(p);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este programa?")) return;
    await deleteProgramacao({ data: { id } });
    load();
  };

  const toggleActive = async (p: ProgItem) => {
    await updateProgramacao({ data: { id: p.id, is_active: !p.is_active } });
    load();
  };

  const grouped = DAYS_LABELS.map((label, idx) => ({
    label,
    idx,
    items: items.filter((i) => i.day_of_week === idx).sort((a, b) => a.start_time.localeCompare(b.start_time)),
  }));

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>🗓️ Programação</h1>
        <button className="admin-btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          + Novo Programa
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h3>{editing ? "Editar Programa" : "Novo Programa"}</h3>
          <div className="admin-row">
            <div className="admin-field">
              <label>Dia da semana</label>
              <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: Number(e.target.value) })}>
                {DAYS_LABELS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label>Ordem</label>
              <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
            </div>
          </div>
          <div className="admin-field">
            <label>Nome do Programa *</label>
            <input value={form.program_name} onChange={(e) => setForm({ ...form, program_name: e.target.value })} placeholder="Ex: Madrugada Positiva" />
          </div>
          <div className="admin-field">
            <label>Apresentador / Programador</label>
            <input value={form.presenter} onChange={(e) => setForm({ ...form, presenter: e.target.value })} placeholder="Ex: Programador Positiva" />
          </div>
          <div className="admin-row">
            <div className="admin-field">
              <label>Início</label>
              <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>Fim</label>
              <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            </div>
          </div>
          <div className="admin-form-actions">
            <button className="admin-btn-primary" onClick={handleSave}>
              {editing ? "Salvar Alterações" : "Criar Programa"}
            </button>
            <button className="admin-btn-secondary" onClick={resetForm}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="admin-list">
        {items.length === 0 && <p className="admin-empty">Nenhum programa cadastrado.</p>}
        {grouped.map((g) => g.items.length > 0 && (
          <div key={g.idx} style={{ marginBottom: 16 }}>
            <h3 style={{ margin: "8px 0", color: "#0c2651" }}>{g.label}</h3>
            {g.items.map((p) => (
              <div key={p.id} className={`admin-list-item ${!p.is_active ? "inactive" : ""}`}>
                <div className="admin-list-info">
                  <h4>{p.presenter ? `${p.presenter} - ${p.program_name}` : p.program_name}</h4>
                  <p>{p.start_time.slice(0, 5)} - {p.end_time.slice(0, 5)}</p>
                  <span className="admin-tag">{p.is_active ? "✅ Ativo" : "❌ Inativo"}</span>
                </div>
                <div className="admin-list-actions">
                  <button onClick={() => toggleActive(p)}>{p.is_active ? "Desativar" : "Ativar"}</button>
                  <button onClick={() => handleEdit(p)}>Editar</button>
                  <button className="danger" onClick={() => handleDelete(p.id)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Podcasts Manager ──
type PodcastItemAdmin = {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  thumbnail_url: string | null;
  display_order: number;
  is_active: boolean;
};

function getYtId(url: string): string | null {
  const m = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function PodcastsManager() {
  const [items, setItems] = useState<PodcastItemAdmin[]>([]);
  const [editing, setEditing] = useState<PodcastItemAdmin | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", youtube_url: "", thumbnail_url: "", display_order: 0,
  });

  const load = useCallback(async () => {
    const data = await getPodcastsAdmin();
    setItems(data as PodcastItemAdmin[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ title: "", description: "", youtube_url: "", thumbnail_url: "", display_order: 0 });
    setEditing(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.youtube_url) { alert("Título e link do YouTube são obrigatórios!"); return; }
    if (!getYtId(form.youtube_url)) { alert("Link do YouTube inválido. Use o formato youtube.com/watch?v=... ou youtu.be/..."); return; }
    if (editing) {
      await updatePodcast({ data: { id: editing.id, ...form } });
    } else {
      await createPodcast({ data: form });
    }
    resetForm();
    load();
  };

  const handleEdit = (p: PodcastItemAdmin) => {
    setForm({
      title: p.title, description: p.description || "", youtube_url: p.youtube_url,
      thumbnail_url: p.thumbnail_url || "", display_order: p.display_order ?? 0,
    });
    setEditing(p);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este podcast?")) return;
    await deletePodcast({ data: { id } });
    load();
  };

  const toggleActive = async (p: PodcastItemAdmin) => {
    await updatePodcast({ data: { id: p.id, is_active: !p.is_active } });
    load();
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>🎧 Podcasts</h1>
        <button className="admin-btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          + Novo Podcast
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h3>{editing ? "Editar Podcast" : "Novo Podcast"}</h3>
          <div className="admin-field">
            <label>Título *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Primeiro podcast" />
          </div>
          <div className="admin-field">
            <label>Descrição</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Sobre o que é o episódio..." rows={3} />
          </div>
          <div className="admin-field">
            <label>Link do YouTube *</label>
            <input value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
            <small style={{ color: "#666", marginTop: 4, display: "block" }}>
              Aceita youtube.com/watch, youtu.be e youtube.com/shorts
            </small>
          </div>
          <div className="admin-field">
            <label>Capa personalizada (opcional — usa thumb do YouTube por padrão)</label>
            {form.thumbnail_url && <img src={form.thumbnail_url} alt="" className="admin-preview-img" />}
            <ImageUploader onUploaded={(url) => setForm({ ...form, thumbnail_url: url })} />
            <input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="Ou cole a URL da capa" />
          </div>
          <div className="admin-field">
            <label>Ordem de exibição</label>
            <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
          </div>
          <div className="admin-form-actions">
            <button className="admin-btn-primary" onClick={handleSave}>
              {editing ? "Salvar Alterações" : "Criar Podcast"}
            </button>
            <button className="admin-btn-secondary" onClick={resetForm}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="admin-list">
        {items.length === 0 && <p className="admin-empty">Nenhum podcast cadastrado.</p>}
        {items.map((p) => {
          const ytId = getYtId(p.youtube_url);
          const thumb = p.thumbnail_url || (ytId ? `https://i.ytimg.com/vi/${ytId}/mqdefault.jpg` : "");
          return (
            <div key={p.id} className={`admin-list-item ${!p.is_active ? "inactive" : ""}`}>
              {thumb && <img src={thumb} alt="" className="admin-list-thumb" />}
              <div className="admin-list-info">
                <h4>{p.title}</h4>
                <p>{p.description}</p>
                <span className="admin-tag">{p.is_active ? "✅ Ativo" : "❌ Inativo"}</span>
              </div>
              <div className="admin-list-actions">
                <button onClick={() => toggleActive(p)}>{p.is_active ? "Desativar" : "Ativar"}</button>
                <button onClick={() => handleEdit(p)}>Editar</button>
                <button className="danger" onClick={() => handleDelete(p.id)}>Excluir</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Entries Manager ──
type EntryRow = {
  id: string;
  promotion_id: string;
  full_name: string;
  whatsapp: string;
  cpf: string;
  instagram: string;
  facebook: string;
  created_at: string;
  promotions?: { title: string } | null;
};

function formatCpf(v: string) {
  const d = (v || "").replace(/\D/g, "");
  return d.length === 11 ? `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}` : v;
}

function downloadCsv(rows: EntryRow[], filename: string) {
  const headers = ["Nome", "WhatsApp", "CPF", "Instagram", "Facebook", "Promoção", "Data"];
  const escape = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
  const lines = [
    headers.map(escape).join(","),
    ...rows.map((r) => [
      r.full_name, r.whatsapp, formatCpf(r.cpf), r.instagram, r.facebook,
      r.promotions?.title || "", new Date(r.created_at).toLocaleString("pt-BR"),
    ].map(escape).join(",")),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function EntriesManager() {
  const [rows, setRows] = useState<EntryRow[]>([]);
  const [promos, setPromos] = useState<{ id: string; title: string }[]>([]);
  const [filter, setFilter] = useState<string>("");

  const load = useCallback(async () => {
    const [entries, p] = await Promise.all([
      getPromotionEntries({ data: filter ? { promotion_id: filter } : {} }),
      getPromotions(),
    ]);
    setRows(entries as EntryRow[]);
    setPromos((p as any[]).map((x) => ({ id: x.id, title: x.title })));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta inscrição?")) return;
    await deletePromotionEntry({ data: { id } });
    load();
  };

  const handleExport = () => {
    if (rows.length === 0) { alert("Nada para exportar"); return; }
    const promoTitle = filter ? promos.find((p) => p.id === filter)?.title || "promocao" : "todas";
    const safe = promoTitle.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
    downloadCsv(rows, `inscritos_${safe}_${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>📝 Inscritos nas Promoções</h1>
        <button className="admin-btn-primary" onClick={handleExport}>⬇️ Exportar CSV</button>
      </div>
      <div className="admin-form-card" style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label style={{ fontWeight: 600 }}>Filtrar por promoção:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
          <option value="">Todas</option>
          {promos.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <span style={{ marginLeft: "auto", color: "#666" }}>{rows.length} inscrição(ões)</span>
      </div>
      <div className="admin-list">
        {rows.length === 0 && <p className="admin-empty">Nenhuma inscrição ainda.</p>}
        {rows.map((r) => (
          <div key={r.id} className="admin-list-item">
            <div className="admin-list-info">
              <h4>{r.full_name}</h4>
              <p>📱 {r.whatsapp} · 🆔 {formatCpf(r.cpf)}</p>
              <p>📷 {r.instagram} · 📘 {r.facebook}</p>
              <span className="admin-tag">🎁 {r.promotions?.title || "—"}</span>
              <span className="admin-tag">🕒 {new Date(r.created_at).toLocaleString("pt-BR")}</span>
            </div>
            <div className="admin-list-actions">
              <button className="danger" onClick={() => handleDelete(r.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
