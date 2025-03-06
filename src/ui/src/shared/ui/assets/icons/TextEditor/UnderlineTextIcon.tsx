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
        'M3 19.5h18V21H3v-1.5Zm9-2.25A5.25 5.25 0 0 1 6.75 12V3.75h1.5V12a3.75 3.75 0 0 0 7.5 0V3.75h1.5V12A5.25 5.25 0 0 1 12 17.25Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)

export const UnderlineTextIcon = memo(ForwardRef)
