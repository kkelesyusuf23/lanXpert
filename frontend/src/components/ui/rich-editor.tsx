"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Quote,
} from 'lucide-react'
import { Button } from "@/components/ui/button" // Use Button instead of Toggle

const Editor = ({ content, onChange, editable = true }: { content: string, onChange?: (html: string) => void, editable?: boolean }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: content,
        editable: editable,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[200px] w-full bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 overflow-y-auto',
            },
        },
    })

    // Sync content updates from parent
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    if (!editor) {
        return null
    }

    if (!editable) {
        return <EditorContent editor={editor} className='w-full' />
    }

    const toggleButton = (isActive: boolean, onClick: () => void, icon: React.ReactNode) => (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={`h-8 w-8 p-0 ${isActive ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}
        >
            {icon}
        </Button>
    )

    return (
        <div className="border border-white/10 rounded-md bg-white/5 overflow-hidden">
            <div className="flex flex-wrap gap-1 p-1 border-b border-white/10 bg-black/20">
                {toggleButton(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <Bold className="h-4 w-4" />)}
                {toggleButton(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), <Italic className="h-4 w-4" />)}
                {toggleButton(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), <UnderlineIcon className="h-4 w-4" />)}

                <div className="w-px h-6 bg-white/10 mx-1 self-center" />

                {toggleButton(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), <List className="h-4 w-4" />)}
                {toggleButton(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered className="h-4 w-4" />)}
                {toggleButton(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), <Quote className="h-4 w-4" />)}
            </div>
            <EditorContent editor={editor} />
        </div>
    )
}

export default Editor
