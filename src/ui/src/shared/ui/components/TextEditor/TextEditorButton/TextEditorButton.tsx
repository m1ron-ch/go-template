import { ComponentPropsWithoutRef } from 'react'

import clsx from 'clsx'

import s from './TextEditorButton.module.scss'

// import { Tooltip } from '../../ToolTip'

type Props = { description: string } & ComponentPropsWithoutRef<'button'>

export const TextEditorButton = ({ className, description, ...restProps }: Props) => {
  return (
    // <Tooltip description={description}>
    <button className={clsx(s.button, className)} type={'button'} {...restProps} />
    // </Tooltip>
  )
}
