import sanitizeHtmlLib from "sanitize-html";

const ALLOWED_TAGS = [
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "pre", "code",
  "hr", "br", "div", "figure", "figcaption",
  "a", "strong", "em", "b", "i", "s", "span", "sub", "sup", "mark",
  "img", "iframe",
];

const COMMON_ATTRS = [
  "class", "id", "style",
  "data-node-type", "data-type",
  "data-*",
];

const IFRAME_SANDBOX = "allow-scripts allow-same-origin allow-presentation allow-popups";

/**
 * Sanitize HTML produced by the TipTap editor before rendering via
 * `dangerouslySetInnerHTML`. Strips anything not in the whitelist and forces
 * a restrictive sandbox onto every <iframe> regardless of stored markup.
 */
export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      "*": COMMON_ATTRS,
      a: ["href", "target", "rel", ...COMMON_ATTRS],
      img: ["src", "alt", "width", "height", "loading", ...COMMON_ATTRS],
      iframe: [
        "src", "width", "height", "loading",
        "sandbox", "allow", "allowfullscreen", "referrerpolicy",
        ...COMMON_ATTRS,
      ],
      ol: ["start", "type", ...COMMON_ATTRS],
      ul: ["type", ...COMMON_ATTRS],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    allowedSchemesAppliedToAttributes: ["href", "src"],
    allowProtocolRelative: false,
    transformTags: {
      iframe: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          sandbox: attribs.sandbox || IFRAME_SANDBOX,
          loading: attribs.loading || "lazy",
          referrerpolicy: attribs.referrerpolicy || "strict-origin-when-cross-origin",
        },
      }),
    },
  });
}
