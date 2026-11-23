"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatKB, loadImage } from "@/lib/image";
import type { BorderInfo, Detected, Method, SubjectMask } from "@/lib/segment";

type BgChoice = "transparent" | "white" | "lightblue" | "grey" | "custom";
type Choice = "auto" | Method;

const COLORS: Record<Exclude<BgChoice, "transparent" | "custom">, { label: string; hex: string }> = {
  white: { label: "White", hex: "#ffffff" },
  lightblue: { label: "Light blue", hex: "#d4e6fb" },
  grey: { label: "Grey", hex: "#e6e6e6" },
};

const METHODS: { id: Choice; label: string; hint: string }[] = [
  { id: "auto", label: "Auto-detect", hint: "Finds the subject for you" },
  { id: "color", label: "Plain background", hint: "Products, logos, coins on one colour" },
  { id: "person", label: "Person", hint: "Selfies and passport photos" },
  { id: "object", label: "Object", hint: "Main subject on a busy background" },
];

const DETECTED_LABEL: Record<Detected, string> = {
  transparent: "Already transparent",
  plain: "Subject on a plain background",
  "person-plain": "Person on a plain background",
  person: "Person",
  object: "Main subject",
};

// Working size: big enough for print-quality cut-outs, small enough to stay fast.
const MAX_SIDE = 2000;

const checkerboard = {
  backgroundImage: "repeating-conic-gradient(#e7e2d6 0% 25%, #fffdf8 0% 50%)",
  backgroundSize: "18px 18px",
};

const hex = (c: [number, number, number]) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

function errorText(e: unknown, method: Choice) {
  const msg = e instanceof Error ? e.message : String(e);
  if (/person/i.test(msg)) {
    return method === "person"
      ? "We couldn't find a person in this photo. Choose Auto-detect or Object."
      : "We couldn't find a person in this photo.";
  }
  if (/fetch|network|load|failed to/i.test(msg)) {
    return "The background remover couldn't download its AI model. Check your internet connection and try again.";
  }
  return msg || "Something went wrong. Try again.";
}

