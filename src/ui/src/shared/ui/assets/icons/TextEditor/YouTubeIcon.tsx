import { Ref, SVGProps, forwardRef, memo } from 'react'

const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    height={24}
    ref={ref}
    viewBox={'0 0 24 24'}
    width={24}
    xmlns={'http://www.w3.org/2000/svg'}
    {...props}
  >
    <path
      d={
        'M12 4s-6.254 0-7.814.418a2.503 2.503 0 0 0-1.768 1.768C2 7.746 2 12 2 12s0 4.254.418 5.814c.23.861.908 1.538 1.768 1.768C5.746 20 12 20 12 20s6.254 0 7.814-.418a2.505 2.505 0 0 0 1.768-1.768C22 16.254 22 12 22 12s0-4.254-.418-5.814a2.505 2.505 0 0 0-1.768-1.768C18.254 4 12 4 12 4zm0 2c2.882 0 6.49.134 7.297.35a.508.508 0 0 1 .353.353c.241.898.35 3.639.35 5.297s-.109 4.398-.35 5.297a.508.508 0 0 1-.353.353c-.805.216-4.415.35-7.297.35-2.881 0-6.49-.134-7.297-.35a.508.508 0 0 1-.353-.353C4.109 16.399 4 13.658 4 12s.109-4.399.35-5.299a.505.505 0 0 1 .353-.351C5.508 6.134 9.118 6 12 6zm-2 2.535v6.93L16 12l-6-3.465z'
      }
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)

export const YouTubeIcon = memo(ForwardRef)
