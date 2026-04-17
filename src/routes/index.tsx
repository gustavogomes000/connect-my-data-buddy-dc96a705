import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PromotionPopup } from "@/components/PromotionPopup";
import { AudioActivationOverlay } from "@/components/AudioActivationOverlay";
import { PodcastsSection } from "@/components/PodcastsSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rádio TOP100 FM - Ao Vivo" },
      {
        name: "description",
        content: "Ouça a Rádio TOP100 FM ao vivo. A melhor programação musical para você!",
      },
      { property: "og:title", content: "Rádio TOP100 FM - Ao Vivo" },
      { property: "og:description", content: "Ouça a Rádio TOP100 FM ao vivo." },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  return (
    <div style={{ width: "100%", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", margin: 0 }}>
      <SiteHeader />
      <PromotionPopup />
      <AudioActivationOverlay />
      <div style={{ overflow: "hidden", height: "calc(100vh - 84px)" }}>
        <iframe
          src="https://cms.aparecidaetop.com.br/"
          title="TOP100 FM Conteúdo"
          style={{
            display: "block",
            width: "100%",
            height: "calc(100vh + 80px)",
            border: "0",
            marginTop: "-80px",
            backgroundColor: "#ffffff",
          }}
        />
      </div>
      <PodcastsSection />
      <SiteFooter />
    </div>
  );
}
