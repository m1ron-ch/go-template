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
        'M13.688 18.75H6.75V5.25h6.375a3.938 3.938 0 0 1 3 6.488 3.938 3.938 0 0 1-2.438 7.012ZM9 16.5h4.672a1.686 1.686 0 0 0 1.194-2.88 1.688 1.688 0 0 0-1.194-.495H9V16.5Zm0-5.625h4.125a1.686 1.686 0 0 0 1.193-2.88 1.688 1.688 0 0 0-1.193-.495H9v3.375Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)

export const BoldTextIcon = memo(ForwardRef)
