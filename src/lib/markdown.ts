import { marked, type Tokens } from "marked";

// One Markdown renderer for guides (files in /content/guides) and blog posts
// (written in the admin panel and stored in Supabase), so both look the same.
//
// Blog posts come from a database, so the output is made safe here:
// raw HTML in the Markdown is shown as text, and links/images only accept
// http(s), site-relative, #anchor and mailto URLs (no javascript: etc).

export interface RenderedMarkdown {
  html: string;
  /** H2 headings, used for the table of contents. */
  headings: { id: string; text: string }[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z0-9#]+;/gi, "")
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Returns the URL if it is safe to put in href/src, otherwise null. */
export function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const u = url.trim();
  if (/^(https?:\/\/|\/(?!\/)|#|mailto:)/i.test(u)) return u;
  return null;
}

export function countWords(markdown: string) {
  return markdown.split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(markdown: string) {
  return Math.max(1, Math.round(countWords(markdown) / 200));
}

export function renderMarkdown(markdown: string): RenderedMarkdown {
  const headings: RenderedMarkdown["headings"] = [];
  const used = new Map<string, number>();
  const renderer = new marked.Renderer();

  renderer.heading = ({ tokens, depth }) => {
    const text = marked.Parser.parseInline(tokens);
    const baseId = slugify(text) || "section";
    const n = (used.get(baseId) ?? 0) + 1;
    used.set(baseId, n);
    const id = n > 1 ? `${baseId}-${n}` : baseId;
    if (depth === 2) headings.push({ id, text: text.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&") });
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };

  renderer.link = ({ href, tokens }) => {
    const text = marked.Parser.parseInline(tokens);
    const url = safeUrl(href);
    if (!url) return text;
    const external = /^https?:\/\//i.test(url);
    return external
      ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener nofollow">${text}</a>`
      : `<a href="${escapeHtml(url)}">${text}</a>`;
  };

  renderer.image = ({ href, text, title }: Tokens.Image) => {
    const url = safeUrl(href);
    if (!url) return escapeHtml(text);
    const t = title ? ` title="${escapeHtml(title)}"` : "";
    return `<img src="${escapeHtml(url)}" alt="${escapeHtml(text)}"${t} loading="lazy" decoding="async" />`;
  };

  // Raw HTML is displayed as text, never injected into the page.
  renderer.html = ({ text }: Tokens.HTML | Tokens.Tag) => escapeHtml(text);

  const html = (marked.parse(markdown, { renderer, async: false, gfm: true }) as string)
    // let wide tables scroll sideways on phones instead of stretching the page
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>");

  return { html, headings };
}
