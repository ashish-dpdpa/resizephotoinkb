"use client";

import Link from "next/link";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePost, type PostInput } from "@/app/admin/actions";
import { renderMarkdown, countWords } from "@/lib/markdown";
import { isValidSlug, toSlug } from "@/lib/slug";
import { uploadBlogImage } from "@/lib/supabase/upload";
import { siteConfig } from "@/lib/site";
import DeletePostButton from "./DeletePostButton";

const siteHost = siteConfig.url.replace(/^https?:\/\/(www\.)?/, "");

export interface EditorPost {
  id: string;
  slug: string;
  title: string;
  seo_title: string | null;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  category: string;
  tags: string[];
  lang: "en" | "hi";
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string;
}

interface FormState {
  title: string;
  slug: string;
  seoTitle: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImageAlt: string;
  category: string;
  tags: string;
  lang: "en" | "hi";
  /** value for <input type="datetime-local">, in the browser's time zone */
  publishedAtLocal: string;
}

type ViewMode = "write" | "preview" | "split";

const pad = (n: number) => String(n).padStart(2, "0");
function isoToLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const localInputToIso = (v: string) => (v ? new Date(v).toISOString() : "");

function fromPost(p?: EditorPost): FormState {
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    seoTitle: p?.seo_title ?? "",
    excerpt: p?.excerpt ?? "",
    content: p?.content ?? "",
    coverImageUrl: p?.cover_image_url ?? "",
    coverImageAlt: p?.cover_image_alt ?? "",
    category: p?.category ?? "News",
    tags: (p?.tags ?? []).join(", "),
    lang: p?.lang ?? "en",
    publishedAtLocal: isoToLocalInput(p?.published_at ?? null),
  };
}

