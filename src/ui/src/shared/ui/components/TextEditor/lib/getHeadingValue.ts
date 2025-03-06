import { Editor } from '@tiptap/react'

export const getHeadingValue = (editor: Editor): '0' | '1' | '2' | '3' => {
  if (editor.isActive('heading', { level: 1 })) {
    return '1'
  } else if (editor.isActive('heading', { level: 2 })) {
    return '2'
  } else if (editor.isActive('heading', { level: 3 })) {
    return '3'
  }

  return '0'
}
