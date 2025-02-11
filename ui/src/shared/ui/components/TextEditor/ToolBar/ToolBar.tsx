import { useCallback } from 'react'

import { Level } from '@tiptap/extension-heading'
import { Editor } from '@tiptap/react'
import clsx from 'clsx'

import s from './ToolBar.module.scss'

import {
  BoldTextIcon,
  ClearTextIcon,
  HorizontalLineIcon,
  ItalicTextIcon,
  OrderedListIcon,
  QuotesTextIcon,
  RedoIcon,
  TextLinkIcon,
  ThrowTextIcon,
  UnOrderedListIcon,
  UnderlineTextIcon,
  UndoIcon,
  UploadImageIcon,
  YouTubeIcon,
} from '../../../assets'
import { SelectItem, TextEditorSelect } from '../../Select'
import { TextEditorButton } from '../TextEditorButton'
import {
  colorOptions,
  compositeHeadingOptions,
  compositeTextAlignOptions,
  getColorValue,
  getHeadingValue,
  getTextAlignValue,
  headingOptions,
  textAlignOptions,
} from '../lib'

type Props = {
  editor: Editor
}

export const ToolBar = ({ editor }: Props) => {
  const setLinkHandler = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()

      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImageHandler = useCallback(() => {
    const url = window.prompt('Введите адрес изображения')
    const title = window.prompt('Введите описание изображения')
    const alt = window.prompt('Введите альтернативный текст изображения')

    if (url) {
      editor
        .chain()
        .focus()
        .setImage({ alt: alt || '', src: url, title: title || '' })
        .run()
    }
  }, [editor])

  const addYoutubeVideo = useCallback(() => {
    const url = prompt('Enter YouTube URL')

    if (url) {
      editor.commands.setYoutubeVideo({
        height: 180,
        src: url,
        width: 320,
      })
    } else {
      return
    }
  }, [editor])

  const onHeadingChangeHandler = (value: string) => {
    const level = Number(value) as Level & 0

    if (level === 0) {
      editor.chain().focus().setParagraph().run()
    } else {
      editor.chain().focus().toggleHeading({ level: level }).run()
    }
  }

  const onTextAlignChangeHandler = (value: string) => {
    editor.chain().focus().setTextAlign(value).run()
  }

  const onColorChangeHandler = (value: string) => {
    editor.chain().focus().setColor(value).run()
  }

  if (!editor) {
    return null
  }

  return (
    <div className={s.root}>
      <TextEditorButton
        description={'Отменить'}
        disabled={!editor.can().chain().focus().undo().run()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <UndoIcon />
      </TextEditorButton>
      <TextEditorButton
        description={'Восстановить'}
        disabled={!editor.can().chain().focus().redo().run()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <RedoIcon />
      </TextEditorButton>
      <TextEditorSelect
        className={s.headingSelect}
        description={'Тип текста'}
        onValueChange={onHeadingChangeHandler}
        options={headingOptions}
        value={getHeadingValue(editor)}
      >
        {compositeHeadingOptions.map(option => (
          <SelectItem className={s.selectItem} key={option.value} value={option.value}>
            {option.title}
          </SelectItem>
        ))}
      </TextEditorSelect>
      <TextEditorSelect
        className={s.textAlignSelect}
        description={'Выравнивание текста'}
        onValueChange={onTextAlignChangeHandler}
        options={textAlignOptions}
        value={getTextAlignValue(editor)}
      >
        {compositeTextAlignOptions.map(option => (
          <SelectItem className={s.selectItem} key={option.value} value={option.value}>
            {option.title}
          </SelectItem>
        ))}
      </TextEditorSelect>
      <TextEditorSelect
        className={s.colorHeading}
        description={'Цвет текста'}
        isColorPicker
        onValueChange={onColorChangeHandler}
        options={colorOptions}
        value={getColorValue(editor)}
      >
        {colorOptions.map(option => (
          <SelectItem className={s.colorItem} key={option.value} value={option.value}>
            {option.title}
          </SelectItem>
        ))}
      </TextEditorSelect>
      <TextEditorButton
        className={clsx(editor.isActive('bold') && s.active)}
        description={'Жирный шрифт'}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <BoldTextIcon />
      </TextEditorButton>
      <TextEditorButton
        className={clsx(editor.isActive('italic') && s.active)}
        description={'Курсивный шрифт'}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <ItalicTextIcon />
      </TextEditorButton>
      <TextEditorButton
        className={clsx(editor.isActive('underline') && s.active)}
        description={'Подчеркивание'}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineTextIcon />
      </TextEditorButton>
      <TextEditorButton
        className={clsx(editor.isActive('strike') && s.active)}
        description={'Зачеркнутый шрифт'}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <ThrowTextIcon />
      </TextEditorButton>
      <TextEditorButton
        description={'Очистить'}
        onClick={() => editor.chain().focus().deleteSelection().run()}
      >
        <ClearTextIcon />
      </TextEditorButton>
      <TextEditorButton
        className={clsx(editor.isActive('orderedList') && s.active)}
        description={'Нумерованный список'}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <OrderedListIcon />
      </TextEditorButton>
      <TextEditorButton
        className={clsx(editor.isActive('bulletList') && s.active)}
        description={'Список'}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <UnOrderedListIcon />
      </TextEditorButton>
      <TextEditorButton
        className={clsx(editor.isActive('link') && s.active)}
        description={'Ссылка'}
        onClick={setLinkHandler}
      >
        <TextLinkIcon />
      </TextEditorButton>
      <TextEditorButton description={'Загрузить Изображение'} onClick={addImageHandler}>
        <UploadImageIcon />
      </TextEditorButton>
      <TextEditorButton description={'Загрузить видео'} onClick={addYoutubeVideo}>
        <YouTubeIcon />
      </TextEditorButton>
      <TextEditorButton
        className={clsx(editor.isActive('blockquote') && s.active)}
        description={'Цитата'}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <QuotesTextIcon />
      </TextEditorButton>
      <TextEditorButton
        description={'Горизонтальная линия'}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <HorizontalLineIcon />
      </TextEditorButton>
    </div>
  )
}
