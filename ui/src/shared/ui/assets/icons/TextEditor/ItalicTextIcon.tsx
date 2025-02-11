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
      d={'M18.75 6.75v-1.5H9v1.5h3.855l-3.277 10.5H5.25v1.5H15v-1.5h-3.855l3.277-10.5h4.328Z'}
      fill={'currentColor'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)

export const ItalicTextIcon = memo(ForwardRef)
