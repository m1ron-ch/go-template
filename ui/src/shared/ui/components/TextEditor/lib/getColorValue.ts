import { Editor } from '@tiptap/react'

import { COLORS } from './colors'

export const getColorValue = (editor: Editor) => {
  switch (true) {
    case editor.isActive('textStyle', { color: COLORS.VIOLET_LIGHT }):
      return COLORS.VIOLET_LIGHT
    case editor.isActive('textStyle', { color: COLORS.BLUE_LIGHT }):
      return COLORS.BLUE_LIGHT
    case editor.isActive('textStyle', { color: COLORS.TURQUOISE_LIGHT }):
      return COLORS.TURQUOISE_LIGHT
    case editor.isActive('textStyle', { color: COLORS.GREEN_LIGHT }):
      return COLORS.GREEN_LIGHT
    case editor.isActive('textStyle', { color: COLORS.ORANGE_LIGHT }):
      return COLORS.ORANGE_LIGHT
    case editor.isActive('textStyle', { color: COLORS.RED_LIGHT }):
      return COLORS.RED_LIGHT
    case editor.isActive('textStyle', { color: COLORS.CORAL_LIGHT }):
      return COLORS.CORAL_LIGHT
    case editor.isActive('textStyle', { color: COLORS.GREY }):
      return COLORS.GREY
    case editor.isActive('textStyle', { color: COLORS.VIOLET_DARK }):
      return COLORS.VIOLET_DARK
    case editor.isActive('textStyle', { color: COLORS.BLUE_DARK }):
      return COLORS.BLUE_DARK
    case editor.isActive('textStyle', { color: COLORS.TURQUOISE_DARK }):
      return COLORS.TURQUOISE_DARK
    case editor.isActive('textStyle', { color: COLORS.GREEN_DARK }):
      return COLORS.GREEN_DARK
    case editor.isActive('textStyle', { color: COLORS.ORANGE_DARK }):
      return COLORS.ORANGE_DARK
    case editor.isActive('textStyle', { color: COLORS.RED_DARK }):
      return COLORS.RED_DARK
    case editor.isActive('textStyle', { color: COLORS.CORAL_DARK }):
      return COLORS.CORAL_DARK
    default:
      return COLORS.DARK
  }
}
