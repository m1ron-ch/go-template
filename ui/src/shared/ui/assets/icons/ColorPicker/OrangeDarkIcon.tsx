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
    <rect fill={'#E67700'} height={24} rx={4} width={24} />
    <rect
      height={23}
      opacity={0.7}
      rx={3.5}
      stroke={'#E67700'}
      style={{
        mixBlendMode: 'multiply',
      }}
      width={23}
      x={0.5}
      y={0.5}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)

export default Memo
