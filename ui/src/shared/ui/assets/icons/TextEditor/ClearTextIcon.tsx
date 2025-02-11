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
        'm22.078 12.429-5.988-5.99a1.5 1.5 0 0 0-2.122 0L9.95 10.459 6.75 1.5h-1.5L1.5 12H3l.75-2.25h4.5l.601 1.806-5.412 5.412a1.5 1.5 0 0 0 0 2.122l3.41 3.41h7.192l8.037-8.038a1.439 1.439 0 0 0 0-2.034v.001ZM4.248 8.25 5.998 3l1.752 5.25h-3.5ZM13.422 21H7.47L4.5 18.029l4.734-4.734 5.946 5.946L13.421 21Zm2.82-2.82-5.946-5.945L15.03 7.5l5.945 5.945-4.733 4.735Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)

export const ClearTextIcon = memo(ForwardRef)
