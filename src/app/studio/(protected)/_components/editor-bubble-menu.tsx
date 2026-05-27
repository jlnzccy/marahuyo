"use client";

import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Italic, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/cn";

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
  const promptForLink = () => {
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Link URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top" }}
      shouldShow={({ editor, from, to }) => {
        if (from === to) return false;
        if (editor.isActive("poetry")) return false;
        return editor.isEditable;
      }}
      className="flex items-center gap-0.5 rounded-md border border-ink/20 bg-ink/95 p-1 shadow-lg backdrop-blur"
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
        onClick={promptForLink}
      />
    </BubbleMenu>
  );
}
