import { ComponentPropsWithoutRef, ElementRef, JSX, ReactNode, forwardRef } from 'react'

import * as RadixSelect from '@radix-ui/react-select'
import clsx from 'clsx'

import s from './Select.module.scss'

import { FilledArrowDown } from '../../../assets'
import { Typography } from '../../Typography'

export type OptionType = { title: ReactNode; value: string }

export type SelectProps = {
  children: ReactNode
  className?: string
  error?: string
  fullWidth?: boolean
  label?: string
  options: OptionType[]
  placeholder?: ReactNode
  triggerIcon?: ReactNode
} & ComponentPropsWithoutRef<typeof RadixSelect.Root>

export const Select = forwardRef<ElementRef<typeof RadixSelect.Root>, SelectProps>(
  (
    { children, className, error, fullWidth, label, placeholder, triggerIcon, ...restProps },
    ref
  ): JSX.Element => {
    const classNames = {
      content: clsx(s.content),
      error: s.error,
      icon: s.icon,
      label: clsx(s.label, error && s.errorLabel),
      trigger: clsx(s.trigger, fullWidth && s.fullWidthTrigger, error && s.errorTrigger),
      triggerWrapper: clsx(
        s.triggerWrapper,
        fullWidth && s.fullWidth,
        restProps.disabled && s.disabled,
        className
      ),
    }

    return (
      <>
        <RadixSelect.Root {...restProps}>
          <div className={classNames.triggerWrapper} tabIndex={1}>
            {error && <span className={classNames.error}>{error}</span>}
            <RadixSelect.Trigger aria-label={'Select'} className={classNames.trigger} ref={ref}>
              <Typography variant={'bodyRegular1'}>
                <RadixSelect.Value placeholder={placeholder} />
              </Typography>
              <RadixSelect.Icon className={classNames.icon}>
                {triggerIcon ? triggerIcon : <FilledArrowDown />}
              </RadixSelect.Icon>
            </RadixSelect.Trigger>
            {label && (
              <Typography as={'label'} className={classNames.label} variant={'caption'}>
                {label}
              </Typography>
            )}
          </div>

          <RadixSelect.Portal>
            <RadixSelect.Content className={classNames.content} position={'popper'}>
              <RadixSelect.Viewport>{children}</RadixSelect.Viewport>
            </RadixSelect.Content>
          </RadixSelect.Portal>
        </RadixSelect.Root>
      </>
    )
  }
)
