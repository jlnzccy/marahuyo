import { Mark, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    marginalia: {
      /** Mark the selection as a marginalia anchor carrying `note`. */
      setMarginalia: (attrs: { note: string }) => ReturnType;
      /** Strip the marginalia mark from the selection. */
      unsetMarginalia: () => ReturnType;
    };
  }
}

/**
 * Marginalia — an inline mark rendering `<span class="marginalia"
 * data-note="…">anchor</span>`. The anchor text stays in the prose; the note
 * rides along in `data-note`. No DB migration or sanitize change is needed:
 * the allowlist already permits `span`, `class`, and `data-*`.
 *
 * The reader-side decoration (numbered marker + margin / tap-reveal note) is
 * applied at runtime by `components/marginalia.tsx`.
 */
export const MarginaliaMark = Mark.create({
  name: "marginalia",
  inclusive: false,

  addAttributes() {
    return {
      note: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-note") ?? "",
        renderHTML: (attrs) =>
          attrs.note ? { "data-note": attrs.note as string } : {}
      }
    };
  },

  parseHTML() {
    return [{ tag: "span.marginalia" }, { tag: "span[data-note]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes({ class: "marginalia" }, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setMarginalia:
        (attrs) =>
        ({ commands }) =>
          commands.setMark(this.name, attrs),
      unsetMarginalia:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name)
    };
  }
});