export default function BackgroundRemover() {
  const [source, setSource] = useState<HTMLCanvasElement | null>(null);
  const [border, setBorder] = useState<BorderInfo | null>(null);
  const [fileName, setFileName] = useState("photo");
  const [method, setMethod] = useState<Choice>("auto");
  const [tolerance, setTolerance] = useState(30);
  const [everywhere, setEverywhere] = useState(false);
  const [mask, setMask] = useState<SubjectMask | null>(null);
  const [status, setStatus] = useState<"idle" | "working" | "ready" | "failed">("idle");
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bg, setBg] = useState<BgChoice>("transparent");
  const [custom, setCustom] = useState("#c8102e");
  const [softness, setSoftness] = useState(0.4);
  const [showBefore, setShowBefore] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [downloading, setDownloading] = useState<null | "png" | "jpg">(null);
  const [lastSize, setLastSize] = useState<{ format: string; bytes: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<HTMLCanvasElement | null>(null);
  // Masks already computed for this photo, so switching method back is instant.
  const cache = useRef(new Map<string, SubjectMask>());

  const bgColor = bg === "transparent" ? null : bg === "custom" ? custom : COLORS[bg].hex;
  const usesColorKey = method === "color" || (method === "auto" && mask?.method === "color");

  const onFile = useCallback(async (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image. Use a JPG, PNG or WebP photo.");
      return;
    }
    setError(null);
    setLastSize(null);
    setShowBefore(false);
    try {
      const img = await loadImage(file);
      const { prepareSource, analyzeBorder } = await import("@/lib/segment");
      const src = prepareSource(img, MAX_SIDE);
      cache.current.clear();
      setMask(null);
      setBorder(analyzeBorder(src));
      setSource(src);
      setFileName(file.name.replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "-").slice(0, 40) || "photo");
    } catch {
      setError("This image couldn't be opened. Try a JPG, PNG or WebP file.");
    }
  }, []);

  // Paste an image from the clipboard anywhere on the page.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const f = Array.from(e.clipboardData?.files ?? []).find((x) => x.type.startsWith("image/"));
      if (f) void onFile(f);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onFile]);

  // Work out the mask whenever the photo, method or plain-background settings change.
  useEffect(() => {
    if (!source) return;
    const opts = { tolerance, everywhere };
    const key = method === "person" || method === "object" ? method : `${method}:${tolerance}:${everywhere}`;
    const hit = cache.current.get(key);
    let cancelled = false;
    // Short delay so dragging the tolerance slider doesn't queue a recompute per pixel moved.
    const timer = setTimeout(async () => {
      if (hit) {
        setMask(hit);
        setStatus("ready");
        setError(null);
        return;
      }
      setStatus("working");
      setStep(null);
      setError(null);
      try {
        const seg = await import("@/lib/segment");
        const onStep = (s: string) => !cancelled && setStep(s);
        let m: SubjectMask;
        if (method === "auto") m = await seg.autoMask(source, opts, onStep);
        else if (method === "color") m = seg.colorKeyMask(source, seg.analyzeBorder(source), opts);
        else if (method === "person") {
          onStep("Finding the person…");
          m = await seg.personMask(source);
        } else {
          onStep("Finding the main subject…");
          m = await seg.objectMask(source);
        }
        if (cancelled) return;
        cache.current.set(key, m);
        setMask(m);
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setMask(null);
        setStatus("failed");
        setError(errorText(e, method));
      }
    }, hit ? 0 : 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [source, method, tolerance, everywhere]);

  // Re-composite whenever the background or edge changes (fast: no model runs).
  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    const id = requestAnimationFrame(async () => {
      const view = previewRef.current;
      if (!view) return;
      let frame: HTMLCanvasElement = source;
      resultRef.current = null;
      if (mask) {
        const { compositeSubject } = await import("@/lib/segment");
        if (cancelled) return;
        const out = compositeSubject(mask, { background: bgColor, softness });
        resultRef.current = out;
        if (!showBefore) frame = out;
      }
      view.width = frame.width;
      view.height = frame.height;
      const ctx = view.getContext("2d")!;
      ctx.clearRect(0, 0, frame.width, frame.height);
      ctx.drawImage(frame, 0, 0);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [source, mask, bgColor, softness, showBefore]);

  async function download(format: "png" | "jpg") {
    const out = resultRef.current;
    if (!out) return;
    setDownloading(format);
    let canvas = out;
    if (format === "jpg" && !bgColor) {
      // JPG has no transparency: flatten onto white.
      canvas = document.createElement("canvas");
      canvas.width = out.width;
      canvas.height = out.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(out, 0, 0);
    }
    const blob = await new Promise<Blob | null>((r) =>
      canvas.toBlob(r, format === "png" ? "image/png" : "image/jpeg", format === "png" ? undefined : 0.92),
    );
    setDownloading(null);
    if (!blob) return setError("Couldn't create the file. Try again.");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${fileName}-${bgColor ? "new-background" : "no-background"}.${format}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    setLastSize({ format, bytes: blob.size });
  }

  const choices: { id: BgChoice; label: string; swatch: React.CSSProperties }[] = [
    { id: "transparent", label: "Transparent", swatch: checkerboard },
    ...(Object.keys(COLORS) as (keyof typeof COLORS)[]).map((id) => ({ id, label: COLORS[id].label, swatch: { background: COLORS[id].hex } })),
    { id: "custom", label: "Custom", swatch: { background: custom } },
  ];

  const ready = status === "ready" && !!mask;
  const firstRun = status === "working" && !mask;

  return (
    <div className="card overflow-hidden">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] lg:divide-x lg:divide-line">
        {/* ---------- photo ---------- */}
        <div className="p-4 sm:p-6">
          <p className="label mb-3">01 · Your photo</p>
          {!source ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); void onFile(e.dataTransfer.files[0]); }}
              className={`flex min-h-72 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
                dragOver ? "border-pen bg-pen-50" : "border-line-2 bg-paper/60 hover:border-ink"
              }`}
            >
              <span className="font-display text-xl font-bold text-ink">+ Choose a photo</span>
              <span className="mt-2 text-sm text-ink-2">or drop / paste it here. The background is removed automatically.</span>
              <span className="mt-3 font-mono text-[0.7rem] text-ink-3">JPG · PNG · WebP · people, products, logos</span>
            </button>
          ) : (
            <div>
              <div
                className="relative grid min-h-72 place-items-center overflow-hidden rounded-xl border border-line bg-paper-2/60"
                style={mask && !bgColor && !showBefore ? checkerboard : undefined}
              >
                <canvas ref={previewRef} className={`max-h-[34rem] w-auto max-w-full ${firstRun ? "opacity-0" : ""}`} aria-label="Preview" role="img" />
                {status === "working" && (
                  <div className={`absolute inset-0 grid place-items-center p-6 text-center ${firstRun ? "bg-paper/80" : "bg-paper/50"}`}>
                    <div>
                      <span aria-hidden="true" className="mx-auto block h-8 w-8 animate-spin rounded-full border-[3px] border-line-2 border-t-pen" />
                      <p className="mt-3 font-semibold text-ink">{step ?? (method === "auto" ? "Detecting the subject…" : "Removing the background…")}</p>
                      {method !== "color" && (
                        <p className="mt-1 max-w-xs text-xs text-ink-3">
                          Photos that need AI download a model the first time (up to about 30 MB). After that it&rsquo;s quick.
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {ready && !showBefore && (
                  <p className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-line bg-card/95 px-3 py-1 text-xs font-semibold text-ink shadow-sm">
                    <span aria-hidden="true" className="text-pen">✓</span>
                    {method === "auto" ? "Detected: " : ""}
                    {DETECTED_LABEL[mask.detected]}
                  </p>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => inputRef.current?.click()} className="chip">Change photo</button>
                {ready && (
                  <button
                    type="button"
                    aria-pressed={showBefore}
                    onPointerDown={() => setShowBefore(true)}
                    onPointerUp={() => setShowBefore(false)}
                    onPointerLeave={() => setShowBefore(false)}
                    onKeyDown={(e) => (e.key === " " || e.key === "Enter") && setShowBefore(true)}
                    onKeyUp={() => setShowBefore(false)}
                    className="chip"
                  >
                    Hold to see original
                  </button>
                )}
              </div>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; void onFile(f); }}
          />
          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-stamp-50 px-3 py-2 text-sm font-semibold text-stamp">{error}</p>
          )}

          {/* ---------- adjust (auto-detect does the job; this is for when it guesses wrong) ---------- */}
          {source && (
            <details
              className="mt-5 rounded-xl border border-line"
              open={adjustOpen}
              onToggle={(e) => setAdjustOpen(e.currentTarget.open)}
            >
              <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-ink">
                Not quite right? <span className="font-normal text-ink-2">Adjust the cut-out</span>
              </summary>
              <div className="border-t border-line p-4">
              <p className="mb-2 text-sm font-semibold text-ink">What&rsquo;s in the photo?</p>
              <div role="radiogroup" aria-label="What's in the photo" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={method === m.id}
                    onClick={() => setMethod(m.id)}
                    className={`rounded-xl border-[1.5px] p-2.5 text-left text-sm font-semibold leading-tight transition ${
                      method === m.id ? "border-ink bg-card text-ink" : "border-line-2 text-ink-2 hover:border-ink"
                    }`}
                  >
                    {m.label}
                    <span className="mt-1 block text-[0.7rem] font-normal text-ink-3">{m.hint}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-3">
                Auto-detect handles most photos. If part of your subject is missing or some background is left, pick what&rsquo;s in the photo.
              </p>

              {mask?.kind === "soft" && (
                <label className="mt-4 block">
                  <span className="flex justify-between text-sm font-semibold text-ink">
                    Edge softness <span className="font-mono text-xs font-normal text-ink-3">{Math.round(softness * 100)}</span>
                  </span>
                  <input
                    type="range"
                    min={0.1}
                    max={0.8}
                    step={0.05}
                    value={softness}
                    onChange={(e) => setSoftness(Number(e.target.value))}
                    className="mt-2 w-full accent-[var(--color-pen)]"
                  />
                  <span className="mt-1 flex justify-between text-[0.7rem] text-ink-3"><span>Crisp</span><span>Soft (hair)</span></span>
                </label>
              )}

              {usesColorKey && border && (
                <div className="mt-4 rounded-xl border border-line bg-paper/60 p-4">
                  <p className="flex items-center gap-2 text-sm text-ink-2">
                    <span className="h-5 w-5 shrink-0 rounded border border-line-2" style={border.transparent ? checkerboard : { background: hex(border.color) }} />
                    {border.transparent
                      ? "This image is already transparent around the edges."
                      : <>Background colour <span className="font-mono text-xs">{hex(border.color)}</span> is removed.</>}
                  </p>
                  {!border.uniform && !border.transparent && (
                    <p className="mt-2 text-xs font-semibold text-stamp">
                      The edges of this photo aren&rsquo;t one plain colour, so Auto-detect or Object will probably do better.
                    </p>
                  )}
                  {!border.transparent && (
                    <>
                      <label className="mt-3 block">
                        <span className="flex justify-between text-sm font-semibold text-ink">
                          Colour tolerance <span className="font-mono text-xs font-normal text-ink-3">{tolerance}</span>
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={tolerance}
                          onChange={(e) => setTolerance(Number(e.target.value))}
                          className="mt-2 w-full accent-[var(--color-pen)]"
                        />
                        <span className="mt-1 flex justify-between text-[0.7rem] text-ink-3">
                          <span>Exact colour only</span><span>Also shadows and similar shades</span>
                        </span>
                      </label>
                      <label className="mt-3 flex items-start gap-2 text-sm text-ink-2">
                        <input type="checkbox" checked={everywhere} onChange={(e) => setEverywhere(e.target.checked)} className="mt-1 accent-[var(--color-pen)]" />
                        <span>
                          <b className="font-semibold text-ink">Also remove it inside the subject</b>
                          <span className="block text-xs text-ink-3">For gaps such as the inside of letters in a logo. Leave off if your subject contains the same colour.</span>
                        </span>
                      </label>
                    </>
                  )}
                </div>
              )}
              </div>
            </details>
          )}
        </div>

        {/* ---------- options ---------- */}
        <div className="border-t border-line p-4 sm:p-6 lg:border-t-0">
          <p className="label mb-3">02 · Background</p>
          <div role="radiogroup" aria-label="Background">
            {/* Transparent is the main result; a plain colour is optional. */}
            <button
              type="button"
              role="radio"
              aria-checked={bg === "transparent"}
              onClick={() => setBg("transparent")}
              className={`flex w-full items-center gap-3 rounded-xl border-[1.5px] p-2.5 text-left text-sm font-semibold transition ${
                bg === "transparent" ? "border-ink bg-card text-ink" : "border-line-2 text-ink-2 hover:border-ink"
              }`}
            >
              <span className="h-9 w-12 shrink-0 rounded-md border border-line" style={checkerboard} />
              <span>
                Transparent
                <span className="block text-xs font-normal text-ink-3">Background removed, nothing behind the subject</span>
              </span>
            </button>
            <p className="mb-2 mt-4 text-xs font-semibold text-ink-2">Or add a plain colour <span className="font-normal text-ink-3">(optional)</span></p>
            <div className="grid grid-cols-4 gap-2">
              {choices.slice(1).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={bg === c.id}
                  onClick={() => setBg(c.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-[1.5px] p-1.5 text-[0.68rem] font-semibold leading-tight transition ${
                    bg === c.id ? "border-ink bg-card text-ink" : "border-line-2 text-ink-2 hover:border-ink"
                  }`}
                >
                  <span className="h-7 w-full rounded-md border border-line" style={c.swatch} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          {bg === "custom" && (
            <label className="mt-3 flex items-center gap-3 text-sm font-semibold text-ink">
              <input type="color" value={custom} onChange={(e) => setCustom(e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-line-2 bg-card" />
              <span className="font-mono text-xs text-ink-2">{custom}</span>
            </label>
          )}

          <p className="label mb-3 mt-8">03 · Download</p>
          <div className="grid gap-2">
            <button type="button" disabled={!ready || !!downloading} onClick={() => download("png")} className="btn btn-pen w-full">
              {downloading === "png" ? "Saving…" : bgColor ? "Download PNG" : "Download transparent PNG"}
            </button>
            <button type="button" disabled={!ready || !!downloading} onClick={() => download("jpg")} className="btn btn-ghost w-full">
              {downloading === "jpg" ? "Saving…" : "Download JPG"}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-3">
            {lastSize
              ? `Saved a ${lastSize.format.toUpperCase()} of ${formatKB(lastSize.bytes)}.`
              : !bgColor
                ? "JPG can't be transparent, so the JPG gets a white background."
                : "Full size, up to 2000 px on the long side."}
          </p>

          <div className="mt-6 rounded-xl border border-line bg-paper/60 p-4 text-sm text-ink-2">
            <b className="text-ink">For an exam form?</b> Forms need a JPG with a plain background, so pick White above, download the JPG, then open it in the{" "}
            <Link href="/tools/photo-resizer" className="font-semibold text-pen underline underline-offset-2">photo resizer</Link>{" "}
            to set the exact pixels and KB.
          </div>
        </div>
      </div>
    </div>
  );
}
