"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { convertBitmap, decodeImage, outputName, OUT_LABEL, type OutFormat } from "@/lib/convert";
import { formatKB } from "@/lib/image";

interface Item {
  id: number;
  file: File;
  sourceFormat?: string;
  status: "queued" | "working" | "done" | "error";
  note?: string;
  /** key = the settings it was made with, so unchanged files aren't converted again. */
  out?: { url: string; blob: Blob; name: string; width: number; height: number; scaled: boolean; shrunk: boolean; overLimit: boolean; key: string };
}

const MAX_FILES = 30;
const FORMATS: OutFormat[] = ["jpg", "png", "webp"];

export default function ImageConverter({
  defaultTo = "jpg",
  fromLabel,
}: {
  /** Output format selected when the page opens. */
  defaultTo?: OutFormat;
  /** e.g. "HEIC" → the upload box says "Choose HEIC photos". Any image is still accepted. */
  fromLabel?: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [format, setFormat] = useState<OutFormat>(defaultTo);
  const [quality, setQuality] = useState(90);
  const [maxKB, setMaxKB] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);
  const runId = useRef(0);
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;

  const lossy = format !== "png";
  const limit = lossy && Number(maxKB) > 0 ? Number(maxKB) : null;

  const patch = (id: number, p: Partial<Item>) =>
    setItems((list) =>
      list.map((it) => {
        if (it.id !== id) return it;
        if (p.out && it.out && p.out.url !== it.out.url) URL.revokeObjectURL(it.out.url);
        return { ...it, ...p };
      }),
    );

  /** Convert every file with the current settings, one at a time (keeps memory low). */
  const convertAll = useCallback(async () => {
    const id = ++runId.current;
    const opts = { format, quality: quality / 100, maxKB: limit };
    const key = `${format}|${quality}|${limit ?? ""}`;
    for (const it of itemsRef.current) {
      if (runId.current !== id) return; // settings changed: a newer run takes over
      if (it.status === "done" && it.out?.key === key) continue;
      patch(it.id, { status: "working", note: undefined });
      try {
        const { bitmap, sourceFormat } = await decodeImage(it.file, (msg) => runId.current === id && patch(it.id, { note: msg }));
        if (runId.current !== id) { bitmap.close(); return; }
        const r = await convertBitmap(bitmap, opts);
        bitmap.close();
        if (runId.current !== id) return;
        patch(it.id, {
          sourceFormat,
          status: "done",
          note: undefined,
          out: { url: URL.createObjectURL(r.blob), blob: r.blob, name: outputName(it.file.name, format), width: r.width, height: r.height, scaled: r.scaled, shrunk: r.shrunk, overLimit: r.overLimit, key },
        });
      } catch (e) {
        if (runId.current !== id) return;
        patch(it.id, { status: "error", note: e instanceof Error ? e.message : "Conversion failed." });
      }
    }
  }, [format, quality, limit]);

  // Re-run when files are added or settings change (debounced for the slider).
  const fileKey = items.map((i) => i.id).join(",");
  useEffect(() => {
    if (!fileKey) return;
    const t = setTimeout(convertAll, 250);
    return () => clearTimeout(t);
  }, [fileKey, convertAll]);

  // Free object URLs when the component goes away.
  useEffect(() => () => itemsRef.current.forEach((i) => i.out && URL.revokeObjectURL(i.out.url)), []);

  const addFiles = useCallback((files: FileList | File[] | null | undefined) => {
    const list = Array.from(files ?? []).filter((f) => f.type.startsWith("image/") || /\.(heic|heif|avif|webp)$/i.test(f.name));
    if (!list.length) {
      setNotice("Those files aren't images. Choose JPG, PNG, WebP, HEIC, GIF, BMP or AVIF files.");
      return;
    }
    const room = MAX_FILES - itemsRef.current.length;
    setNotice(list.length > room ? `Up to ${MAX_FILES} images at a time. Only the first ${Math.max(0, room)} were added.` : null);
    const added = list.slice(0, Math.max(0, room)).map<Item>((file) => ({ id: nextId.current++, file, status: "queued" }));
    setItems((cur) => [...cur, ...added]);
  }, []);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files.length) addFiles(e.clipboardData.files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addFiles]);

  function remove(id: number) {
    setItems((list) => {
      const it = list.find((x) => x.id === id);
      if (it?.out) URL.revokeObjectURL(it.out.url);
      return list.filter((x) => x.id !== id);
    });
  }
  function clearAll() {
    runId.current++;
    items.forEach((i) => i.out && URL.revokeObjectURL(i.out.url));
    setItems([]);
    setNotice(null);
  }

  const done = items.filter((i) => i.status === "done" && i.out);
  const busy = items.some((i) => i.status === "working" || i.status === "queued");

  async function downloadZip() {
    setZipping(true);
    try {
      const { zipSync } = await import("fflate");
      const used = new Map<string, number>();
      const entries: Record<string, Uint8Array> = {};
      for (const it of done) {
        let name = it.out!.name;
        const n = (used.get(name) ?? 0) + 1;
        used.set(name, n);
        if (n > 1) name = name.replace(/(\.[^.]+)$/, `-${n}$1`);
        entries[name] = new Uint8Array(await it.out!.blob.arrayBuffer());
      }
      // Level 0: images are already compressed, so zipping them again only costs time.
      const zip = zipSync(entries, { level: 0 });
      const url = URL.createObjectURL(new Blob([zip as BlobPart], { type: "application/zip" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `converted-to-${format}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } finally {
      setZipping(false);
    }
  }

  return (
    <div className="card overflow-hidden">
      {/* ---------- settings ---------- */}
      <div className="flex flex-wrap items-end gap-x-8 gap-y-4 border-b border-line bg-paper/50 p-4 sm:p-6">
        <div>
          <p className="label mb-2">Convert to</p>
          <div className="flex gap-2" role="group" aria-label="Output format">
            {FORMATS.map((f) => (
              <button key={f} type="button" aria-pressed={format === f} onClick={() => setFormat(f)} className="chip !px-4">
                {OUT_LABEL[f]}
              </button>
            ))}
          </div>
        </div>

        {lossy ? (
          <>
            <label className="min-w-48 flex-1 sm:max-w-64">
              <span className="label flex justify-between">Quality <span className="text-ink-2">{quality}%</span></span>
              <input
                type="range"
                min={40}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="mt-3 w-full accent-[var(--color-pen)]"
              />
            </label>
            <label className="w-40">
              <span className="label">Max size (optional)</span>
              <span className="mt-1.5 flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="No limit"
                  value={maxKB}
                  onChange={(e) => setMaxKB(e.target.value)}
                  className="field !py-1.5"
                />
                <span className="font-mono text-xs text-ink-3">KB</span>
              </span>
            </label>
          </>
        ) : (
          <p className="max-w-sm text-sm text-ink-2">PNG is lossless: every pixel is kept exactly, so files are usually larger than JPG.</p>
        )}
      </div>

      {/* ---------- files ---------- */}
      <div className="p-4 sm:p-6">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
          className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${items.length ? "min-h-24" : "min-h-56"} ${
            dragOver ? "border-pen bg-pen-50" : "border-line-2 bg-paper/60 hover:border-ink"
          }`}
        >
          <span className="font-display text-xl font-bold text-ink">
            + {items.length ? "Add more" : `Choose ${fromLabel ? `${fromLabel} ` : ""}images`}
          </span>
          <span className="mt-1 text-sm text-ink-2">or drop / paste them here · up to {MAX_FILES} at once</span>
          <span className="mt-2 font-mono text-[0.7rem] text-ink-3">HEIC · JPG · PNG · WebP · GIF · BMP · AVIF → {OUT_LABEL[format]}</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.heic,.heif,.avif,.webp"
          hidden
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
        />
        {notice && <p role="status" className="mt-3 rounded-lg bg-paper-2 px-3 py-2 text-sm text-ink-2">{notice}</p>}

        {items.length > 0 && (
          <>
            <ul className="mt-5 divide-y divide-line rounded-xl border border-line bg-card">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-3 p-3 sm:gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-paper-2">
                    {it.out ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.out.url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-mono text-[0.6rem] text-ink-3">{it.sourceFormat ?? "…"}</span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink" title={it.file.name}>{it.out?.name ?? it.file.name}</p>
                    <p className="mt-0.5 font-mono text-[0.7rem] text-ink-3">
                      {it.sourceFormat ?? "Image"} · {formatKB(it.file.size)}
                      {it.out && (
                        <>
                          {" → "}
                          <span className={it.out.overLimit ? "text-stamp" : "text-ink-2"}>
                            {OUT_LABEL[format]} · {formatKB(it.out.blob.size)}
                          </span>
                          <span className="hidden sm:inline"> · {it.out.width} × {it.out.height}</span>
                        </>
                      )}
                    </p>
                    {it.status === "working" && <p className="mt-0.5 text-xs text-pen">{it.note ?? "Converting…"}</p>}
                    {it.status === "error" && <p className="mt-0.5 text-xs font-semibold text-stamp">{it.note}</p>}
                    {it.out?.overLimit && <p className="mt-0.5 text-xs text-stamp">Couldn&rsquo;t get it under {limit} KB. Try a larger limit.</p>}
                    {it.out?.shrunk && !it.out.overLimit && <p className="mt-0.5 text-xs text-ink-3">Pixel size reduced to fit under {limit} KB.</p>}
                    {it.out?.scaled && <p className="mt-0.5 text-xs text-ink-3">Very large image: scaled to about 16 MP so phones can handle it.</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {it.out && it.status === "done" && (
                      <a href={it.out.url} download={it.out.name} className="btn btn-ink !px-3 !py-2 !text-xs">Download</a>
                    )}
                    <button type="button" onClick={() => remove(it.id)} aria-label={`Remove ${it.file.name}`} className="grid h-8 w-8 place-items-center rounded-full text-ink-3 hover:bg-paper-2 hover:text-ink">
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {done.length > 1 && (
                <button type="button" disabled={busy || zipping} onClick={downloadZip} className="btn btn-pen">
                  {zipping ? "Zipping…" : `Download all ${done.length} (.zip)`}
                </button>
              )}
              {done.length === 1 && !busy && (
                <a href={done[0].out!.url} download={done[0].out!.name} className="btn btn-pen">Download {OUT_LABEL[format]}</a>
              )}
              <button type="button" onClick={clearAll} className="btn btn-ghost">Clear</button>
              <span className="text-xs text-ink-3" aria-live="polite">
                {busy ? `Converting ${done.length + 1} of ${items.length}…` : `${done.length} of ${items.length} converted · location and camera data removed`}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
