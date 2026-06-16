'use client'

import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Strikethrough,
  Heading2,
  Heading3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TiptapEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-neon underline underline-offset-2',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Descreva o produto...',
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-sm max-w-none min-h-[200px] px-4 py-3 focus:outline-none [&_p]:my-2 [&_ul]:my-2 [&_li]:my-1 [&_h2]:text-foreground [&_h3]:text-foreground',
      },
    },
  })

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  function addLink() {
    if (!editor) return
    const url = prompt('URL do link:')
    if (!url) return
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run()
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-bg-primary focus-within:border-neon">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-bg-tertiary/50 px-2 py-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          aria-label="Negrito"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          aria-label="Itálico"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          aria-label="Riscado"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive('heading', { level: 2 })}
          aria-label="Título 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive('heading', { level: 3 })}
          aria-label="Título 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          aria-label="Lista"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          aria-label="Lista numerada"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          aria-label="Citação"
        >
          <Quote className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          onClick={addLink}
          active={editor.isActive('link')}
          aria-label="Link"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

function ToolbarButton({
  onClick,
  active,
  children,
  ...props
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  'aria-label': string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors',
        active ? 'bg-neon text-white' : 'text-gray-100 hover:bg-bg-tertiary',
      )}
      {...props}
    >
      {children}
    </button>
  )
}
