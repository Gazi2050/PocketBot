/**
 * Builds the host document that pocketbot's HTML artifacts render inside. The model
 * writes a self-contained body fragment that styles itself with --pocketbot-* theme
 * tokens (see convex/inference/htmlTheme.ts); here we define those tokens for
 * the current light/dark theme, add a reset and a height reporter, and wrap the
 * fragment. Two outputs: an iframe srcDoc (in-app, sandboxed) and a standalone
 * page with a "Created with PocketBot" header (download / open in a new tab).
 *
 * Keep the token names in sync with convex/inference/htmlTheme.ts.
 */

type ThemeVars = Record<string, string>;

const LIGHT: ThemeVars = {
  "--pocketbot-bg": "#ffffff",
  "--pocketbot-surface": "#f5f5f4",
  "--pocketbot-surface-2": "#ebebea",
  "--pocketbot-fg": "#171717",
  "--pocketbot-muted": "#737373",
  "--pocketbot-border": "rgba(0,0,0,0.09)",
  "--pocketbot-accent": "#0c82f2",
  "--pocketbot-accent-soft": "rgba(12,130,242,0.12)",
  "--pocketbot-accent-fg": "#ffffff",
  "--pocketbot-success": "#16a34a",
  "--pocketbot-warning": "#d97706",
  "--pocketbot-danger": "#dc2626",
  "--pocketbot-radius": "12px",
  "--pocketbot-font-sans":
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  "--pocketbot-font-mono":
    'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  "--pocketbot-shadow": "0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)",
};

const DARK: ThemeVars = {
  "--pocketbot-bg": "#1a1a19",
  "--pocketbot-surface": "rgba(255,255,255,0.045)",
  "--pocketbot-surface-2": "rgba(255,255,255,0.08)",
  "--pocketbot-fg": "#ededed",
  "--pocketbot-muted": "#a3a3a3",
  "--pocketbot-border": "rgba(255,255,255,0.1)",
  "--pocketbot-accent": "#4d9bf6",
  "--pocketbot-accent-soft": "rgba(77,155,246,0.18)",
  "--pocketbot-accent-fg": "#0b0b0b",
  "--pocketbot-success": "#4ade80",
  "--pocketbot-warning": "#fbbf24",
  "--pocketbot-danger": "#f87171",
  "--pocketbot-radius": "12px",
  "--pocketbot-font-sans":
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  "--pocketbot-font-mono":
    'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  "--pocketbot-shadow": "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.35)",
};

const varsBlock = (vars: ThemeVars) =>
  Object.entries(vars)
    .map(([k, val]) => `  ${k}: ${val};`)
    .join("\n");

/** Fixed-theme tokens (in-app iframe — must match the app exactly right now). */
function fixedTokensCss(dark: boolean): string {
  return `:root {\n${varsBlock(dark ? DARK : LIGHT)}\n  color-scheme: ${dark ? "dark" : "light"};\n}`;
}

/** Theme-adaptive tokens (standalone file — follows the reader's OS theme). */
function adaptiveTokensCss(): string {
  return `:root {\n${varsBlock(LIGHT)}\n  color-scheme: light dark;\n}\n@media (prefers-color-scheme: dark) {\n  :root {\n${varsBlock(DARK)}\n  }\n}`;
}

function baseResetCss(solidBackground: boolean): string {
  return `*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: var(--pocketbot-font-sans);
  color: var(--pocketbot-fg);
  background: ${solidBackground ? "var(--pocketbot-bg)" : "transparent"};
  font-size: 14px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
  overflow-wrap: anywhere;
}
a { color: var(--pocketbot-accent); }
:focus-visible { outline: 2px solid var(--pocketbot-accent); outline-offset: 2px; }
img, svg, canvas, video { max-width: 100%; height: auto; }
code, pre { font-family: var(--pocketbot-font-mono); }
::selection { background: var(--pocketbot-accent-soft); }`;
}

// Reports the rendered height up to the parent so an inline card can size its
// iframe to the content. Harmless in the side panel (the parent ignores it).
const HEIGHT_REPORTER = `(function(){
  function send(){
    try {
      var h = Math.ceil(document.documentElement.getBoundingClientRect().height);
      parent.postMessage({ type: 'pocketbot-html-height', height: h }, '*');
    } catch (e) {}
  }
  window.addEventListener('load', send);
  window.addEventListener('resize', send);
  document.addEventListener('DOMContentLoaded', send);
  if (window.ResizeObserver) { try { new ResizeObserver(send).observe(document.documentElement); } catch (e) {} }
  [50, 250, 800].forEach(function(t){ setTimeout(send, t); });
})();`;

/**
 * Pull the renderable fragment out of whatever the model produced. It's
 * instructed to write a body fragment, but if it wraps the output in a full
 * document we lift the body (hoisting any <head> styles) so wrapping stays
 * clean instead of nesting <html> inside <body>.
 */
