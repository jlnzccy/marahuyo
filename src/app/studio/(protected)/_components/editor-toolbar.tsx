"use client";

import { useCallback, useRef, useState } from "react";
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
  Code2
} from "lucide-react";
import { cn } from "@/lib/cn";
import { PromptDialog } from "./prompt-dialog";
import { EmbedPicker } from "./embed-picker";
import { ImageUploadDialog } from "./image-upload-dialog";

type Props = {
  editor: Editor;
  /** When set, image button opens a file uploader scoped to this prefix. */
  uploadPrefix?: string;
};

type ButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  buttonRef?: React.Ref<HTMLButtonElement>;
};

function ToolButton({ onClick, active, disabled, label, icon: Icon, buttonRef }: ButtonProps) {
  return (
    <button
      ref={buttonRef}
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

/* ------------------------------------------------------------------
   Prompt dialog states
   ------------------------------------------------------------------ */

type PromptState =
  | { kind: "closed" }
  | { kind: "link"; defaultValue: string }
  | { kind: "image" };

export function EditorToolbar({ editor, uploadPrefix }: Props) {
  /* -- prompt dialog ------------------------------------------------ */
  const [prompt, setPrompt] = useState<PromptState>({ kind: "closed" });

  const openLinkPrompt = () => {
    const prev = editor.getAttributes("link").href ?? "";
    setPrompt({ kind: "link", defaultValue: prev || "https://" });
  };

  const openImagePrompt = () => {
    setPrompt({ kind: "image" });
  };

  const handlePromptConfirm = useCallback(
    (value: string) => {
      if (prompt.kind === "link") {
        if (value === "") {
          editor.chain().focus().unsetLink().run();
        } else {
          editor.chain().focus().extendMarkRange("link").setLink({ href: value }).run();
        }
      } else if (prompt.kind === "image") {
        if (value) {
          editor.chain().focus().setImage({ src: value }).run();
        }
      }
      setPrompt({ kind: "closed" });
    },
    [prompt, editor]
  );

  const handlePromptCancel = useCallback(() => {
    setPrompt({ kind: "closed" });
    editor.chain().focus().run();
  }, [editor]);

  const insertImageUrl = useCallback(
    (url: string) => {
      if (url) editor.chain().focus().setImage({ src: url }).run();
      setPrompt({ kind: "closed" });
    },
    [editor]
  );

  /* -- embed picker ------------------------------------------------- */
  const [embedOpen, setEmbedOpen] = useState(false);
  const embedBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
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
        <ToolButton label="Link" icon={LinkIcon} active={editor.isActive("link")} onClick={openLinkPrompt} />

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
        <ToolButton label="Image" icon={ImageIcon} onClick={openImagePrompt} />
        <ToolButton
          label="Embed media"
          icon={Code2}
          active={embedOpen}
          onClick={() => setEmbedOpen((o) => !o)}
          buttonRef={embedBtnRef}
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

      {/* Embed picker popover — absolutely positioned below the toolbar */}
      <EmbedPicker
        editor={editor}
        open={embedOpen}
        onClose={() => {
          setEmbedOpen(false);
          editor.chain().focus().run();
        }}
        anchorRef={embedBtnRef}
      />

      {/* Themed prompt dialogs — replace all window.prompt calls */}
      <PromptDialog
        open={prompt.kind === "link"}
        title="Link URL"
        description="Leave empty and confirm to remove an existing link."
        placeholder="https://…"
        defaultValue={prompt.kind === "link" ? prompt.defaultValue : ""}
        confirmLabel="Set link"
        onConfirm={handlePromptConfirm}
        onCancel={handlePromptCancel}
      />

      {/* Image: upload dialog when scope is known, URL prompt as fallback. */}
      {uploadPrefix ? (
        <ImageUploadDialog
          open={prompt.kind === "image"}
          prefix={uploadPrefix}
          onConfirm={insertImageUrl}
          onCancel={handlePromptCancel}
        />
      ) : (
        <PromptDialog
          open={prompt.kind === "image"}
          title="Image URL"
          placeholder="https://…"
          confirmLabel="Insert image"
          onConfirm={handlePromptConfirm}
          onCancel={handlePromptCancel}
        />
      )}
    </div>
  );
}
