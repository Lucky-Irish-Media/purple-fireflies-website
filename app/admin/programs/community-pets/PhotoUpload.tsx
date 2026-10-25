"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import {
  uploadAnimalPhotoAction,
  type AnimalActionState,
} from "@/app/actions/admin-animals";

/**
 * Upload is a two-step dance: resize in the browser, then send the small WebP
 * to the server action. Workers cannot decode or resize images, so doing this
 * on the client is what keeps the Worker out of the image business entirely.
 */
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_EDGE_PX = 1600;
const WEBP_QUALITY = 0.85;

const inputClass =
  "w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

async function resizeToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  try {
    const longestEdge = Math.max(bitmap.width, bitmap.height);
    const scale = longestEdge > MAX_EDGE_PX ? MAX_EDGE_PX / longestEdge : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("This browser could not prepare the image.");
    }
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY);
    });
    if (!blob) {
      throw new Error("This browser could not convert the image to WebP.");
    }

    return blob;
  } finally {
    bitmap.close();
  }
}

export function PhotoUpload({
  animalId,
  applyState,
}: {
  animalId: number;
  applyState: (state: AnimalActionState) => AnimalActionState;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [resizing, setResizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, action, pending] = useActionState<AnimalActionState, FormData>(
    async (prev, formData) => applyState(await uploadAnimalPhotoAction(prev, formData)),
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setError(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get("photo");

    if (!(file instanceof File) || file.size === 0) {
      setError("Choose an image first.");
      return;
    }

    setResizing(true);

    try {
      const resized = await resizeToWebp(file);
      if (resized.size > MAX_UPLOAD_BYTES) {
        setError("That image is still over 8 MB after resizing. Try a smaller one.");
        setResizing(false);
        return;
      }

      formData.set("animal_id", String(animalId));
      formData.set("photo", new File([resized], "photo.webp", { type: "image/webp" }));

      startTransition(() => action(formData));
    } catch (e) {
      setError(e instanceof Error ? e.message : "That image could not be read.");
    } finally {
      setResizing(false);
    }
  }

  const busy = pending || resizing;
  const failure = error ?? (state && !state.success ? state.message ?? null : null);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor={`photo_file_${animalId}`} className="sr-only">
            Photo
          </label>
          <input
            id={`photo_file_${animalId}`}
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            className={inputClass}
          />
        </div>
        <div className="flex-1">
          <label htmlFor={`photo_alt_${animalId}`} className="sr-only">
            Alt text
          </label>
          <input
            id={`photo_alt_${animalId}`}
            name="alt"
            type="text"
            placeholder="Alt text, e.g. a brown dog on a porch"
            disabled={busy}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg border border-primary/10 px-3 py-2 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          {resizing
            ? "Resizing..."
            : pending
              ? "Uploading..."
              : "Upload photo"}
        </button>
      </div>

      <p className="text-xs text-text-secondary">
        JPEG, PNG, or WebP up to 8 MB. Images are resized to 1600px and converted
        to WebP in your browser before upload.
      </p>

      <p aria-live="polite" className="text-xs text-red-500">
        {failure}
      </p>
    </form>
  );
}
