import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Poetry block — renders to `<div class="poetry">…</div>`.
 *
 * Content is treated as code-like so leading whitespace, indents and soft
 * returns (`\n`) are preserved exactly as the writer types them. The matching
 * CSS rule (`.poetry { white-space: pre-wrap }`) lives in `globals.css`.
 *
 * Toggle a paragraph into / out of this block with `Mod-Alt-P` or via the
 * toolbar button.
 */
export const PoetryNode = Node.create({
  name: "poetry",
  group: "block",
  content: "text*",
  marks: "",
  code: true,
  defining: true,

  parseHTML() {
    return [
      { tag: "div.poetry" },
      { tag: 'div[data-node-type="poetry"]' }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ class: "poetry", "data-node-type": "poetry" }, HTMLAttributes),
      0
    ];
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Alt-p": () =>
        this.editor.commands.toggleNode(this.name, "paragraph"),

      Enter: () => {
        if (!this.editor.isActive(this.name)) return false;
        // Insert a literal newline so the verse line breaks stay inside the node
        // instead of TipTap splitting the block into a new paragraph.
        return this.editor.commands.insertContent("\n");
      },

      "Shift-Enter": () => {
        if (!this.editor.isActive(this.name)) return false;
        return this.editor.commands.insertContent("\n");
      }
    };
  }
});
