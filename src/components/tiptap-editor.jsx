import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const toolbarButtons = [
  {
    label: "Bold",
    isActive: (editor) => editor.isActive("bold"),
    run: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    label: "Italic",
    isActive: (editor) => editor.isActive("italic"),
    run: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    label: "H2",
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
    run: (editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: "H3",
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
    run: (editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: "Bullet List",
    isActive: (editor) => editor.isActive("bulletList"),
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: "Quote",
    isActive: (editor) => editor.isActive("blockquote"),
    run: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
];

export function TiptapEditor({ disabled = false, onChange, value = "" }) {
  const editor = useEditor({
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class: "tiptap-content",
      },
    },
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.({
        html: currentEditor.getHTML(),
        text: currentEditor.getText(),
      });
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextValue = value || "<p></p>";
    if (editor.getHTML() !== nextValue) {
      editor.commands.setContent(nextValue, false);
    }

    editor.setEditable(!disabled);
  }, [disabled, editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-background shadow-sm">
      <div className="flex flex-wrap gap-2 border-b border-border/70 bg-muted/40 px-4 py-3">
        {toolbarButtons.map((button) => (
          <Button
            className={cn(
              "rounded-full px-3",
              button.isActive(editor) && "bg-primary text-primary-foreground"
            )}
            disabled={disabled}
            key={button.label}
            onClick={() => button.run(editor)}
            size="sm"
            type="button"
            variant="outline"
          >
            {button.label}
          </Button>
        ))}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
