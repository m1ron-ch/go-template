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
        'M12 16.5h10.5V18H12v-1.5ZM12 6h10.5v1.5H12V6ZM6 9V3H4.5v.75H3v1.5h1.5V9H3v1.5h4.5V9H6Zm1.5 12H3v-3a1.5 1.5 0 0 1 1.5-1.5H6V15H3v-1.5h3A1.5 1.5 0 0 1 7.5 15v1.5A1.5 1.5 0 0 1 6 18H4.5v1.5h3V21Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)

export const OrderedListIcon = memo(ForwardRef)
