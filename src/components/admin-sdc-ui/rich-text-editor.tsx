"use client";

import { useState } from "react";
import {
  useEditor,
  EditorContent,
  ReactRenderer,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/admin-sdc-ui/dialog";
import {
  MentionSuggestionList,
  buildMentionItems,
  type MentionSuggestionListRef,
} from "@/components/admin-sdc-ui/mention-suggestion-list";

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  children,
  title,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-muted text-foreground"
      )}
    >
      {children}
    </button>
  );
}

// ── TipTap mention suggestion adapter ───────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMentionSuggestion(
  availableVariables: string[],
  onNewTerm?: (term: string) => void
): any {
  return {
    char: "@",
    allowSpaces: false,
    allowedPrefixes: [" ", null],
    items: ({ query }: { query: string }) => {
      return buildMentionItems(query, availableVariables);
    },
    render: () => {
      let component: ReactRenderer<MentionSuggestionListRef> | null = null;
      let popup: HTMLDivElement | null = null;

      const wrapCommand = (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        propsCommand: any
      ) => {
        return (attrs: { id: string; label: string }) => {
          const isNew = !availableVariables.includes(attrs.id);
          if (isNew && onNewTerm) {
            onNewTerm(attrs.id);
          }
          propsCommand(attrs);
        };
      };

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onStart: (props: any) => {
          component = new ReactRenderer(MentionSuggestionList, {
            props: {
              items: props.items,
              command: wrapCommand(props.command),
            },
            editor: props.editor,
          });

          popup = document.createElement("div");
          popup.style.position = "absolute";
          popup.style.zIndex = "50";
          document.body.appendChild(popup);

          const rect = props.clientRect?.();
          if (rect && popup) {
            popup.style.top = `${rect.bottom + window.scrollY + 4}px`;
            popup.style.left = `${rect.left + window.scrollX}px`;
          }

          if (popup && component.element) {
            popup.appendChild(component.element);
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onUpdate: (props: any) => {
          component?.updateProps({
            items: props.items,
            command: wrapCommand(props.command),
          });

          const rect = props.clientRect?.();
          if (rect && popup) {
            popup.style.top = `${rect.bottom + window.scrollY + 4}ps`;
            popup.style.left = `${rect.left + window.scrollX}px`;
          }
        },
        onKeyDown: (props: { event: KeyboardEvent }) => {
          if (props.event.key === "Escape") {
            popup?.remove();
            component?.destroy();
            return true;
          }
          return component?.ref?.onKeyDown(props) ?? false;
        },
        onExit: () => {
          popup?.remove();
          component?.destroy();
        },
      };
    },
  };
}

/**
 * Convert {{variable}} plain text in HTML to Mention node markup
 * so TipTap renders them with the styled mention component on load.
 */
function convertVariablesToMentions(html: string): string {
  return html.replace(/\{\{(\w+(?:_\w+)*)\}\}/g, (_match, id) => {
    return `<span data-type="mention" data-id="${id}" data-label="${id}">{{${id}}}</span>`;
  });
}

// ── RichTextEditor ──────────────────────────────────────────────────

interface RichTextEditorProps {
  content: string;
  onChange?: (html: string) => void;
  className?: string;
  availableVariables?: string[];
  onNewVariable?: (term: string) => void;
  /**
   * Fill a flex parent: toolbar stays fixed, editable area scrolls inside the component
   * (no page-level scroll). Used in constrained modals.
   */
  fillContainer?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  className,
  availableVariables,
  onNewVariable,
  fillContainer = false,
}: RichTextEditorProps) {
  const extensions = [
    StarterKit,
    LinkExtension.configure({
      openOnClick: false,
      HTMLAttributes: { class: "text-primary underline" },
    }),
    ...(availableVariables
      ? [
          Mention.configure({
            HTMLAttributes: {
              class:
                "inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-sm font-medium",
            },
            suggestion: createMentionSuggestion(availableVariables, onNewVariable),
            renderLabel: ({ node }) => `@${node.attrs.id}`,
          }),
        ]
      : []),
  ];

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: availableVariables ? convertVariablesToMentions(content) : content,
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: fillContainer
          ? "prose prose-sm dark:prose-invert max-w-none min-h-[12rem] px-4 py-3 focus:outline-none"
          : "prose prose-sm dark:prose-invert max-w-none min-h-[400px] px-4 py-3 focus:outline-none",
      },
    },
  }, [fillContainer]);

  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  if (!editor) return null;

  function handleLinkOpen() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    setLinkUrl(prev || "https://");
    setShowLinkDialog(true);
  }

  function handleLinkSubmit() {
    if (!editor) return;
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }
    setShowLinkDialog(false);
    setLinkUrl("");
  }

  function handleImageSubmit() {
    if (!editor || !imageUrl.trim()) return;
    editor
      .chain()
      .focus()
      .insertContent(`<img src="${imageUrl}" alt="" />`)
      .run();
    setShowImageDialog(false);
    setImageUrl("");
  }

  return (
    <>
    {/* Link Dialog */}
    {showLinkDialog && (
      <Dialog open={true} onOpenChange={(v) => !v && setShowLinkDialog(false)}>
        <DialogHeader>
          <DialogTitle>Insert Link</DialogTitle>
          <DialogDescription>
            Enter a URL to create or update a link.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-4">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleLinkSubmit();
              }
            }}
          />
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => {
              if (editor) {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
              }
              setShowLinkDialog(false);
              setLinkUrl("");
            }}
            className="flex h-8 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
          >
            Remove Link
          </button>
          <button
            type="button"
            onClick={handleLinkSubmit}
            className="flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover active:bg-primary-active"
          >
            Apply
          </button>
        </DialogFooter>
      </Dialog>
    )}

    {/* Image Dialog */}
    {showImageDialog && (
      <Dialog open={true} onOpenChange={(v) => !v && setShowImageDialog(false)}>
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription>
            Enter an image URL to insert into the editor.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-4">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.png"
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleImageSubmit();
              }
            }}
          />
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => {
              setShowImageDialog(false);
              setImageUrl("");
            }}
            className="flex h-8 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImageSubmit}
            disabled={!imageUrl.trim()}
            className="flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-40"
          >
            Insert
          </button>
        </DialogFooter>
      </Dialog>
    )}
    <div
      className={cn(
        "rounded-2xl border border-border bg-background",
        fillContainer && "flex min-h-0 flex-1 flex-col overflow-hidden",
        className
      )}
    >
      {/* Toolbar */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5",
          fillContainer && "shrink-0"
        )}
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          onClick={handleLinkOpen}
          isActive={editor.isActive("link")}
          title="Link"
        >
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowImageDialog(true)}
          title="Image"
        >
          <ImageIcon className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="size-4" />
        </ToolbarButton>
      </div>

      {/* Editor — scroll inside this region when fillContainer (modal layout) */}
      <div
        className={cn(
          fillContainer && "min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
        )}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
    </>
  );
}
