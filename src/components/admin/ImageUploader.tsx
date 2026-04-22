import { useState } from "react";
import { getUploadUrl } from "@/lib/admin-api";
import { ImageIcon } from "./icons";

const MAX_DIM = 2400;
const TARGET_QUALITY = 0.85;
const MAX_FILE_SIZE = 200 * 1024 * 1024;

function getOutputType(file: File) {
  if (/image\/(png|webp|gif|svg\+xml)/i.test(file.type)) return file.type;
  return "image/jpeg";
}

async function compressImage(file: File): Promise<Blob> {
  if (/svg|gif/i.test(file.type)) return file;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("Falha ao ler imagem"));
    r.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Falha ao processar imagem"));
    i.src = dataUrl;
  });

  let { width, height } = img;
  if (width > MAX_DIM || height > MAX_DIM) {
    const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, width, height);

  const outputType = getOutputType(file);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outputType, outputType === "image/jpeg" ? TARGET_QUALITY : undefined),
  );

  return blob || file;
}

function renameForOutput(originalName: string, mimeType: string) {
  const base = originalName.replace(/\.[^.]+$/, "") || "imagem";
  if (mimeType === "image/jpeg") return `${base}.jpg`;
  if (mimeType === "image/png") return `${base}.png`;
  if (mimeType === "image/webp") return `${base}.webp`;
  return originalName;
}

export function ImageUploader({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem válido.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("Imagem muito grande. Limite: 200 MB.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const finalType = compressed.type || file.type;
      const finalName = renameForOutput(file.name, finalType);
      const { signedUrl, publicUrl } = await getUploadUrl({
        data: { filename: finalName, contentType: finalType },
      });

      const res = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": finalType, "x-upsert": "true" },
        body: compressed,
      });

      if (!res.ok) {
        throw new Error(`Falha no upload (${res.status})`);
      }

      onUploaded(publicUrl);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao enviar imagem. Tente novamente.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="admin-uploader">
      <label className="admin-upload-btn">
        <ImageIcon />
        <span>{uploading ? "Otimizando e enviando..." : "Escolher imagem"}</span>
        <input type="file" accept="image/*" onChange={handleFile} hidden />
      </label>
    </div>
  );
}
