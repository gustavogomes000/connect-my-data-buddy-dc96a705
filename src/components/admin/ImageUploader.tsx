import { useState } from "react";
import { getUploadUrl } from "@/lib/admin-api";
import { ImageIcon } from "./icons";

const MAX_DIM = 1600;
const TARGET_QUALITY = 0.82;

async function compressImage(file: File): Promise<Blob> {
  // SVG ou GIF: não comprime (mantém como está)
  if (/svg|gif/i.test(file.type)) return file;
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("read"));
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("img"));
    i.src = dataUrl;
  });
  let { width, height } = img;
  if (width > MAX_DIM || height > MAX_DIM) {
    const r = Math.min(MAX_DIM / width, MAX_DIM / height);
    width = Math.round(width * r);
    height = Math.round(height * r);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", TARGET_QUALITY),
  );
  return blob || file;
}

export function ImageUploader({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Limite generoso ANTES de comprimir (50 MB)
    if (file.size > 50 * 1024 * 1024) {
      alert("Imagem muito grande (máx. 50 MB)");
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const finalName =
        compressed.type === "image/jpeg" && !/\.jpe?g$/i.test(file.name)
          ? file.name.replace(/\.[^.]+$/, "") + ".jpg"
          : file.name;
      const { signedUrl, publicUrl } = await getUploadUrl({
        data: { filename: finalName, contentType: compressed.type || file.type },
      });
      const res = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": compressed.type || file.type, "x-upsert": "true" },
        body: compressed,
      });
      if (!res.ok) throw new Error("upload failed");
      onUploaded(publicUrl);
    } catch {
      alert("Erro ao enviar imagem. Tente novamente.");
    } finally {
      setUploading(false);
      // permite re-selecionar a mesma imagem
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
