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
        'M21 11.25h-7.533c-.333-.09-.668-.173-1.004-.251-2.105-.498-3.296-.863-3.296-2.568a2.15 2.15 0 0 1 .59-1.608 3.592 3.592 0 0 1 2.26-.818c2.122-.052 3.1.668 3.901 1.763l1.211-.885a5.605 5.605 0 0 0-5.122-2.378 5.08 5.08 0 0 0-3.3 1.246 3.62 3.62 0 0 0-1.04 2.68 3.28 3.28 0 0 0 1.3 2.819H3v1.5h10.239c1.475.428 2.357.984 2.38 2.518a2.34 2.34 0 0 1-.647 1.795 4.368 4.368 0 0 1-2.79.937 4.975 4.975 0 0 1-3.859-2.018l-1.15.963A6.394 6.394 0 0 0 12.16 19.5h.075a5.752 5.752 0 0 0 3.786-1.364 3.808 3.808 0 0 0 1.099-2.89 3.714 3.714 0 0 0-.863-2.496H21v-1.5Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)

export const ThrowTextIcon = memo(ForwardRef)
