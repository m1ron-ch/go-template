import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import EditorJS, { BlockToolConstructable } from '@editorjs/editorjs'

import Header from 'editorjs-header-with-alignment'
import List from '@editorjs/list'
import Paragraph from 'editorjs-paragraph-with-alignment'
import Table from '@editorjs/table'
import Checklist from '@editorjs/checklist'
import Quote from '@editorjs/quote'
import Delimiter from '@editorjs/delimiter'
import Warning from '@editorjs/warning'
import LinkTool from '@editorjs/link'
import ImageTool from '@editorjs/image'
import Raw from '@editorjs/raw'
import Embed from '@editorjs/embed'
import Marker from '@editorjs/marker'
import InlineCode from '@editorjs/inline-code'
import Attaches from '@editorjs/attaches'

import edjsHTML from 'editorjs-html'
import styles from './Editor.module.scss'
import { AppSettings } from '@/shared'
import QuillParagraph from './MyTools/QuillParagraph'

interface EditorProps {
  initialContent: any;  // EditorJS.OutputData (упрощаем)
}

export interface EditorHandle {
  save: () => Promise<{ html: string; json: any } | null>
  render: (data: any) => Promise<void>
}

export const Editor = forwardRef<EditorHandle, EditorProps>((props, ref) => {
  const { initialContent } = props
  const editorContainer = useRef<HTMLDivElement | null>(null)
  const editorInstance = useRef<EditorJS | null>(null)
  const [_, setIsLoading] = useState(false)

  // Инициализируем EditorJS
  useEffect(() => {
    const createEditor = () => {
      editorInstance.current = new EditorJS({
        holder: editorContainer.current || '',
        data: initialContent,
        placeholder: 'Начните писать...',
        autofocus: true,
        tools: {
          p: QuillParagraph,
          header: {
            class: Header as unknown as BlockToolConstructable,
            config: {
              placeholder: 'Header',
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 2,
            },
          },
          paragraph: {
            class: Paragraph as unknown as BlockToolConstructable,
            inlineToolbar: true,
          },
          list: { class: List, inlineToolbar: true },
          quote: { class: Quote, inlineToolbar: true },
          marker: { class: Marker, shortcut: 'CMD+SHIFT+M' },
          inlineCode: { class: InlineCode, shortcut: 'CMD+SHIFT+C' },
          table: Table,
          checklist: Checklist,
          delimiter: Delimiter,
          warning: Warning,
          linkTool: LinkTool,
          image: {
            class: ImageTool as BlockToolConstructable,
            config: {
              endpoints: {
                byFile: `${AppSettings.API_URL}media/upload`,
                byUrl: `${AppSettings.API_URL}media/upload-url`,
              },
              field: 'file',
              inlineToolbar: true,
            },
          },
          raw: Raw,
          embed: Embed,
          attaches: {
            class: Attaches as BlockToolConstructable,
            config: {
              endpoint: `${AppSettings.API_URL}uploadFile`,
            },
          },
        },
      })
    }

    if (editorContainer.current) {
      if (editorInstance.current) {
        // Если уже есть, пересоздаём
        editorInstance.current.isReady
          .then(() => {
            editorInstance.current?.destroy()
            editorInstance.current = null
            createEditor()
          })
          .catch(err => console.error('Destroy error:', err))
      } else {
        createEditor()
      }
    }

    return () => {
      if (editorInstance.current) {
        editorInstance.current.isReady
          .then(() => {
            editorInstance.current?.destroy()
            editorInstance.current = null
          })
          .catch(err => console.error('Error destroying EditorJS:', err))
      }
    }
  }, [initialContent])

  // Методы для родителя (save / render)
  useImperativeHandle(ref, () => ({
    save: async () => {
      if (!editorInstance.current) return null
      setIsLoading(true)
      try {
        const savedData = await editorInstance.current.save()
        // Преобразуем в HTML
        const edjsParser = edjsHTML({
          p: (block: { data: any }) => {
            return `<div class="page-text-wrapper">
              ${block.data.text}
            </div>`
          },
        })
        const html = edjsParser.parse(savedData).join('')
        return { html, json: savedData }
      } catch (err) {
        console.error('Saving failed:', err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    render: async (data) => {
      if (editorInstance.current) {
        await editorInstance.current.isReady
        await editorInstance.current.render(data)
      }
    },
  }))

  return <div ref={editorContainer} className={styles.editorContainer} />
})
