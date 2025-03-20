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
        'M9 4.5h10.5V6H9V4.5ZM9 9h7.5v1.5H9V9Zm0 4.5h10.5V15H9v-1.5ZM9 18h7.5v1.5H9V18ZM4.5 3H6v18H4.5V3Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)

export const AlignLeftIcon = memo(ForwardRef)
