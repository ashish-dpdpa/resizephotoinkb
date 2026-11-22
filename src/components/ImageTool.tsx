"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { drawFrame, formatKB, frameGeometry, loadImage, processImage, type ProcessResult } from "@/lib/image";

export interface Preset {
  id: string;
  label: string;
  width: number;
  height: number;
  minKB: number;
  maxKB: number;
  dpi?: number;
  signature?: boolean;
}

interface Props {
  presets?: Preset[];
  /** Keep the uploaded image's own pixel size and only compress (for "compress to X KB" pages). */
  compressOnly?: boolean;
  defaultMinKB?: number;
  defaultMaxKB?: number;
  fileBaseName?: string;
}

type Ink = "original" | "black" | "blue";

export default function ImageTool({
  presets = [],
  compressOnly = false,
  defaultMinKB = 0,
  defaultMaxKB = 50,
  fileBaseName = "resized",
}: Props) {
  const first = presets[0];
  const [presetId, setPresetId] = useState(first?.id ?? "custom");
  const [width, setWidth] = useState(first?.width ?? 350);
  const [height, setHeight] = useState(first?.height ?? 450);
  const [minKB, setMinKB] = useState(first?.minKB ?? defaultMinKB);
  const [maxKB, setMaxKB] = useState(first?.maxKB ?? defaultMaxKB);
  const [dpi, setDpi] = useState<number | undefined>(first?.dpi);
  const [fit, setFit] = useState<"cover" | "contain">("cover");
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [cleanSignature, setCleanSignature] = useState(!!first?.signature);
  const [threshold, setThreshold] = useState(150);
  const [inkColor, setInkColor] = useState<Ink>("original");
  const [editSize, setEditSize] = useState(presets.length === 0 && !compressOnly);

  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [source, setSource] = useState<{ name: string; size: number; w: number; h: number } | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const runId = useRef(0);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const outW = compressOnly && img ? img.naturalWidth : width;
  const outH = compressOnly && img ? img.naturalHeight : height;
  const isInk = cleanSignature;

  const applyPreset = (p: Preset) => {
    setPresetId(p.id);
    setWidth(p.width);
    setHeight(p.height);
    setMinKB(p.minKB);
    setMaxKB(p.maxKB);
    setDpi(p.dpi);
    setCleanSignature(!!p.signature);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  const onFile = useCallback(async (file: File | undefined | null) => {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("That file is not an image. Choose a JPG, PNG or WebP photo.");
      return;
    }
    try {
      const image = await loadImage(file);
      setImg(image);
      setSource({ name: file.name, size: file.size, w: image.naturalWidth, h: image.naturalHeight });
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  // Paste an image from the clipboard (Ctrl/⌘+V) anywhere on the page.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith("image/"));
      if (item) onFile(item.getAsFile());
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onFile]);

  // Instant preview while dragging / zooming (no JPEG encoding).
  useEffect(() => {
    if (!img || compressOnly || !previewRef.current) return;
    drawFrame(img, width, height, { fit, zoom, offsetX, offsetY, cleanSignature, threshold, inkColor }, previewRef.current);
  }, [img, width, height, fit, zoom, offsetX, offsetY, cleanSignature, threshold, inkColor, compressOnly]);

  // Encode the real JPEG (debounced).
  useEffect(() => {
    if (!img) return;
    const id = ++runId.current;
    const t = setTimeout(async () => {
      if (!(maxKB > 0) || minKB >= maxKB) {
        setError("Maximum KB must be larger than minimum KB.");
        return;
      }
      if (!compressOnly && (width < 10 || height < 10)) return;
      setBusy(true);
      setError(null);
      try {
        const r = await processImage(img, {
          width: outW,
          height: outH,
          minKB,
          maxKB,
          fit: compressOnly ? "cover" : fit,
          zoom: compressOnly ? 1 : zoom,
          offsetX,
          offsetY,
          cleanSignature,
          threshold,
          inkColor,
          allowShrink: compressOnly,
          dpi,
        });
        if (id !== runId.current) {
          URL.revokeObjectURL(r.url);
          return;
        }
        setResult((old) => {
          if (old) URL.revokeObjectURL(old.url);
          return r;
        });
      } catch (e) {
        setError((e as Error).message);
      } finally {
        if (id === runId.current) setBusy(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [img, outW, outH, width, height, minKB, maxKB, fit, zoom, offsetX, offsetY, cleanSignature, threshold, inkColor, dpi, compressOnly]);

  // Drag on the preview to move the photo inside the frame.
  const onPointerDown = (e: React.PointerEvent) => {
    if (!img || compressOnly) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !img || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const toOut = width / rect.width;
    const g = frameGeometry(img, width, height, { fit, zoom, offsetX, offsetY });
    const nx = g.spareX > 0 ? drag.current.ox + ((e.clientX - drag.current.x) * toOut) / (g.spareX / 2) : 0;
    const ny = g.spareY > 0 ? drag.current.oy + ((e.clientY - drag.current.y) * toOut) / (g.spareY / 2) : 0;
    setOffsetX(Math.max(-1, Math.min(1, nx)));
    setOffsetY(Math.max(-1, Math.min(1, ny)));
  };
  const onPointerUp = () => (drag.current = null);
  // Wheel over the preview zooms instead of scrolling the page (needs a non-passive listener).
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !img || compressOnly) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => Math.max(1, Math.min(4, z - e.deltaY * 0.0015)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [img, compressOnly]);

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `${fileBaseName}-${result.width}x${result.height}-${Math.round(result.bytes / 1024)}kb.jpg`;
    a.click();
  };

  const reset = () => {
    setImg(null);
    setSource(null);
    setResult((old) => {
      if (old) URL.revokeObjectURL(old.url);
      return null;
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const inRange = !!result && result.bytes >= minKB * 1024 && result.bytes <= maxKB * 1024;
  const aspect = compressOnly && source ? `${source.w} / ${source.h}` : `${width} / ${height}`;
  // width ÷ height of the preview; caps the preview so tall photos are at most 360px high
  const aspectRatio = compressOnly && source ? source.w / source.h : Math.max(0.1, width / Math.max(1, height));

  return (
    <div className="card overflow-hidden">
      {/* ---------- top: what are you uploading ---------- */}
      {true && (
        <div className="border-b border-dashed border-line-2 bg-paper-2/60 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="label">{compressOnly ? "01 · Target file size" : "01 · What are you uploading?"}</p>
            {!compressOnly && (
              <p className="font-mono text-xs text-ink-2">
                {width} × {height} px · {minKB}–{maxKB} KB · JPG{dpi ? ` · ${dpi} DPI` : ""}
                <button type="button" onClick={() => setEditSize((v) => !v)} className="ml-2 font-sans font-semibold text-pen underline underline-offset-2">
                  {editSize ? "Done" : "Edit"}
                </button>
              </p>
            )}
          </div>
          {presets.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Presets">
              {presets.map((p) => (
                <button key={p.id} type="button" role="tab" aria-selected={presetId === p.id} onClick={() => applyPreset(p)} className="chip">
                  {p.label}
                </button>
              ))}
            </div>
          )}
          {(editSize || compressOnly) && (
            <div className={`mt-4 grid gap-3 ${compressOnly ? "grid-cols-2 sm:max-w-sm" : "grid-cols-2 sm:grid-cols-4"}`}>
              {!compressOnly && (
                <>
                  <NumField label="Width px" value={width} onChange={(v) => { setWidth(v); setPresetId("custom"); }} />
                  <NumField label="Height px" value={height} onChange={(v) => { setHeight(v); setPresetId("custom"); }} />
                </>
              )}
              <NumField label="Min KB" value={minKB} onChange={(v) => { setMinKB(v); setPresetId("custom"); }} />
              <NumField label="Max KB" value={maxKB} onChange={(v) => { setMaxKB(v); setPresetId("custom"); }} />
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* ---------- stage ---------- */}
        <div className="relative border-b border-dashed border-line-2 p-4 sm:p-6 lg:border-b-0 lg:border-r">
          <p className="label mb-3">02 · {img ? (compressOnly ? "Your image" : "Drag to position · scroll or slide to zoom") : "Add your image"}</p>

          {!img ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer.files[0]); }}
              className={`flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
                dragOver ? "border-pen bg-pen-50" : "border-line-2 bg-paper/60"
              }`}
            >
              <div className="cropmarks mb-5 grid h-24 w-20 place-items-center rounded-md border border-line-2 bg-card">
                <svg viewBox="0 0 40 48" className="h-14 w-12 text-line-2" aria-hidden="true">
                  <circle cx="20" cy="17" r="8" fill="currentColor" />
                  <path d="M5 46c2-10 8-15 15-15s13 5 15 15" fill="currentColor" />
                </svg>
              </div>
              <p className="font-display text-xl font-bold text-ink">Drop your {isInk ? "signature" : "photo"} here</p>
              <p className="mt-1 text-sm text-ink-2">or</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-ink">Choose file</button>
                <button type="button" onClick={() => cameraRef.current?.click()} className="btn btn-ghost sm:hidden">Take photo</button>
              </div>
              <p className="mt-4 font-mono text-[0.7rem] text-ink-3">JPG · PNG · WebP · or paste with Ctrl+V</p>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-center gap-3 rounded-xl bg-paper-2/70 p-4 sm:p-6">
                {/* height ruler */}
                {!compressOnly && <span className="label mt-1 hidden [writing-mode:vertical-rl] sm:block">{height} px</span>}
                <div className="min-w-0 flex-1">
                  {!compressOnly && <p className="label mb-1.5 text-center">{width} px</p>}
                  <div
                    ref={stageRef}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    className={`cropmarks relative mx-auto touch-none select-none bg-white shadow-[var(--shadow-lift)] ${compressOnly ? "" : "cursor-grab active:cursor-grabbing"}`}
                    style={{ aspectRatio: aspect, width: `min(100%, ${Math.round(Math.min(360, 360 * aspectRatio))}px)` }}
                  >
                    {compressOnly ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={result?.url ?? img.src} alt="Preview of your image" className="h-full w-full object-contain" />
                    ) : (
                      <canvas ref={previewRef} aria-label="Preview of the framed image" className="block h-full w-full" />
                    )}
                    {inRange && !busy && (
                      <span key={result?.bytes} className="stamp stamp-ok absolute -right-3 -top-4 bg-card/90 animate-stamp">Accepted</span>
                    )}
                  </div>
                </div>
              </div>

              {!compressOnly && (
                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <label className="block">
                    <span className="label">Zoom · {zoom.toFixed(1)}×</span>
                    <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(+e.target.value)} className="w-full" />
                  </label>
                  <div className="flex gap-2">
                    <button type="button" aria-pressed={fit === "cover"} onClick={() => setFit("cover")} className="chip">Fill</button>
                    <button type="button" aria-pressed={fit === "contain"} onClick={() => setFit("contain")} className="chip">Fit whole</button>
                    <button type="button" onClick={() => { setZoom(1); setOffsetX(0); setOffsetY(0); }} className="chip">Reset</button>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-3">
                <span className="font-mono">
                  Original: {source?.w} × {source?.h} px · {source && formatKB(source.size)}
                </span>
                <button type="button" onClick={reset} className="font-semibold text-ink-2 underline underline-offset-2 hover:text-ink">
                  Use a different image
                </button>
              </div>
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </div>

        {/* ---------- result panel ---------- */}
        <div className="p-4 sm:p-6">
          <p className="label mb-3">03 · Check &amp; download</p>

          <KbMeter bytes={result?.bytes ?? null} minKB={minKB} maxKB={maxKB} busy={busy} />

          {!compressOnly && img && (
            <div className="mt-6 rounded-xl border border-line bg-paper/60 p-4">
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span>
                  <span className="block font-semibold text-ink">Clean paper background</span>
                  <span className="block text-xs text-ink-3">For signatures, thumb impressions and handwriting</span>
                </span>
                <input
                  type="checkbox"
                  checked={cleanSignature}
                  onChange={(e) => setCleanSignature(e.target.checked)}
                  className="peer sr-only"
                />
                <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-line-2 transition peer-checked:bg-ink after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-card after:transition peer-checked:after:translate-x-5" />
              </label>
              {cleanSignature && (
                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="label">Whiten strength · {threshold}</span>
                    <input type="range" min={60} max={235} value={threshold} onChange={(e) => setThreshold(+e.target.value)} className="w-full" />
                  </label>
                  <div>
                    <span className="label">Ink</span>
                    <div className="mt-1.5 flex gap-2">
                      {(["original", "black", "blue"] as Ink[]).map((c) => (
                        <button key={c} type="button" aria-pressed={inkColor === c} onClick={() => setInkColor(c)} className="chip capitalize">
                          {c !== "original" && <span className={`h-2.5 w-2.5 rounded-full ${c === "black" ? "bg-ink" : "bg-[#102a8c]"}`} />}
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {result && (
            <ul className="mt-5 space-y-1.5 text-xs text-ink-2">
              <li className="font-mono">Output: {result.width} × {result.height} px · JPG · quality {Math.round(result.quality * 100)}%</li>
              {result.padded && <li>✓ Raised to the {minKB} KB minimum with invisible padding — the picture is unchanged.</li>}
              {result.shrunk && <li>✓ Pixel size reduced so it fits under {maxKB} KB.</li>}
              {result.warning && <li className="text-stamp">{result.warning}</li>}
            </ul>
          )}

          {error && <p className="mt-4 rounded-lg bg-stamp-50 p-3 text-sm text-stamp" role="alert">{error}</p>}

          <button type="button" onClick={download} disabled={!result || busy} className="btn btn-pen mt-6 hidden w-full py-4 text-base lg:flex">
            <DownloadIcon /> Download JPG {result ? `· ${formatKB(result.bytes)}` : ""}
          </button>
          <p className="mt-3 hidden text-center text-xs text-ink-3 lg:block">Processed on your device. Nothing is uploaded.</p>
        </div>
      </div>

      {/* ---------- sticky mobile action bar ---------- */}
      {result && (
        <div className="sticky-bar fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className={`font-mono text-sm font-extrabold ${inRange ? "text-ok" : "text-stamp"}`}>
                {formatKB(result.bytes)} {inRange ? "✓" : "✗"}
              </p>
              <p className="truncate font-mono text-[0.7rem] text-ink-3">{result.width} × {result.height} px · limit {minKB}–{maxKB} KB</p>
            </div>
            <button type="button" onClick={download} disabled={busy} className="btn btn-pen">
              <DownloadIcon /> Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input type="number" inputMode="numeric" min={0} value={value} onChange={(e) => onChange(+e.target.value)} className="field mt-1" />
    </label>
  );
}

/** Visual gauge: where the file size sits relative to the allowed window. */
function KbMeter({ bytes, minKB, maxKB, busy }: { bytes: number | null; minKB: number; maxKB: number; busy: boolean }) {
  const scaleMax = Math.max(maxKB * 1.3, 1);
  const kb = bytes === null ? null : bytes / 1024;
  const pct = (v: number) => `${Math.min(100, Math.max(0, (v / scaleMax) * 100))}%`;
  const ok = kb !== null && kb >= minKB && kb <= maxKB;
  return (
    <div>
      <div className="flex items-end justify-between">
        <p className={`font-display text-5xl font-extrabold tabular-nums tracking-tight ${kb === null ? "text-line-2" : ok ? "text-ink" : "text-stamp"}`}>
          {kb === null ? "—" : kb.toFixed(1)}
          <span className="ml-1 text-xl font-bold text-ink-3">KB</span>
        </p>
        <p className={`pb-2 font-mono text-xs font-extrabold uppercase tracking-wider ${busy ? "text-ink-3" : ok ? "text-ok" : kb === null ? "text-ink-3" : "text-stamp"}`}>
          {busy ? "Working…" : kb === null ? "Waiting" : ok ? "Within limit" : kb < minKB ? "Too small" : "Too big"}
        </p>
      </div>
      <div className="relative mt-3 h-3 rounded-full bg-paper-2" aria-hidden="true">
        <div className="absolute inset-y-0 rounded-full bg-ok-50 ring-1 ring-ok/40" style={{ left: pct(minKB), width: `calc(${pct(maxKB)} - ${pct(minKB)})` }} />
        {kb !== null && (
          <div className="absolute -top-1.5 h-6 w-1.5 -translate-x-1/2 rounded-full bg-ink transition-[left] duration-300" style={{ left: pct(kb) }} />
        )}
      </div>
      <div className="relative mt-1.5 h-4 font-mono text-[0.68rem] text-ink-3">
        <span className="absolute -translate-x-1/2" style={{ left: pct(minKB) }}>{minKB}</span>
        <span className="absolute -translate-x-1/2" style={{ left: pct(maxKB) }}>{maxKB} KB</span>
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden="true">
      <path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
