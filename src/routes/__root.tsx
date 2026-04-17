import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Rádio TOP100 FM" },
      { name: "description", content: "Rádio TOP100 FM - A melhor programação musical" },
      { name: "author", content: "TOP100 FM" },
      { property: "og:title", content: "Rádio TOP100 FM" },
      { property: "og:description", content: "Rádio TOP100 FM - A melhor programação musical" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@top100fm" },
      { name: "twitter:title", content: "Rádio TOP100 FM" },
      { name: "twitter:description", content: "Rádio TOP100 FM - A melhor programação musical" },
    ],
    links: [
      { rel: "preconnect", href: "https://server29.srvsh.com.br:7618", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://server29.srvsh.com.br:7618" },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  const earlyAutoplay = `
    (function(){
      try {
        var URL='https://server29.srvsh.com.br:7618/;';
        var a = new Audio();
        a.id = '__top100_early_audio';
        a.preload = 'auto';
        a.autoplay = true;
        a.muted = true;
        a.setAttribute('playsinline','true');
        a.src = URL;
        window.__top100EarlyAudio = a;
        var tryPlay = function(){ try { var p = a.play(); if (p && p.catch) p.catch(function(){}); } catch(e){} };
        tryPlay();
        var unlocked = false;
        var unlock = function(){
          if (unlocked) return; unlocked = true;
          try { a.muted = false; tryPlay(); } catch(e){}
        };
        ['pointerdown','pointermove','mousemove','touchstart','touchmove','keydown','click','wheel','scroll'].forEach(function(ev){
          window.addEventListener(ev, unlock, { passive: true, once: true, capture: true });
          document.addEventListener(ev, unlock, { passive: true, once: true, capture: true });
        });
      } catch(e) {}
    })();
  `;
  return (
    <html lang="pt-BR">
      <head>
        <script dangerouslySetInnerHTML={{ __html: earlyAutoplay }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
