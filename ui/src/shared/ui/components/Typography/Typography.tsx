import { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

import s from './Typography.module.scss'

export type TypographyType<T extends ElementType = 'span'> = {
  as?: T
  children?: ReactNode
  className?: string
  variant?: VariantType
} & ComponentPropsWithoutRef<T>

export const Typography = <T extends ElementType = 'span'>(
  props: TypographyType<T> & Omit<ComponentPropsWithoutRef<T>, keyof TypographyType<T>>
) => {
  const { as: Component = 'span', className, text, variant = 'bodyRegular1', ...rest } = props

  return <Component className={`${s[variant]} ${className}`} {...rest} />
}

type VariantType =
  | 'bodyBold2'
  | 'bodyRegular1'
  | 'bodyRegular2'
  | 'caption'
  | 'captionLink'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'largeText'
  | 'mediumText'
  | 'overline'
  | 'subtitle1'
  | 'subtitle2'
  | 'subtitleLink1'
  | 'subtitleLink2'
