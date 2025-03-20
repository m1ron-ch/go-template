import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import EditorJS from '@editorjs/editorjs'
import edjsHTML from 'editorjs-html'
import styles from './Editor.module.scss'
import QuillParagraph from './MyTools/QuillParagraph'

interface EditorProps {
  initialContent: any;
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

  useEffect(() => {
    const createEditor = () => {
      editorInstance.current = new EditorJS({
        holder: editorContainer.current || '',
        data: initialContent,
        placeholder: 'Начните писать...',
        autofocus: true,
        tools: {
          p: QuillParagraph,
        },
        onReady: () => {
          if (!initialContent?.blocks?.length) {
            editorInstance.current?.blocks.insert('p', { text: '' });
          }
        },
      })
    }

    if (editorContainer.current) {
      if (editorInstance.current) {
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

  useImperativeHandle(ref, () => ({
    save: async () => {
      if (!editorInstance.current) return null
      setIsLoading(true)
      try {
        const savedData = await editorInstance.current.save()
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
