import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="site-footer-copy">
          © {new Date().getFullYear()} TOP100 FM — Todos os direitos reservados.
        </p>
        <Link to="/admin" className="site-footer-admin" aria-label="Acesso restrito">
          ·
        </Link>
      </div>
    </footer>
  );
}
