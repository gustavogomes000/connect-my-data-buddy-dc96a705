import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="site-footer-copy">
          © {new Date().getFullYear()} TOP100 FM — Todos os direitos reservados.
        </p>
        <Link
          to="/admin/login"
          className="site-footer-admin"
          aria-label="Acesso restrito da equipe"
          title="Equipe"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z" />
          </svg>
        </Link>
      </div>
    </footer>
  );
}
