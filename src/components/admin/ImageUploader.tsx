import { useState } from "react";
import { getUploadUrl } from "@/lib/admin-api.functions";
import { ImageIcon } from "./icons";
import { supabase } from "@/integrations/supabase/client";

const MAX_DIM = 2400;
const TARGET_QUALITY = 0.85;

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

async function uploadWithSignedUrl(args: {
  signedUrl?: string;
  path: string;
  token: string;
  file: Blob;
  contentType: string;
}) {
  if (args.signedUrl) {
    const response = await fetch(args.signedUrl, {
      method: "PUT",
      headers: {
        "content-type": args.contentType,
        "x-upsert": "true",
      },
      body: args.file,
    });

    if (response.ok) return;
    throw new Error((await response.text()) || `Falha no upload (${response.status})`);
  }

  const { error } = await supabase.storage.from("media").uploadToSignedUrl(args.path, args.token, args.file, {
    contentType: args.contentType,
    upsert: true,
  });

  if (error) throw error;
}

export function ImageUploader({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Limite generoso ANTES de comprimir (200 MB)
    if (file.size > 200 * 1024 * 1024) {
      alert("Imagem muito grande (máx. 200 MB)");
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const finalName =
        compressed.type === "image/jpeg" && !/\.jpe?g$/i.test(file.name)
          ? file.name.replace(/\.[^.]+$/, "") + ".jpg"
          : file.name;
      const { path, token, publicUrl, signedUrl } = await getUploadUrl({
        data: { filename: finalName, contentType: compressed.type || file.type },
      });
      console.info("Upload assinado gerado:", { path, hasToken: Boolean(token), publicUrl });
      await uploadWithSignedUrl({
        signedUrl,
        path,
        token,
        file: compressed,
        contentType: compressed.type || file.type,
      });
      onUploaded(publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      alert(`Erro ao enviar imagem: ${message}`);
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
