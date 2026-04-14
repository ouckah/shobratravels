"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, Archive } from "lucide-react";

type Props = {
  tripId: string;
  title: string;
  destinations: string;
  archived: boolean;
  initialImages: string[];
};

export default function GalleryManager({
  tripId,
  title,
  destinations,
  archived,
  initialImages,
}: Props) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const persist = async (next: string[]) => {
    const res = await fetch(`/api/admin/trips/${tripId}/gallery`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ galleryImages: next }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to save");
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Upload failed for ${file.name}`);
        }
        const { url } = await res.json();
        uploaded.push(url);
      }
      const next = [...images, ...uploaded];
      await persist(next);
      setImages(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async (url: string) => {
    const next = images.filter((img) => img !== url);
    const prev = images;
    setImages(next);
    try {
      await persist(next);
    } catch (err) {
      setImages(prev);
      setError(err instanceof Error ? err.message : "Failed to remove");
    }
  };

  return (
    <section className="bg-white border border-neutral-200">
      <header className="flex items-start justify-between gap-4 p-5 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-bold uppercase tracking-wider">{title}</h2>
            {archived && (
              <span className="flex items-center gap-1 text-xs text-neutral-400 uppercase tracking-wider">
                <Archive size={12} /> Archived
              </span>
            )}
          </div>
          <p className="text-neutral-500 text-xs mt-1">{destinations}</p>
          <p className="text-neutral-400 text-xs mt-1">
            {images.length} {images.length === 1 ? "photo" : "photos"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-5 py-2.5 uppercase tracking-wider text-xs transition-colors disabled:opacity-50 shrink-0"
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Uploading
            </>
          ) : (
            <>
              <Upload size={14} />
              Add Photos
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </header>

      {error && (
        <p className="bg-red-50 border-b border-red-200 text-red-700 text-sm px-5 py-3">
          {error}
        </p>
      )}

      <div className="p-5">
        {images.length === 0 ? (
          <p className="text-neutral-400 text-sm italic">
            No photos yet. Click Add Photos to upload.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((src) => (
              <div
                key={src}
                className="relative group aspect-square bg-neutral-100 overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(src)}
                  className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-red-500 hover:text-white text-neutral-700 p-1 shadow transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Remove photo"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
