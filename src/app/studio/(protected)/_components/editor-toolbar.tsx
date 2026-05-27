"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Feather,
  Link as LinkIcon,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Instagram
} from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  editor: Editor;
};

type ButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

function ToolButton({ onClick, active, disabled, label, icon: Icon }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted transition-colors",
        "hover:bg-surface hover:text-ink",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted",
        active && "border-border bg-surface text-ink"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-border/70" />;
}

export function EditorToolbar({ editor }: Props) {
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

  const promptForImage = () => {
    const url = window.prompt("Image URL");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const promptForInstagram = () => {
    const url = window.prompt(
      "Instagram post URL",
      "https://www.instagram.com/p/"
    );
    if (!url) return;
    const ok = editor.chain().focus().setInstagram({ url }).run();
    if (!ok) {
      window.alert(
        "That doesn't look like an Instagram post/reel URL. Expected /p/<id> or /reel/<id>."
      );
    }
  };

  return (
    <div className="sticky top-16 z-20 flex flex-wrap items-center gap-0.5 rounded-lg border border-border/70 bg-canvas/85 p-1 backdrop-blur">
      <ToolButton
        label="Heading 2"
        icon={Heading2}
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolButton
        label="Heading 3"
        icon={Heading3}
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />

      <Divider />

      <ToolButton
        label="Bold"
        icon={Bold}
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolButton
        label="Italic"
        icon={Italic}
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolButton label="Link" icon={LinkIcon} active={editor.isActive("link")} onClick={promptForLink} />

      <Divider />

      <ToolButton
        label="Bullet list"
        icon={List}
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolButton
        label="Numbered list"
        icon={ListOrdered}
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolButton
        label="Block quote"
        icon={Quote}
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <ToolButton
        label="Scene break"
        icon={Minus}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      />

      <Divider />

      <ToolButton
        label="Poetry block (preserves indents)"
        icon={Feather}
        active={editor.isActive("poetry")}
        onClick={() => editor.chain().focus().toggleNode("poetry", "paragraph").run()}
      />
      <ToolButton label="Image" icon={ImageIcon} onClick={promptForImage} />
      <ToolButton
        label="Embed Instagram post"
        icon={Instagram}
        onClick={promptForInstagram}
      />

      <Divider />

      <ToolButton
        label="Undo"
        icon={Undo2}
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      />
      <ToolButton
        label="Redo"
        icon={Redo2}
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      />
    </div>
  );
}
