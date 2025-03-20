import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  ReactElement,
  cloneElement,
  isValidElement,
  useRef,
} from 'react'
import { FieldValues, UseControllerProps, useController } from 'react-hook-form'

type ControlledPhotoUploaderProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<ComponentPropsWithoutRef<'input'>, 'onChange'>

export const ControlledPhotoUploader = <T extends FieldValues>({
  children,
  control,
  name,
}: ControlledPhotoUploaderProps<T>) => {
  const {
    field: { onChange },
  } = useController({ control, name })

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const onClickHandler = () => fileInputRef.current?.click()

  const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0]

      onChange(file)
      e.target.value = ''
    }
  }

  return (
    <div>
      {isValidElement(children)
        ? cloneElement(children as ReactElement, { onClick: onClickHandler })
        : null}
      <input hidden name={name} onChange={onSelectFile} ref={fileInputRef} type={'file'} />
    </div>
  )
}
