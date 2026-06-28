"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Spinner } from "@/components/Loader";

export default function ImageUploader({ images, onChange, max = 3 }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = max - images.length;
    const filesToUpload = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast.error(
        `Only ${max} images allowed. Uploading the first ${remainingSlots}.`,
      );
    }

    setUploading(true);
    try {
      const urls = await Promise.all(
        filesToUpload.map((f) => uploadToCloudinary(f)),
      );
      onChange([...images, ...urls]);
      toast.success("Images uploaded.");
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(url) {
    onChange(images.filter((i) => i !== url));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {images.map((url) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden rounded-xl border border-ink/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Product"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition group-hover:opacity-100"
              aria-label="Remove image"
            >
              ✕
            </button>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink/15 text-ink/40 transition hover:border-brass hover:text-brass disabled:opacity-50"
          >
            {uploading ? (
              <Spinner className="h-5 w-5" />
            ) : (
              <>
                <span className="text-2xl leading-none">+</span>
                <span className="text-[11px] font-medium">Add photo</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <p className="mt-2 text-xs text-ink/40">
        {images.length}/{max} images · upload 2–3 clear photos of the product
      </p>
    </div>
  );
}
