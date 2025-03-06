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
        'M21.938 5.07a4.5 4.5 0 0 0-6.375 0l1.065 1.065a3.007 3.007 0 1 1 4.252 4.252l-6 6a3.004 3.004 0 0 1-4.253-4.245l1.058-1.064-1.058-1.066-1.065 1.066a4.5 4.5 0 0 0 0 6.375 4.5 4.5 0 0 0 3.188 1.297 4.5 4.5 0 0 0 3.203-1.32l6-6a4.5 4.5 0 0 0-.015-6.36Z'
      }
      fill={'currentColor'}
    />
    <path
      d={
        'M3.143 18.615a3 3 0 0 1 0-4.252l6-6a3 3 0 0 1 4.252 0 2.954 2.954 0 0 1 .855 2.137 3 3 0 0 1-.877 2.137l-1.59 1.613 1.065 1.065 1.59-1.59a4.513 4.513 0 1 0-6.383-6.382l-6 6a4.5 4.5 0 0 0 0 6.382A4.5 4.5 0 0 0 5.25 21a4.553 4.553 0 0 0 3.21-1.32l-1.065-1.065a2.999 2.999 0 0 1-4.252 0Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)

export const TextLinkIcon = memo(ForwardRef)
