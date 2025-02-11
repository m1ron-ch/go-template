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
        'M23.25 12 18 17.25l-1.058-1.058L21.128 12l-4.186-4.192L18 6.75 23.25 12ZM.75 12 6 6.75l1.058 1.058L2.872 12l4.186 4.192L6 17.25.75 12Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)

export const CodeTextIcon = memo(ForwardRef)
