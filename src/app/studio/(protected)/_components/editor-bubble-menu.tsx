"use client";

import { useCallback, useState } from "react";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Italic, Link as LinkIcon, StickyNote } from "lucide-react";
import { cn } from "@/lib/cn";
import { PromptDialog } from "./prompt-dialog";

type Props = { editor: Editor };

function BubbleButton({
  active,
  onClick,
  label,
  icon: Icon
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded text-canvas/80 transition-colors",
        "hover:bg-canvas/10 hover:text-canvas",
        active && "bg-canvas/15 text-canvas"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

/**
 * Floating inline-formatting menu. Renders only when the editor has a
 * non-empty text selection that isn't inside the poetry block (where bold /
 * italic / link marks don't apply — code: true strips marks).
 */
export function EditorBubbleMenu({ editor }: Props) {
  const [linkPromptOpen, setLinkPromptOpen] = useState(false);
  const [linkDefault, setLinkDefault] = useState("");
  const [notePromptOpen, setNotePromptOpen] = useState(false);
  const [noteDefault, setNoteDefault] = useState("");

  const openLinkPrompt = () => {
    const prev = editor.getAttributes("link").href ?? "";
    setLinkDefault(prev || "https://");
    setLinkPromptOpen(true);
  };

  const openNotePrompt = () => {
    setNoteDefault(editor.getAttributes("marginalia").note ?? "");
    setNotePromptOpen(true);
  };

  const handleNoteConfirm = useCallback(
    (value: string) => {
      if (value === "") {
        editor.chain().focus().extendMarkRange("marginalia").unsetMarginalia().run();
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange("marginalia")
          .setMarginalia({ note: value })
          .run();
      }
      setNotePromptOpen(false);
    },
    [editor]
  );

  const handleNoteCancel = useCallback(() => {
    setNotePromptOpen(false);
    editor.chain().focus().run();
  }, [editor]);

  const handleLinkConfirm = useCallback(
    (value: string) => {
      if (value === "") {
        editor.chain().focus().unsetLink().run();
      } else {
        editor.chain().focus().extendMarkRange("link").setLink({ href: value }).run();
      }
      setLinkPromptOpen(false);
    },
    [editor]
  );

  const handleLinkCancel = useCallback(() => {
    setLinkPromptOpen(false);
    editor.chain().focus().run();
  }, [editor]);

  return (
    <>
      <BubbleMenu
        editor={editor}
        options={{ placement: "top" }}
        shouldShow={({ editor, from, to }) => {
          if (from === to) return false;
          if (editor.isActive("poetry")) return false;
          return editor.isEditable;
        }}
        className="z-30 flex items-center gap-0.5 rounded-md border border-ink/20 bg-ink/95 p-1 shadow-lg backdrop-blur"
      >
        <BubbleButton
          label="Bold"
          icon={Bold}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <BubbleButton
          label="Italic"
          icon={Italic}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <BubbleButton
          label="Link"
          icon={LinkIcon}
          active={editor.isActive("link")}
          onClick={openLinkPrompt}
        />
        <BubbleButton
          label="Margin note"
          icon={StickyNote}
          active={editor.isActive("marginalia")}
          onClick={openNotePrompt}
        />
      </BubbleMenu>

      {/* Themed link prompt — replaces window.prompt */}
      <PromptDialog
        open={linkPromptOpen}
        title="Link URL"
        description="Leave empty and confirm to remove an existing link."
        placeholder="https://…"
        defaultValue={linkDefault}
        confirmLabel="Set link"
        onConfirm={handleLinkConfirm}
        onCancel={handleLinkCancel}
      />

      {/* Margin note — the selected text becomes the anchor, this is the note */}
      <PromptDialog
        open={notePromptOpen}
        title="Margin note"
        description="A quiet aside shown in the margin. Leave empty and confirm to remove it."
        placeholder="An aside for the reader…"
        defaultValue={noteDefault}
        confirmLabel="Save note"
        onConfirm={handleNoteConfirm}
        onCancel={handleNoteCancel}
      />
    </>
  );
}
