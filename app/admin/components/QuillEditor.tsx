"use client";

import { useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";
import { uploadNewsletterImageAction } from "@/app/actions/newsletter";

export default function QuillEditor({
  defaultValue = "",
  slug,
  onChange,
}: {
  defaultValue?: string;
  slug?: string;
  onChange?: (html: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let quill: any = null;
    let cancelled = false;

    (async () => {
      const mod = await import("quill");
      const Quill = mod.default;
      if (cancelled || !containerRef.current) return;

      quill = new Quill(container, {
        theme: "snow",
        placeholder: "Write your newsletter here...",
        modules: {
          toolbar: [
            [{ header: [2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            ["link"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ align: [] }],
            ["blockquote", "code-block"],
            ["image"],
            ["clean"],
          ],
        },
      });

      if (defaultValue) {
        quill.clipboard.dangerouslyPasteHTML(defaultValue);
      }

      const emit = () => {
        onChangeRef.current?.(quill.root.innerHTML);
      };
      quill.on("text-change", emit);

      const toolbar = quill.getModule("toolbar") as {
        addHandler: (name: string, fn: () => void) => void;
      } | null;
      toolbar?.addHandler("image", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;
          const fd = new FormData();
          fd.append("file", file);
          if (slug) fd.append("slug", slug);
          const result = await uploadNewsletterImageAction(fd);
          if (result.success && result.url) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, "image", result.url, "user");
            quill.setSelection(range.index + 1, 0, "user");
          }
        };
        input.click();
      });

      // Emit initial value so parent state stays in sync.
      emit();
    })();

    return () => {
      cancelled = true;
      if (quill) {
        quill.off("text-change", () => {});
      }
      if (container) container.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="quill-wrapper rounded-lg border border-primary/10 bg-background overflow-hidden">
      <div ref={containerRef} className="min-h-[240px]" />
    </div>
  );
}