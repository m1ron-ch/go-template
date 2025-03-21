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
        'M14.25 10.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm0-3a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z'
      }
      fill={'currentColor'}
    />
    <path
      d={
        'M19.5 3h-15A1.5 1.5 0 0 0 3 4.5v15A1.5 1.5 0 0 0 4.5 21h15a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 19.5 3Zm0 16.5h-15V15l3.75-3.75 4.193 4.193a1.5 1.5 0 0 0 2.114 0l1.193-1.193L19.5 18v1.5Zm0-3.623-2.692-2.692a1.5 1.5 0 0 0-2.115 0L13.5 14.377l-4.193-4.192a1.5 1.5 0 0 0-2.115 0L4.5 12.877V4.5h15v11.377Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)

export const UploadImageIcon = memo(ForwardRef)
