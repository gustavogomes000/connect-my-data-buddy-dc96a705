import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normaliza URL de imagem externa (notícias):
 * - força https://
 * - encaminha por wsrv.nl quando vier de domínio externo, evitando hotlink/CORS/mixed-content
 */
export function safeImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  let u = url.trim();
  if (!u) return undefined;

  // data: e blob: passam direto
  if (u.startsWith("data:") || u.startsWith("blob:")) return u;

  // // -> https://
  if (u.startsWith("//")) u = "https:" + u;

  // http -> https
  if (u.startsWith("http://")) u = "https://" + u.slice(7);

  // relativos passam direto
  if (!u.startsWith("https://")) return u;

  try {
    const parsed = new URL(u);
    // imagens da própria infra (supabase storage, lovable) não precisam de proxy
    const host = parsed.hostname;
    if (
      host.endsWith("lovable.app") ||
      host.endsWith("lovable.dev") ||
      host.endsWith("lovableproject.com")
    ) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}` || parsed.pathname;
    }
    if (
      host.endsWith(".supabase.co") ||
      host.endsWith(".supabase.in") ||
      host.endsWith("top100fm.com.br")
    ) {
      return u;
    }
    // proxy público gratuito (Cloudflare-friendly), serve a imagem pelo nosso lado evitando hotlink
    const stripped = u.replace(/^https:\/\//, "");
    return `https://wsrv.nl/?url=${encodeURIComponent(stripped)}&output=jpg&we&n=-1`;
  } catch {
    return u;
  }
}
