import { Node, mergeAttributes } from "@tiptap/core";

const SHORTCODE_RE = /instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i;

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    instagram: {
      setInstagram: (options: { url: string }) => ReturnType;
    };
  }
}

function toEmbedUrl(input: string): string | null {
  const match = input.match(SHORTCODE_RE);
  if (!match) return null;
  return `https://www.instagram.com/p/${match[1]}/embed`;
}

/**
 * Instagram embed block. Stores the original post URL and renders an iframe
 * pointing at Instagram's `/embed` endpoint — works without Instagram's
 * companion JS, which keeps the reader page light.
 *
 * Outgoing HTML:
 *   <div class="instagram-embed" data-instagram-url="…">
 *     <iframe src="…/embed" loading="lazy" ...></iframe>
 *   </div>
 */
export const InstagramNode = Node.create({
  name: "instagram",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      url: { default: "" }
    };
  },

  parseHTML() {
    return [{ tag: "div.instagram-embed" }, { tag: "div[data-instagram-url]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const url = (node.attrs.url as string) || "";
    const embed = toEmbedUrl(url);
    if (!embed) {
      return [
        "div",
        mergeAttributes(HTMLAttributes, {
          class: "instagram-embed instagram-embed-broken",
          "data-instagram-url": url
        }),
        ["span", {}, "Broken Instagram URL"]
      ];
    }
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class: "instagram-embed",
        "data-instagram-url": url
      }),
      [
        "iframe",
        {
          src: embed,
          loading: "lazy",
          allowtransparency: "true",
          allowfullscreen: "true",
          frameborder: "0",
          scrolling: "no",
          class: "instagram-embed-frame"
        }
      ]
    ];
  },

  addCommands() {
    return {
      setInstagram:
        ({ url }) =>
        ({ commands }) => {
          const trimmed = url.trim();
          if (!toEmbedUrl(trimmed)) return false;
          return commands.insertContent({
            type: this.name,
            attrs: { url: trimmed }
          });
        }
    };
  }
});
