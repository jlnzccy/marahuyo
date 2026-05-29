"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useRef } from "react";
import { PoetryNode } from "./extensions/poetry-node";
import { EmbedNode } from "./extensions/embed-node";
import { MarginaliaMark } from "./extensions/marginalia-mark";
import { EditorToolbar } from "./editor-toolbar";
import { EditorBubbleMenu } from "./editor-bubble-menu";

export type EditorPayload = {
  html: string;
  text: string;
  words: number;
  readingMinutes: number;
};

type Props = {
  /** Initial body HTML. */
  initialContent: string;
  /** Fired on every keystroke after a small debounce in the consumer. */
  onChange: (payload: EditorPayload) => void;
  placeholder?: string;
  /**
   * Storage prefix under the `covers` bucket for inline image uploads.
   * When set, the toolbar's image button opens a file picker that uploads
   * to `covers/<uploadPrefix>/`. When omitted, falls back to URL-only.
   */
  uploadPrefix?: string;
};

const WORDS_PER_MINUTE = 200;

export function Editor({ initialContent, onChange, placeholder, uploadPrefix }: Props) {
  // Hold the latest onChange in a ref so we can register it once with TipTap
  // without re-instantiating the editor on every parent render.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    immediatelyRender: false, // avoids Next 15 SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        horizontalRule: {
          HTMLAttributes: { class: "scene-break" }
        }
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Begin where the page is quiet…",
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-whisper before:float-left before:pointer-events-none before:h-0"
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noreferrer noopener", target: "_blank" }
      }),
      Image.configure({ inline: false, allowBase64: false }),
      CharacterCount,
      PoetryNode,
      EmbedNode,
      MarginaliaMark
    ],
    content: initialContent || "",
    editorProps: {
      attributes: {
        class:
          "reader-prose focus:outline-none min-h-[60vh] [&_p[data-placeholder]]:relative"
      }
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      const text = editor.getText();
      const words = editor.storage.characterCount?.words?.() ?? 0;
      const readingMinutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
      onChangeRef.current({ html, text, words, readingMinutes });
    }
  });

  if (!editor) return null;

  return (
    <div className="space-y-4">
      <EditorToolbar editor={editor} uploadPrefix={uploadPrefix} />
      <EditorBubbleMenu editor={editor} />
      <div className="mx-auto max-w-reader">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
