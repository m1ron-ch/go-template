import { useEffect, useId } from 'react'

import { EditorContent, useEditor } from '@tiptap/react'
import clsx from 'clsx'

import s from './TextEditor.module.scss'

import { ToolBar } from './ToolBar'
import { textEditorExtensions } from './lib'

export type TextEditorProps = {
  className?: string
  onChangeContent: (value: string) => void
  value: string
}

export const TextEditor = ({ className, onChangeContent, value }: TextEditorProps) => {
  const editorId = useId()
  const editor = useEditor({
    content: value,
    extensions: textEditorExtensions,
    onUpdate: ({ editor }) => {
      onChangeContent(editor.getHTML())
    },
  })

  useEffect(() => {
    const editorBody = document.getElementById(editorId)

    editorBody?.addEventListener('paste', (e: Event) => e.stopPropagation())
    if (editor?.isEmpty) {
      editor.commands.setContent(value)
    }

    return () => {
      editorBody?.removeEventListener('paste', (e: Event) => e.stopPropagation())
    }
  }, [value, editor])

  if (!editor) {
    return null
  }

  return (
    <div className={clsx(s.editor, className)} id={editorId}>
      <ToolBar editor={editor} />
      <EditorContent className={s.editorContent} editor={editor} />
    </div>
  )
}
