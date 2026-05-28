import { Node, mergeAttributes } from "@tiptap/core";

/* ---------------------------------------------------------------
   Supported providers and their URL → embed-src adapters
   --------------------------------------------------------------- */

export type EmbedProvider = "youtube" | "instagram" | "vimeo" | "spotify" | "tiktok";

export const EMBED_PROVIDERS: {
  id: EmbedProvider;
  label: string;
  placeholder: string;
}[] = [
  { id: "youtube", label: "YouTube", placeholder: "https://www.youtube.com/watch?v=..." },
  { id: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/p/..." },
  { id: "vimeo", label: "Vimeo", placeholder: "https://vimeo.com/..." },
  { id: "spotify", label: "Spotify", placeholder: "https://open.spotify.com/track/..." },
  { id: "tiktok", label: "TikTok", placeholder: "https://www.tiktok.com/@user/video/..." }
];

/* ---- YouTube -------------------------------------------------- */
const YT_RE =
  /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i;

export function youtubeToEmbed(url: string): string | null {
  const m = url.match(YT_RE);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

/* ---- Instagram ------------------------------------------------ */
const IG_RE = /instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i;

export function instagramToEmbed(url: string): string | null {
  const m = url.match(IG_RE);
  return m ? `https://www.instagram.com/p/${m[1]}/embed` : null;
}

/* ---- Vimeo ---------------------------------------------------- */
const VM_RE = /vimeo\.com\/(\d+)/i;

export function vimeoToEmbed(url: string): string | null {
  const m = url.match(VM_RE);
  return m ? `https://player.vimeo.com/video/${m[1]}` : null;
}

/* ---- Spotify -------------------------------------------------- */
const SP_RE =
  /open\.spotify\.com\/(track|album|playlist|episode|show)\/([A-Za-z0-9]+)/i;

export function spotifyToEmbed(url: string): string | null {
  const m = url.match(SP_RE);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null;
}

/* ---- TikTok --------------------------------------------------- */
const TT_RE = /tiktok\.com\/@[^/]+\/video\/(\d+)/i;

export function tiktokToEmbed(url: string): string | null {
  const m = url.match(TT_RE);
  return m ? `https://www.tiktok.com/embed/v2/${m[1]}` : null;
}

/* ---- Adapter lookup ------------------------------------------- */

const ADAPTERS: Record<EmbedProvider, (url: string) => string | null> = {
  youtube: youtubeToEmbed,
  instagram: instagramToEmbed,
  vimeo: vimeoToEmbed,
  spotify: spotifyToEmbed,
  tiktok: tiktokToEmbed
};

export function toEmbedUrl(
  provider: EmbedProvider,
  url: string
): string | null {
  return ADAPTERS[provider]?.(url) ?? null;
}

/**
 * Try to auto-detect the provider from a raw URL.
 * Returns null if no provider matches.
 */
export function detectProvider(url: string): EmbedProvider | null {
  if (YT_RE.test(url)) return "youtube";
  if (IG_RE.test(url)) return "instagram";
  if (VM_RE.test(url)) return "vimeo";
  if (SP_RE.test(url)) return "spotify";
  if (TT_RE.test(url)) return "tiktok";
  return null;
}

/* ---------------------------------------------------------------
   TipTap Node
   --------------------------------------------------------------- */

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (options: { provider: EmbedProvider; url: string }) => ReturnType;
    };
  }
}

export const EmbedNode = Node.create({
  name: "embed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      provider: { default: "" },
      url: { default: "" }
    };
  },

  parseHTML() {
    return [
      /* New format */
      { tag: "div.embed-block[data-embed-provider]" },
      /* Legacy: existing published Instagram embeds */
      {
        tag: "div.instagram-embed[data-instagram-url]",
        getAttrs(node) {
          const el = node as HTMLElement;
          return {
            provider: "instagram",
            url: el.getAttribute("data-instagram-url") ?? ""
          };
        }
      }
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const provider = (node.attrs.provider as EmbedProvider) || "youtube";
    const url = (node.attrs.url as string) || "";
    const embedSrc = toEmbedUrl(provider, url);

    if (!embedSrc) {
      return [
        "div",
        mergeAttributes(HTMLAttributes, {
          class: "embed-block embed-block-broken",
          "data-embed-provider": provider,
          "data-embed-url": url
        }),
        ["span", {}, `Invalid ${provider} URL`]
      ];
    }

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class: "embed-block",
        "data-embed-provider": provider,
        "data-embed-url": url
      }),
      [
        "iframe",
        {
          src: embedSrc,
          loading: "lazy",
          sandbox: "allow-scripts allow-same-origin allow-presentation allow-popups",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          allowfullscreen: "true",
          frameborder: "0",
          scrolling: "no"
        }
      ]
    ];
  },

  addCommands() {
    return {
      setEmbed:
        ({ provider, url }) =>
        ({ commands }) => {
          const trimmed = url.trim();
          if (!toEmbedUrl(provider, trimmed)) return false;
          return commands.insertContent({
            type: this.name,
            attrs: { provider, url: trimmed }
          });
        }
    };
  }
});
