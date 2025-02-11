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
        'M9 11.25H4.582A6.75 6.75 0 0 1 7.5 6.645l1.342-.9L8.018 4.5l-1.342.9A8.25 8.25 0 0 0 3 12.262v4.988a1.5 1.5 0 0 0 1.5 1.5H9a1.5 1.5 0 0 0 1.5-1.5v-4.5a1.5 1.5 0 0 0-1.5-1.5Zm10.5 0h-4.418A6.75 6.75 0 0 1 18 6.645l1.343-.9-.818-1.245-1.35.9a8.25 8.25 0 0 0-3.675 6.862v4.988a1.5 1.5 0 0 0 1.5 1.5h4.5a1.5 1.5 0 0 0 1.5-1.5v-4.5a1.5 1.5 0 0 0-1.5-1.5Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)

export const QuotesTextIcon = memo(ForwardRef)
