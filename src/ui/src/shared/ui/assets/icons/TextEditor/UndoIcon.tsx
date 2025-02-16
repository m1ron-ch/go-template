import { Ref, SVGProps, forwardRef, memo } from 'react'

const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    fill={'none'}
    height={24}
    ref={ref}
    width={24}
    xmlns={'http://www.w3.org/2000/svg'}
    {...props}
  >
    <path
      d={
        'M15 7.5H5.861l2.69-2.69L7.5 3.75 3 8.25l4.5 4.5 1.052-1.061L5.864 9H15a4.5 4.5 0 1 1 0 9H9v1.5h6a6 6 0 1 0 0-12Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)

export const UndoIcon = memo(ForwardRef)
