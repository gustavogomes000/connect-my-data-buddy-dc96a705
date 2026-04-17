import { useEffect } from "react";
import { radioAudio } from "@/lib/radio-audio";

/**
 * Overlay invisível: garante autoStart no mount e nada mais.
 * O unlock por gesto já é feito pelo script inline em __root.tsx
 * e pelos listeners do radio-audio.ts (apenas 1 vez, com {once:true}).
 */
export function AudioActivationOverlay() {
  useEffect(() => {
    radioAudio.autoStart();
  }, []);
  return null;
}
