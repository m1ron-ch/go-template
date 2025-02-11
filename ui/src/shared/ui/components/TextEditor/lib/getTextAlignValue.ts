import { Editor } from '@tiptap/react'

export const getTextAlignValue = (editor: Editor) => {
  if (editor.isActive({ textAlign: 'center' })) {
    return 'center'
  } else if (editor.isActive({ textAlign: 'right' })) {
    return 'right'
  } else if (editor.isActive({ textAlign: 'justify' })) {
    return 'justify'
  }

  return 'left'
}
