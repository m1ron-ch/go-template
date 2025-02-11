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
      d={'M4.5 4.5h15V6h-15V4.5Zm0 4.5h15v1.5h-15V9Zm0 4.5h15V15h-15v-1.5Zm0 4.5h15v1.5h-15V18Z'}
      fill={'#212121'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)

export default Memo
