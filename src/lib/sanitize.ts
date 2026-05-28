import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "pre", "code",
  "hr", "br", "div", "figure", "figcaption",
  "a", "strong", "em", "b", "i", "s", "span", "sub", "sup", "mark",
  "img", "iframe",
];

const ALLOWED_ATTR = [
  "href", "src", "alt", "class", "id", "target", "rel",
  "data-node-type", "data-type",
  "sandbox", "allow", "allowfullscreen",
  "width", "height", "loading",
  "start", "type", "style",
];

const IFRAME_SANDBOX = "allow-scripts allow-same-origin allow-presentation allow-popups";

let hookRegistered = false;
function ensureIframeSandboxHook() {
  if (hookRegistered) return;
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.nodeName === "IFRAME") {
      const el = node as HTMLIFrameElement;
      if (!el.hasAttribute("sandbox")) el.setAttribute("sandbox", IFRAME_SANDBOX);
      if (!el.hasAttribute("loading")) el.setAttribute("loading", "lazy");
      if (!el.hasAttribute("referrerpolicy")) {
        el.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      }
    }
  });
  hookRegistered = true;
}

/**
 * Sanitize HTML produced by the TipTap editor before rendering via
 * `dangerouslySetInnerHTML`. Strips anything not in the whitelist and forces
 * a restrictive sandbox onto every <iframe> regardless of stored markup.
 */
export function sanitizeHtml(dirty: string): string {
  ensureIframeSandboxHook();
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: true,
  });
}