export function normalizeHtmlFragment(raw: string): string {
  let html = raw.trim();
  html = html.replace(/^<!doctype[^>]*>/i, "").trim();

  // Greedy to the LAST </body> — a stray "</body>" inside a <script> or text
  // node must not truncate the real body content.
  const bodyMatch = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
  if (bodyMatch) {
    const beforeBody = html.slice(0, bodyMatch.index);
    const headStyles = (beforeBody.match(/<style[\s\S]*?<\/style>/gi) ?? []).join(
      "\n",
    );
    return `${headStyles}\n${bodyMatch[1]}`.trim();
  }

  return html
    .replace(/<\/?html[^>]*>/gi, "")
    .replace(/<\/?head[^>]*>/gi, "")
    .replace(/<\/?body[^>]*>/gi, "")
    .trim();
}

/** The iframe srcDoc for an in-app artifact. `fill` = side panel (solid bg, no
 * outer padding); otherwise an inline card (transparent, padded). */
export function buildHtmlSrcDoc(
  html: string,
  { dark, fill = false }: { dark: boolean; fill?: boolean },
): string {
  const padding = fill ? "0" : "14px";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
${fixedTokensCss(dark)}
${baseResetCss(fill)}
body { padding: ${padding}; }
</style>
</head>
<body>
${normalizeHtmlFragment(html)}
<script>${HEIGHT_REPORTER}</script>
</body>
</html>`;
}

/** The PocketBot mark as inline SVG (inherits currentColor), so the standalone file
 * is self-contained even offline. Keep in sync with public/pocketbot.svg. */
const POCKETBOT_MARK = `<svg viewBox="0 0 180 182" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M90.0905 0C88.4358 0 85.6779 15.9064 85.6779 37.3616C85.6779 58.8168 88.2519 75.4631 89.9066 75.4631C91.0098 75.4631 93.4 64.1806 93.4 37.9165C93.4 14.0569 91.0098 0 90.0905 0Z"/><path d="M44.4951 12.0228C41.3695 13.1325 52.7688 42.356 69.8677 64.3661C74.2804 69.9148 79.4284 76.0185 80.7154 75.6485C84.0249 74.1689 67.1098 35.8824 47.8046 14.4272C45.966 12.5777 45.0467 11.8378 44.4951 12.0228Z"/><path d="M11.0308 45.1304C8.45681 50.1243 37.3228 70.4697 58.2828 78.238C63.0631 80.0876 69.4982 81.3823 70.2336 79.5327C72.0722 76.3884 57.7312 63.4413 41.3677 54.7482C27.2105 47.3499 12.6856 42.7259 11.0308 45.1304Z"/><path d="M30.7046 83.2314C15.0765 83.2314 0 86.5606 0 90.8147C0 94.6988 12.6863 98.9529 30.7046 98.9529C47.4358 98.9529 63.2477 95.6236 63.2477 91.1846C63.2477 87.8553 53.1354 83.2314 30.7046 83.2314Z"/><path d="M11.2144 137.055C13.7884 141.494 28.681 139.089 43.7575 130.211C53.6859 124.662 65.0852 114.86 63.9821 106.721C61.0403 100.803 45.4123 105.427 32.7259 112.64C21.1428 119.299 9.00806 130.581 11.2144 137.055Z"/><path d="M43.576 169.422C47.9886 174.046 60.3072 164.428 68.0293 151.111C74.8321 138.719 78.5093 124.107 73.3612 119.853C68.2131 116.709 58.1009 126.142 50.5626 137.979C43.7598 149.262 39.531 162.579 43.576 169.422Z"/><path d="M90.2772 127.437C85.313 127.437 79.4295 137.61 79.4295 154.996C79.4295 167.203 83.6583 182 90.2772 182C94.506 182 100.757 173.122 100.757 154.996C100.941 139.275 95.793 127.437 90.2772 127.437Z"/><path d="M109.215 124.662C102.963 127.992 104.434 143.713 114.73 157.585C120.982 165.723 127.785 170.902 132.749 170.717C137.897 170.902 140.655 164.798 137.897 153.886C134.22 140.014 119.511 121.518 109.215 124.662Z"/><path d="M125.759 112.455C123.921 121.703 137.894 135.39 151.683 140.014C161.796 142.604 169.702 140.939 169.702 133.726C169.702 121.703 145.984 105.057 132.194 107.646C128.333 108.386 126.127 110.421 125.759 112.455Z"/><path d="M134.587 91C134.587 96.7337 141.573 104.872 158.121 104.872C171.726 104.687 180 99.1382 180 91.185C180 84.7114 171.91 77.3131 158.121 77.3131C145.802 77.1281 134.587 82.8618 133.851 90.2602L134.587 91Z"/><path d="M157.199 39.5811C144.145 39.0262 129.804 50.1237 129.804 61.4062C129.804 66.9549 134.033 72.3187 142.307 72.3187C155.545 72.6887 170.069 62.146 170.069 50.3087C170.069 44.0201 165.289 40.1359 157.199 39.5811Z"/><path d="M130.542 10.7281C121.349 10.7281 108.295 22.5655 108.111 37.1772C108.111 45.5004 111.972 50.4942 118.591 50.4942C127.784 50.4942 141.206 40.1366 141.206 23.6752C141.206 15.907 136.977 10.7281 130.542 10.7281Z"/></svg>`;

type Chrome = {
  bg: string;
  panel: string;
  fg: string;
  muted: string;
  border: string;
  accent: string;
  accentFg: string;
  shadow: string;
};

const CHROME_LIGHT: Chrome = {
  bg: "#f8f8fa",
  panel: "#ffffff",
  fg: "#171717",
  muted: "#737373",
  border: "rgba(0,0,0,0.08)",
  accent: "#0c82f2",
  accentFg: "#ffffff",
  shadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.06)",
};