export default function PostEditor({
  post,
  categories,
  guideSlugs,
}: {
  post?: EditorPost;
  categories: string[];
  guideSlugs: string[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => fromPost(post));
  const [savedForm, setSavedForm] = useState<FormState>(() => fromPost(post));
  const [status, setStatus] = useState<"draft" | "published">(post?.status ?? "draft");
  const [slugEdited, setSlugEdited] = useState(Boolean(post));
  const [mode, setMode] = useState<ViewMode>("write");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [uploading, setUploading] = useState<null | "cover" | "inline">(null);
  const [saving, startSaving] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(form) !== JSON.stringify(savedForm);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const publishAt = form.publishedAtLocal ? new Date(form.publishedAtLocal) : null;
  const isScheduled = status === "published" && publishAt !== null && publishAt.getTime() > Date.now();
  const slugError = !form.slug
    ? "Required"
    : !isValidSlug(form.slug)
      ? "Lowercase letters, numbers and single hyphens only"
      : guideSlugs.includes(form.slug)
        ? "A guide already uses this URL"
        : null;

  // ---------------------------------------------------------------- saving
  const save = useCallback(
    (nextStatus: "draft" | "published") => {
      setMessage(null);
      const input: PostInput = {
        id: post?.id,
        slug: form.slug,
        title: form.title,
        seoTitle: form.seoTitle,
        excerpt: form.excerpt,
        content: form.content,
        coverImageUrl: form.coverImageUrl,
        coverImageAlt: form.coverImageAlt,
        category: form.category,
        tags: form.tags.split(","),
        lang: form.lang,
        status: nextStatus,
        publishedAt: localInputToIso(form.publishedAtLocal),
      };
      startSaving(async () => {
        const res = await savePost(input);
        if (!res.ok) {
          setMessage({ kind: "error", text: res.error });
          return;
        }
        // Publishing without a date stamps "now"; reflect that in the form.
        const published = nextStatus === "published" && !form.publishedAtLocal ? { publishedAtLocal: isoToLocalInput(new Date().toISOString()) } : {};
        const next = { ...form, ...published };
        setForm(next);
        setSavedForm(next);
        setStatus(nextStatus);
        const when = new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
        const future = Boolean(form.publishedAtLocal) && new Date(form.publishedAtLocal).getTime() > Date.now();
        setMessage({
          kind: "ok",
          text: nextStatus === "draft" ? `Draft saved at ${when}` : future ? `Scheduled. Saved at ${when}` : `Published. Saved at ${when}`,
        });
        if (!post) router.replace(`/admin/posts/${res.id}`);
        else router.refresh();
      });
    },
    [form, post, router],
  );

  // Ctrl/Cmd + S saves without changing the status.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!saving) save(status);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, saving, status]);

  // ---------------------------------------------------------------- markdown toolbar
  function edit(fn: (sel: string) => { text: string; select?: [number, number] }) {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const { text, select } = fn(value.slice(s, e));
    const nextValue = value.slice(0, s) + text + value.slice(e);
    set("content", nextValue);
    requestAnimationFrame(() => {
      ta.focus();
      const [a, b] = select ?? [text.length, text.length];
      ta.setSelectionRange(s + a, s + b);
    });
  }
  const wrap = (before: string, after: string, placeholder: string) =>
    edit((sel) => {
      const inner = sel || placeholder;
      return { text: before + inner + after, select: [before.length, before.length + inner.length] };
    });
  const linePrefix = (prefix: string, placeholder: string) =>
    edit((sel) => {
      const inner = sel || placeholder;
      const text = inner.split("\n").map((l, i) => prefix.replace("1.", `${i + 1}.`) + l).join("\n");
      return { text: `\n${text}\n`, select: [1, text.length + 1] };
    });
  const insertBlock = (block: string) => edit(() => ({ text: `\n${block}\n` }));

  // ---------------------------------------------------------------- images
  async function handleUpload(file: File, target: "cover" | "inline") {
    setUploading(target);
    setMessage(null);
    try {
      const url = await uploadBlogImage(file, form.slug || "post");
      if (target === "cover") {
        set("coverImageUrl", url);
        if (!form.coverImageAlt) set("coverImageAlt", form.title);
      } else {
        const alt = "Describe the image";
        edit(() => ({ text: `\n![${alt}](${url})\n`, select: [3, 3 + alt.length] }));
      }
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setUploading(null);
    }
  }
  function onPasteOrDrop(files: FileList | null | undefined, e: React.SyntheticEvent) {
    const image = Array.from(files ?? []).find((f) => f.type.startsWith("image/"));
    if (!image) return;
    e.preventDefault();
    void handleUpload(image, "inline");
  }

  // ---------------------------------------------------------------- preview
  const deferredContent = useDeferredValue(form.content);
  const preview = useMemo(() => renderMarkdown(deferredContent), [deferredContent]);
  const words = useMemo(() => countWords(deferredContent), [deferredContent]);

  const statusLabel = status === "draft" ? "Draft" : isScheduled ? "Scheduled" : "Published";
  const primaryLabel = status === "published" ? "Update" : publishAt && publishAt.getTime() > Date.now() ? "Schedule" : "Publish";

  return (
    <div>
      {/* ------------------------------------------------ action bar */}
      <div className="sticky top-14 z-30 -mx-4 mb-6 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin" className="text-sm font-semibold text-ink-2 hover:text-ink">← Posts</Link>
          <span
            className={`rounded-full px-2.5 py-1 font-mono text-[0.68rem] font-bold uppercase tracking-wider ${
              status === "draft" ? "bg-paper-2 text-ink-2" : isScheduled ? "bg-pen-50 text-pen" : "bg-ok-50 text-ok"
            }`}
          >
            {statusLabel}
          </span>
          <span className="text-xs text-ink-3" aria-live="polite">
            {saving ? "Saving…" : dirty ? "Unsaved changes" : message?.kind === "ok" ? message.text : ""}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {post && status === "published" && !isScheduled && !dirty && (
              <Link href={`/blog/${savedForm.slug}`} target="_blank" className="btn btn-ghost !px-4 !py-2 !text-sm">View ↗</Link>
            )}
            {status === "published" ? (
              <button type="button" disabled={saving} onClick={() => save("draft")} className="btn btn-ghost !px-4 !py-2 !text-sm">
                Unpublish
              </button>
            ) : (
              <button type="button" disabled={saving} onClick={() => save("draft")} className="btn btn-ghost !px-4 !py-2 !text-sm">
                Save draft
              </button>
            )}
            <button type="button" disabled={saving || Boolean(uploading)} onClick={() => save("published")} className="btn btn-pen !px-5 !py-2 !text-sm">
              {primaryLabel}
            </button>
          </div>
        </div>
        {message?.kind === "error" && (
          <p role="alert" className="mt-3 rounded-lg bg-stamp-50 px-3 py-2 text-sm font-semibold text-stamp">{message.text}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ------------------------------------------------ main column */}
        <div className="min-w-0 space-y-4">
          <textarea
            value={form.title}
            onChange={(e) => {
              const title = e.target.value.replace(/\n/g, " ");
              setForm((f) => ({ ...f, title, ...(!slugEdited && { slug: toSlug(title) }) }));
            }}
            onInput={(e) => {
              // auto-grow in browsers without CSS field-sizing
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
            placeholder="Post title"
            rows={1}
            aria-label="Title"
            lang={form.lang === "hi" ? "hi" : undefined}
            className="field-sizing-content w-full resize-none bg-transparent font-display text-3xl font-extrabold leading-tight text-ink placeholder:text-ink-3/60 focus:outline-none sm:text-4xl"
          />

          <div className="card overflow-hidden">
            {/* toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b border-line bg-paper/60 px-2 py-1.5">
              <ToolButton label="Heading 2" onClick={() => linePrefix("## ", "Heading")}>H2</ToolButton>
              <ToolButton label="Heading 3" onClick={() => linePrefix("### ", "Heading")}>H3</ToolButton>
              <ToolButton label="Bold" onClick={() => wrap("**", "**", "bold text")}><b>B</b></ToolButton>
              <ToolButton label="Italic" onClick={() => wrap("_", "_", "italic text")}><i>I</i></ToolButton>
              <ToolButton label="Link" onClick={() => edit((sel) => {
                const t = sel || "link text";
                return { text: `[${t}](https://)`, select: [t.length + 3, t.length + 11] };
              })}>Link</ToolButton>
              <Divider />
              <ToolButton label="Bulleted list" onClick={() => linePrefix("- ", "List item")}>• List</ToolButton>
              <ToolButton label="Numbered list" onClick={() => linePrefix("1. ", "List item")}>1. List</ToolButton>
              <ToolButton label="Quote" onClick={() => linePrefix("> ", "Quote")}>❝</ToolButton>
              <ToolButton label="Table" onClick={() => insertBlock("| Item | Size |\n|---|---|\n| Photo | 20–50 KB |\n| Signature | 10–20 KB |")}>Table</ToolButton>
              <ToolButton label="Insert image" onClick={() => inlineInputRef.current?.click()} disabled={Boolean(uploading)}>
                {uploading === "inline" ? "Uploading…" : "Image"}
              </ToolButton>
              <input
                ref={inlineInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) void handleUpload(f, "inline");
                }}
              />
              <div className="ml-auto flex rounded-full border border-line-2 p-0.5 text-xs font-semibold" role="tablist" aria-label="Editor view">
                {(["write", "split", "preview"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => setMode(m)}
                    className={`rounded-full px-3 py-1 capitalize ${m === "split" ? "hidden xl:block" : ""} ${mode === m ? "bg-ink text-card" : "text-ink-2 hover:text-ink"}`}
                  >
                    {m === "split" ? "Side by side" : m}
                  </button>
                ))}
              </div>
            </div>

            <div className={mode === "split" ? "grid xl:grid-cols-2 xl:divide-x xl:divide-line" : ""}>
              <textarea
                ref={textareaRef}
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                onPaste={(e) => onPasteOrDrop(e.clipboardData?.files, e)}
                onDrop={(e) => onPasteOrDrop(e.dataTransfer?.files, e)}
                placeholder={"Write in Markdown.\n\n## A section heading\n\nParagraphs are separated by a blank line. Paste or drop an image to upload it."}
                aria-label="Post content (Markdown)"
                spellCheck
                lang={form.lang === "hi" ? "hi" : undefined}
                className={`${mode === "preview" ? "hidden" : "block"} min-h-[60vh] w-full resize-y bg-card p-4 font-mono text-[0.92rem] leading-relaxed text-ink focus:outline-none sm:p-5`}
              />
              {mode !== "write" && (
                <div className="max-h-[80vh] min-h-[60vh] overflow-y-auto p-4 sm:p-6" lang={form.lang === "hi" ? "hi" : undefined}>
                  {form.content.trim() ? (
                    <div
                      className="prose prose-lg max-w-none prose-headings:font-extrabold prose-img:rounded-xl"
                      dangerouslySetInnerHTML={{ __html: preview.html }}
                    />
                  ) : (
                    <p className="text-ink-3">Nothing to preview yet.</p>
                  )}
                </div>
              )}
            </div>
            <p className="border-t border-line bg-paper/60 px-4 py-1.5 font-mono text-[0.7rem] text-ink-3">
              {words.toLocaleString("en-IN")} words · {Math.max(1, Math.round(words / 200))} min read · {preview.headings.length} sections · Ctrl+S saves
            </p>
          </div>
        </div>

        {/* ------------------------------------------------ sidebar */}
        <aside className="space-y-4">
          <Panel title="Publishing">
            <label className="block">
              <span className="text-sm font-semibold text-ink">Publish date</span>
              <input
                type="datetime-local"
                value={form.publishedAtLocal}
                onChange={(e) => set("publishedAtLocal", e.target.value)}
                className="field mt-1.5 !text-sm"
              />
            </label>
            <p className="mt-1.5 text-xs text-ink-3">
              Leave empty to publish now. A future date schedules the post. It appears within about 5 minutes of that time.
            </p>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-ink">Language</span>
              <select value={form.lang} onChange={(e) => set("lang", e.target.value as "en" | "hi")} className="field mt-1.5 !text-sm">
                <option value="en">English</option>
                <option value="hi">Hindi (हिंदी)</option>
              </select>
            </label>
          </Panel>

          <Panel title="URL">
            <div className="flex items-stretch overflow-hidden rounded-[10px] border-[1.5px] border-line-2 bg-card focus-within:border-pen">
              <span className="grid place-items-center bg-paper-2 px-2 font-mono text-xs text-ink-3">/blog/</span>
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
                aria-label="URL slug"
                aria-invalid={Boolean(slugError)}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 font-mono text-sm text-ink focus:outline-none"
              />
            </div>
            <div className="mt-1.5 flex justify-between gap-2 text-xs">
              <span className={slugError ? "text-stamp" : "text-ink-3"}>{slugError ?? "Changing it later breaks old links."}</span>
              {slugEdited && form.title && (
                <button type="button" className="shrink-0 font-semibold text-pen" onClick={() => { setSlugEdited(false); set("slug", toSlug(form.title)); }}>
                  From title
                </button>
              )}
            </div>
          </Panel>

          <Panel title="Search & social">
            <Counted label="Excerpt" value={form.excerpt} max={300} ideal={[110, 160]}>
              <textarea
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={3}
                maxLength={300}
                placeholder="One or two sentences. Shown on the blog list and in Google."
                className="field mt-1.5 resize-y !font-sans !text-sm"
              />
            </Counted>
            <Counted label="SEO title (optional)" value={form.seoTitle} max={70} ideal={[30, 60]}>
              <input
                value={form.seoTitle}
                onChange={(e) => set("seoTitle", e.target.value)}
                maxLength={70}
                placeholder="Shorter title for Google"
                className="field mt-1.5 !font-sans !text-sm"
              />
            </Counted>
            <div className="mt-4 rounded-lg border border-line bg-card p-3">
              <p className="label">Google preview</p>
              <p className="mt-2 truncate text-[0.95rem] text-[#1a0dab]">{form.seoTitle || form.title || "Post title"}</p>
              <p className="truncate text-xs text-ok">{siteHost} › blog › {form.slug || "…"}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-ink-2">{form.excerpt || "Your excerpt appears here."}</p>
            </div>
          </Panel>

          <Panel title="Cover image">
            {form.coverImageUrl ? (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.coverImageUrl} alt="" className="aspect-[16/9] w-full rounded-lg border border-line object-cover" />
                <input
                  value={form.coverImageAlt}
                  onChange={(e) => set("coverImageAlt", e.target.value)}
                  placeholder="Alt text: what the image shows"
                  aria-label="Cover image alt text"
                  className="field mt-2 !font-sans !text-sm"
                />
                <div className="mt-2 flex gap-3 text-sm font-semibold">
                  <button type="button" className="text-pen" onClick={() => coverInputRef.current?.click()}>Replace</button>
                  <button type="button" className="text-stamp" onClick={() => setForm((f) => ({ ...f, coverImageUrl: "", coverImageAlt: "" }))}>Remove</button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={Boolean(uploading)}
                onClick={() => coverInputRef.current?.click()}
                className="grid aspect-[16/9] w-full place-items-center rounded-lg border-2 border-dashed border-line-2 text-sm font-semibold text-ink-2 hover:border-ink hover:text-ink"
              >
                {uploading === "cover" ? "Uploading…" : "+ Upload cover image"}
              </button>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void handleUpload(f, "cover");
              }}
            />
            <p className="mt-2 text-xs text-ink-3">Resized to 1600 px wide and converted to WebP before upload.</p>
          </Panel>

          <Panel title="Organise">
            <label className="block">
              <span className="text-sm font-semibold text-ink">Category</span>
              <input list="blog-categories" value={form.category} onChange={(e) => set("category", e.target.value)} className="field mt-1.5 !font-sans !text-sm" />
              <datalist id="blog-categories">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-ink">Tags</span>
              <input
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="ssc cgl, photo size, 2026"
                className="field mt-1.5 !font-sans !text-sm"
              />
              <span className="mt-1 block text-xs text-ink-3">Comma-separated</span>
            </label>
          </Panel>

          {post && (
            <Panel title="Danger zone">
              <DeletePostButton id={post.id} title={form.title} redirectTo="/admin" className="btn btn-ghost w-full !border-stamp !text-sm !text-stamp hover:!bg-stamp hover:!text-card" />
            </Panel>
          )}
        </aside>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-4">
      <h2 className="label mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Counted({ label, value, max, ideal, children }: { label: string; value: string; max: number; ideal: [number, number]; children: React.ReactNode }) {
  const n = value.length;
  const tone = n === 0 ? "text-ink-3" : n < ideal[0] || n > ideal[1] ? "text-stamp" : "text-ok";
  return (
    <label className="mt-4 block first:mt-0">
      <span className="flex justify-between text-sm font-semibold text-ink">
        {label}
        <span className={`font-mono text-xs font-normal ${tone}`}>{n}/{max}</span>
      </span>
      {children}
    </label>
  );
}

function ToolButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-md px-2 py-1 font-mono text-xs font-bold text-ink-2 hover:bg-paper-2 hover:text-ink disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden="true" className="mx-1 h-4 w-px bg-line-2" />;
}
