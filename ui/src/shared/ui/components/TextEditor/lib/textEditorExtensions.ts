import { Color } from '@tiptap/extension-color'
import { Image as EditorImage } from '@tiptap/extension-image'
import { Link as EditorLink } from '@tiptap/extension-link'
import { ListItem } from '@tiptap/extension-list-item'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Underline } from '@tiptap/extension-underline'
import { Youtube } from '@tiptap/extension-youtube'
import { StarterKit as EditorStarterKit } from '@tiptap/starter-kit'

export const textEditorExtensions = [
  EditorStarterKit.configure({
    bulletList: {
      keepAttributes: false,
      keepMarks: true,
    },
    orderedList: {
      keepAttributes: false,
      keepMarks: true,
    },
  }),
  TextAlign.configure({
    alignments: ['left', 'center', 'right'],
    types: ['heading', 'paragraph'],
  }),
  TextStyle,
  Color.configure({
    types: [TextStyle.name, ListItem.name],
  }),
  Underline,
  EditorLink.configure({
    autolink: true,
    openOnClick: true,
  }),
  EditorImage.configure({
    allowBase64: true,
    inline: false,
  }),
  Youtube.configure({
    inline: false,
    nocookie: true,
  }),
]
