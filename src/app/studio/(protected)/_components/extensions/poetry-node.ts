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

      // Exit the poetry block: drop into a new paragraph after it. Useful as
      // a deliberate, unambiguous escape that doesn't depend on the cursor
      // sitting at exactly the right spot.
      "Mod-Enter": () => {
        if (!this.editor.isActive(this.name)) return false;
        const { $from } = this.editor.state.selection;
        const afterNode = $from.end($from.depth) + 1;
        return this.editor
          .chain()
          .insertContentAt(afterNode, { type: "paragraph" })
          .setTextSelection(afterNode + 1)
          .focus()
          .run();
      },

      Enter: () => {
        if (!this.editor.isActive(this.name)) return false;

        // If the cursor sits at the end of the node and the previous char is
        // already a newline, the writer pressed Enter on an empty trailing
        // line — exit the poetry block into a fresh paragraph instead of
        // appending yet another \n.
        const { state } = this.editor;
        const { $from, empty } = state.selection;
        const nodeEnd = $from.end($from.depth);
        const atEnd = empty && $from.pos === nodeEnd;
        if (atEnd) {
          const prevChar = state.doc.textBetween(
            Math.max(0, $from.pos - 1),
            $from.pos
          );
          if (prevChar === "\n") {
            const afterNode = nodeEnd + 1;
            return this.editor
              .chain()
              .deleteRange({ from: $from.pos - 1, to: $from.pos })
              .insertContentAt(afterNode - 1, { type: "paragraph" })
              .setTextSelection(afterNode)
              .focus()
              .run();
          }
        }

        // Otherwise insert a literal newline so verse line breaks stay inside
        // the node instead of TipTap splitting the block into a new paragraph.
        return this.editor.commands.insertContent("\n");
      },

      "Shift-Enter": () => {
        if (!this.editor.isActive(this.name)) return false;
        return this.editor.commands.insertContent("\n");
      }
    };
  }
});
