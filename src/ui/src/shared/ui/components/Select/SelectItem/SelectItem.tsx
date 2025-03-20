import { ComponentPropsWithoutRef, ElementRef, JSX, forwardRef } from 'react'

import * as RadixSelect from '@radix-ui/react-select'
import clsx from 'clsx'

import s from './SelectItem.module.scss'

type SelectItemProps = {
  className?: string
} & ComponentPropsWithoutRef<typeof RadixSelect.Item>

export const SelectItem = forwardRef<ElementRef<typeof RadixSelect.Item>, SelectItemProps>(
  ({ children, className, ...restProps }, ref): JSX.Element => {
    return (
      <RadixSelect.Item className={clsx(s.selectItem, className)} ref={ref} {...restProps}>
        <RadixSelect.ItemText asChild>
          <span className={s.text}>{children}</span>
        </RadixSelect.ItemText>
      </RadixSelect.Item>
    )
  }
)
