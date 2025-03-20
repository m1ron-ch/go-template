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
        'M9 7.5h9.139l-2.69-2.69L16.5 3.75l4.5 4.5-4.5 4.5-1.052-1.061L18.137 9H9a4.5 4.5 0 0 0 0 9h6v1.5H9a6 6 0 1 1 0-12Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)

export const RedoIcon = memo(ForwardRef)
