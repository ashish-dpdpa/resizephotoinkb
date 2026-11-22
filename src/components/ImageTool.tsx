"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { captionHeight, drawFrame, formatKB, frameGeometry, loadImage, processImage, type ProcessResult } from "@/lib/image";

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
  /** Starting unit for width/height fields. */
  defaultUnit?: Unit;
  /** Show the DPI field in compress mode (DPI converter page). */
  showDpi?: boolean;
  defaultDpi?: number;
  /** Open the size editor straight away. */
  openSize?: boolean;
  /** Show name + date fields and print them in a strip under the photo. */
  captionMode?: boolean;
  /** Offer the on-device "white background" option for photos. */
  whiteBgOption?: boolean;
  /** Offer a 4x6 inch print sheet with several copies. */
  printSheet?: boolean;
}

type Unit = "px" | "cm" | "mm" | "in";
const UNITS: Unit[] = ["px", "cm", "mm", "in"];
const UNIT_PER_INCH: Record<Unit, number> = { px: 1, cm: 2.54, mm: 25.4, in: 1 };

type Ink = "original" | "black" | "blue";

export default function ImageTool({
  presets = [],
  compressOnly = false,
  defaultMinKB = 0,
  defaultMaxKB = 50,
  fileBaseName = "resized",
  defaultUnit = "px",
  showDpi = false,
  defaultDpi,
  openSize = false,
  captionMode = false,
  whiteBgOption = true,
  printSheet = false,
}: Props) {
  const first = presets[0];
  const [presetId, setPresetId] = useState(first?.id ?? "custom");
  const [width, setWidth] = useState(first?.width ?? 350);
  const [height, setHeight] = useState(first?.height ?? 450);
  const [minKB, setMinKB] = useState(first?.minKB ?? defaultMinKB);
  const [maxKB, setMaxKB] = useState(first?.maxKB ?? defaultMaxKB);
  const [dpi, setDpi] = useState<number | undefined>(first?.dpi ?? defaultDpi ?? (defaultUnit !== "px" ? 200 : undefined));
  const [unit, setUnit] = useState<Unit>(defaultUnit);
  const [fit, setFit] = useState<"cover" | "contain">("cover");
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [cleanSignature, setCleanSignature] = useState(!!first?.signature);
  const [threshold, setThreshold] = useState(150);
  const [inkColor, setInkColor] = useState<Ink>("original");
  const [original, setOriginal] = useState<HTMLImageElement | null>(null);
  const [whiteBg, setWhiteBg] = useState(false);
  const [bgBusy, setBgBusy] = useState(false);
  const [showCaption, setShowCaption] = useState(captionMode);
  const [capName, setCapName] = useState("");
  const [capDate, setCapDate] = useState("");
  const [capPrefix, setCapPrefix] = useState<"" | "Date: " | "DOP: ">("");
  const [editSize, setEditSize] = useState(openSize || (presets.length === 0 && !compressOnly));

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

  // Today's date for the caption, set after mount so server and browser HTML match.
  useEffect(() => {
    if (captionMode && !capDate) setCapDate(new Date().toISOString().slice(0, 10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captionMode]);
  const caption = useMemo(() => {
    if (!showCaption || compressOnly) return undefined;
    const lines: string[] = [];
    if (capName.trim()) lines.push(capName.trim().toUpperCase());
    if (capDate) {
      const [y, m, d] = capDate.split("-");
      lines.push(`${capPrefix}${d}/${m}/${y}`);
    }
    return lines.length ? lines : undefined;
  }, [showCaption, compressOnly, capName, capDate, capPrefix]);
  const captionKey = caption?.join("|") ?? "";

  // ---- unit conversion (pixels are the source of truth) ----
  const effDpi = dpi && dpi > 0 ? dpi : 200;
  const unitLabel = unit === "in" ? "inch" : unit;
  const DECIMALS: Record<Unit, number> = { px: 0, cm: 1, mm: 0, in: 2 };
  const toUnit = (px: number) => {
    if (unit === "px") return px;
    const f = 10 ** DECIMALS[unit];
    return Math.round((px / effDpi) * UNIT_PER_INCH[unit] * f) / f;
  };
  const fromUnit = (v: number) => (unit === "px" ? Math.round(v) : Math.max(1, Math.round((v / UNIT_PER_INCH[unit]) * effDpi)));
  // one pixel plus half a display step, so rounding never fights the user
  const tolerance = unit === "px" ? 0.5 : (UNIT_PER_INCH[unit] / effDpi) * 1.01 + 0.5 / 10 ** DECIMALS[unit];
  const changeUnit = (u: Unit) => {
    setUnit(u);
    if (u !== "px" && !dpi) setDpi(200);
  };
  const changeDpi = (v: number) => {
    const next = v > 0 ? Math.round(v) : undefined;
    // Keep the physical size (cm/inch) the same when DPI changes.
    if (!compressOnly && unit !== "px" && next) {
      // re-derive from the shown cm/mm/inch value so 3.5 cm stays exactly 3.5 cm (no pixel drift)
      setWidth(Math.max(1, Math.round((toUnit(width) / UNIT_PER_INCH[unit]) * next)));
      setHeight(Math.max(1, Math.round((toUnit(height) / UNIT_PER_INCH[unit]) * next)));
    }
    setDpi(next);
  };

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
      setOriginal(image);
      setWhiteBg(false);
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
    drawFrame(img, width, height, { fit, zoom, offsetX, offsetY, cleanSignature, threshold, inkColor, caption }, previewRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, width, height, fit, zoom, offsetX, offsetY, cleanSignature, threshold, inkColor, compressOnly, captionKey]);

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
          caption,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, outW, outH, width, height, minKB, maxKB, fit, zoom, offsetX, offsetY, cleanSignature, threshold, inkColor, dpi, compressOnly, captionKey]);

  // On-device white background (downloads the segmentation model the first time).
  const toggleWhiteBg = async (on: boolean) => {
    if (!original) return;
    setWhiteBg(on);
    if (!on) {
      setImg(original);
      return;
    }
    setBgBusy(true);
    setError(null);
    try {
      const { replaceBackground } = await import("@/lib/segment");
      setImg(await replaceBackground(original));
    } catch (e) {
      setWhiteBg(false);
      setError(`Could not change the background: ${(e as Error).message}`);
    } finally {
      setBgBusy(false);
    }
  };

  // 4 x 6 inch sheet (300 DPI) filled with copies of the current photo, for printing.
  const downloadSheet = async () => {
    if (!img) return;
    const sheetDpi = 300;
    const W = 6 * sheetDpi;
    const H = 4 * sheetDpi;
    // Real print size comes from the DPI; without one, print at passport width (3.5 cm).
    const pw = dpi && dpi > 0 ? Math.round((width / dpi) * sheetDpi) : Math.round((3.5 / 2.54) * sheetDpi);
    const ph = Math.round((pw * height) / width);
    const gap = 24;
    const cols = Math.max(1, Math.floor((W - gap) / (pw + gap)));
    const rows = Math.max(1, Math.floor((H - gap) / (ph + gap)));
    const one = drawFrame(img, pw, ph, { fit, zoom, offsetX, offsetY, cleanSignature, threshold, inkColor, caption });
    const sheet = document.createElement("canvas");
    sheet.width = W;
    sheet.height = H;
    const ctx = sheet.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, W, H);
    const ox = Math.round((W - cols * pw - (cols - 1) * gap) / 2);
    const oy = Math.round((H - rows * ph - (rows - 1) * gap) / 2);
    ctx.strokeStyle = "#c8c8c8";
    ctx.lineWidth = 2;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const x = ox + c * (pw + gap);
        const y = oy + r * (ph + gap);
        ctx.drawImage(one, x, y);
        ctx.strokeRect(x - 1, y - 1, pw + 2, ph + 2);
      }
    sheet.toBlob(
      (b) => {
        if (!b) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = `${fileBaseName}-print-sheet-4x6-${rows * cols}-copies.jpg`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      },
      "image/jpeg",
      0.95,
    );
  };

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
    const g = frameGeometry(img, width, height - captionHeight(height, caption), { fit, zoom, offsetX, offsetY });
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
    setOriginal(null);
    setWhiteBg(false);
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
      <div className="border-b border-dashed border-line-2 bg-paper-2/60 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="label">{compressOnly ? "01 · Target file size" : "01 · What are you uploading?"}</p>
          {!compressOnly && (
            <p className="font-mono text-xs text-ink-2">
              {unit === "px" ? `${width} × ${height} px` : `${toUnit(width)} × ${toUnit(height)} ${unit} (${width} × ${height} px)`} · {minKB}–{maxKB} KB · JPG{dpi ? ` · ${dpi} DPI` : ""}
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
          <div className="mt-4 space-y-3">
            {!compressOnly && (
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Units">
                <span className="label mr-1">Units</span>
                {UNITS.map((u) => (
                  <button key={u} type="button" aria-pressed={unit === u} onClick={() => changeUnit(u)} className="chip !py-1 !text-xs">
                    {u === "in" ? "inch" : u}
                  </button>
                ))}
              </div>
            )}
            <div className={`grid gap-3 ${compressOnly ? (showDpi ? "grid-cols-3 sm:max-w-lg" : "grid-cols-2 sm:max-w-sm") : "grid-cols-2 sm:grid-cols-5"}`}>
              {!compressOnly && (
                <>
                  <NumField label={`Width ${unitLabel}`} value={toUnit(width)} tolerance={tolerance} onChange={(v) => { setWidth(fromUnit(v)); setPresetId("custom"); }} />
                  <NumField label={`Height ${unitLabel}`} value={toUnit(height)} tolerance={tolerance} onChange={(v) => { setHeight(fromUnit(v)); setPresetId("custom"); }} />
                </>
              )}
              <NumField label="Min KB" value={minKB} onChange={(v) => { setMinKB(v); setPresetId("custom"); }} />
              <NumField label="Max KB" value={maxKB} onChange={(v) => { setMaxKB(v); setPresetId("custom"); }} />
              {(!compressOnly || showDpi) && (
                <NumField label="DPI" value={dpi ?? 0} placeholder="auto" onChange={changeDpi} />
              )}
            </div>
            {!compressOnly && unit !== "px" && (
              <p className="font-mono text-xs text-ink-3">
                = {width} × {height} px at {effDpi} DPI. Pixels = {unit === "in" ? "inches" : unit} ÷ {UNIT_PER_INCH[unit]} × DPI.
              </p>
            )}
          </div>
        )}
      </div>

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

          {!compressOnly && img && whiteBgOption && !cleanSignature && (
            <div className="mt-6 rounded-xl border border-line bg-paper/60 p-4">
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span>
                  <span className="block font-semibold text-ink">
                    White background {bgBusy && <span className="font-mono text-xs text-ink-3">· working…</span>}
                  </span>
                  <span className="block text-xs text-ink-3">Removes the wall behind you on your device. First use downloads a small AI model.</span>
                </span>
                <input type="checkbox" checked={whiteBg} disabled={bgBusy} onChange={(e) => toggleWhiteBg(e.target.checked)} className="peer sr-only" />
                <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-line-2 transition peer-checked:bg-ink after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-card after:transition peer-checked:after:translate-x-5" />
              </label>
            </div>
          )}

          {!compressOnly && img && !cleanSignature && captionMode && (
            <div className="mt-4 rounded-xl border border-line bg-paper/60 p-4">
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span className="block font-semibold text-ink">Name &amp; date under photo</span>
                <input type="checkbox" checked={showCaption} onChange={(e) => setShowCaption(e.target.checked)} className="peer sr-only" />
                <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-line-2 transition peer-checked:bg-ink after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-card after:transition peer-checked:after:translate-x-5" />
              </label>
              {showCaption && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="label">Name</span>
                    <input type="text" value={capName} maxLength={40} placeholder="Your full name" onChange={(e) => setCapName(e.target.value)} className="field mt-1 !font-sans" />
                  </label>
                  <label className="block">
                    <span className="label">Date of photo</span>
                    <input type="date" value={capDate} onChange={(e) => setCapDate(e.target.value)} className="field mt-1" />
                  </label>
                  <div>
                    <span className="label">Date label</span>
                    <div className="mt-1.5 flex gap-2">
                      {(["", "Date: ", "DOP: "] as const).map((pfx) => (
                        <button key={pfx || "none"} type="button" aria-pressed={capPrefix === pfx} onClick={() => setCapPrefix(pfx)} className="chip !py-1 !text-xs">
                          {pfx ? pfx.trim() : "None"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
          {printSheet && (
            <button type="button" onClick={downloadSheet} disabled={!img} className="btn btn-ghost mt-3 w-full">
              Download 4 × 6 in print sheet
            </button>
          )}
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

function NumField({
  label,
  value,
  onChange,
  tolerance = 0.5,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  tolerance?: number;
  placeholder?: string;
}) {
  const [text, setText] = useState(value ? String(value) : "");
  const lastTyped = useRef<number | null>(null);
  // Sync from outside (preset, unit or DPI change) but never fight what the user is typing.
  useEffect(() => {
    if (lastTyped.current !== null && Math.abs(value - lastTyped.current) <= tolerance) return;
    lastTyped.current = null;
    setText(value ? String(value) : "");
  }, [value, tolerance]);
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        value={text}
        placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value);
          const n = parseFloat(e.target.value);
          if (Number.isNaN(n)) return; // half-typed ("3.", "") — wait for a full number
          lastTyped.current = n;
          onChange(n);
        }}
        className="field mt-1"
      />
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