const CHROME_DARK: Chrome = {
  bg: "#171718",
  panel: "#1a1a19",
  fg: "#ededed",
  muted: "#a3a3a3",
  border: "rgba(255,255,255,0.08)",
  accent: "#2b8ef0",
  accentFg: "#ffffff",
  shadow: "0 1px 2px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.5)",
};

/**
 * A complete, self-contained HTML file styled like the PocketBot app — what the
 * user downloads or shares. The chrome (a contained "Made with PocketBot" bar + a
 * CTA + the share URL) wraps the artifact, which renders in its own sandboxed
 * iframe (isolated from the chrome) and is height-synced by the small listener
 * at the bottom. Theme is baked from the download-time `dark`.
 */
export function buildStandaloneHtmlDoc(
  html: string,
  title: string,
  { dark, origin, shortId }: { dark: boolean; origin: string; shortId?: string },
): string {
  const c = dark ? CHROME_DARK : CHROME_LIGHT;
  const safeTitle = escapeHtml(title || "Made with PocketBot");
  const inner = escapeAttr(buildHtmlSrcDoc(html, { dark }));
  const ctaHref = escapeAttr(origin || "https://pocketbot.chat");
  const shareUrl = shortId ? `${origin}/visual/${shortId}` : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${safeTitle} · PocketBot</title>
<style>
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: ${c.bg};
  color: ${c.fg};
  -webkit-font-smoothing: antialiased;
  color-scheme: ${dark ? "dark" : "light"};
}
.pocketbot-wrap { max-width: 980px; margin: 0 auto; padding: 20px 16px 48px; }
.pocketbot-bar {
  display: flex; align-items: center; gap: 12px;
  padding: 9px 10px 9px 14px; margin-bottom: 14px;
  background: ${c.panel}; border: 1px solid ${c.border};
  border-radius: 16px; box-shadow: ${c.shadow};
}
.pocketbot-brand { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: ${c.fg}; }
.pocketbot-brand svg { width: 22px; height: 22px; display: block; }
.pocketbot-bar .pocketbot-title { min-width: 0; flex: 1; color: ${c.muted}; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pocketbot-cta {
  display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0;
  background: ${c.accent}; color: ${c.accentFg}; text-decoration: none;
  padding: 8px 13px; border-radius: 11px; font-size: 12.5px; font-weight: 600;
}
.pocketbot-cta:hover { filter: brightness(1.05); }
.pocketbot-stage { background: ${c.panel}; border: 1px solid ${c.border}; border-radius: 24px; overflow: hidden; box-shadow: ${c.shadow}; }
.pocketbot-stage iframe { width: 100%; border: 0; display: block; background: transparent; height: 480px; }
.pocketbot-foot { margin-top: 16px; display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; justify-content: space-between; color: ${c.muted}; font-size: 12.5px; }
.pocketbot-foot b { color: ${c.fg}; font-weight: 600; }
.pocketbot-foot a { color: ${c.accent}; text-decoration: none; font-weight: 600; }
.pocketbot-url { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: ${c.muted}; }
</style>
</head>
<body>
<div class="pocketbot-wrap">
  <div class="pocketbot-bar">
    <span class="pocketbot-brand">${POCKETBOT_MARK}<span>PocketBot</span></span>
    <span class="pocketbot-title">${safeTitle}</span>
    <a class="pocketbot-cta" href="${ctaHref}" target="_blank" rel="noopener">Try PocketBot free →</a>
  </div>
  <div class="pocketbot-stage">
    <iframe id="pocketbot-frame" sandbox="allow-scripts" srcdoc="${inner}" title="${safeTitle}"></iframe>
  </div>
  <div class="pocketbot-foot">
    <span>Made with <b>PocketBot</b></span>
    ${shareUrl ? `<span class="pocketbot-url">${escapeHtml(shareUrl)}</span>` : `<a href="${ctaHref}" target="_blank" rel="noopener">Create your own →</a>`}
  </div>
</div>
<script>
window.addEventListener('message', function (e) {
  var f = document.getElementById('pocketbot-frame');
  if (f && e.source === f.contentWindow && e.data && e.data.type === 'pocketbot-html-height') {
    f.style.height = Math.max(140, Math.ceil(e.data.height)) + 'px';
  }
});
</script>
</body>
</html>`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Escape a string for use inside a double-quoted HTML attribute (e.g. srcdoc). */
function escapeAttr(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
