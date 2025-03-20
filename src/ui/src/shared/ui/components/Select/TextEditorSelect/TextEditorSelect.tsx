import { ComponentPropsWithoutRef, ElementRef, JSX, ReactNode, forwardRef } from 'react'

import * as RadixSelect from '@radix-ui/react-select'
import clsx from 'clsx'

import s from './TextEditorSelect.module.scss'

import { FilledArrowDown } from '../../../assets'
// import { Tooltip } from '../../ToolTip'
import { Typography } from '../../Typography'
import { OptionType } from '../Select'

export type SelectProps = {
  children: ReactNode
  className?: string
  description: string
  isColorPicker?: boolean
  options: OptionType[]
  placeholder?: ReactNode
  triggerIcon?: ReactNode
} & ComponentPropsWithoutRef<typeof RadixSelect.Root>

export const TextEditorSelect = forwardRef<ElementRef<typeof RadixSelect.Root>, SelectProps>(
  (
    {
      children,
      className,
      description,
      isColorPicker,
      options,
      placeholder,
      triggerIcon,
      ...restProps
    },
    ref
  ): JSX.Element => {
    const classNames = {
      colorPicker: clsx(isColorPicker && s.colorPicker),
      content: clsx(s.content, isColorPicker && s.colorPickerContent),
      icon: s.icon,
      trigger: clsx(s.trigger, className),
      triggerWrapper: clsx(s.triggerWrapper, restProps.disabled && s.disabled),
    }

    const selectedValue = options.find(item => item.value === restProps.value)?.title

    return (
      <>
        <RadixSelect.Root {...restProps}>
          {/* <Tooltip description={description}> */}
          <div className={classNames.triggerWrapper} tabIndex={1}>
            <RadixSelect.Trigger aria-label={'Select'} className={classNames.trigger} ref={ref}>
              <Typography className={s.textValue} variant={'bodyRegular2'}>
                <RadixSelect.Value placeholder={placeholder}>
                  {selectedValue || placeholder}
                </RadixSelect.Value>
              </Typography>
              <RadixSelect.Icon className={classNames.icon}>
                {triggerIcon ? triggerIcon : <FilledArrowDown />}
              </RadixSelect.Icon>
            </RadixSelect.Trigger>
          </div>
          {/* </Tooltip> */}

          <RadixSelect.Portal>
            <RadixSelect.Content className={classNames.content} position={'popper'}>
              <RadixSelect.Viewport className={classNames.colorPicker}>
                {children}
              </RadixSelect.Viewport>
            </RadixSelect.Content>
          </RadixSelect.Portal>
        </RadixSelect.Root>
      </>
    )
  }
)
