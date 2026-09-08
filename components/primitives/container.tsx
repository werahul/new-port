import { cn } from '@/lib/utils'

type ContainerSize = 'default' | 'narrow' | 'wide' | 'flush'

const sizeMap: Record<ContainerSize, string> = {
  default: 'max-w-content',
  narrow: 'max-w-3xl',
  wide: 'max-w-[1440px]',
  flush: 'max-w-none',
}

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize
  as?: keyof JSX.IntrinsicElements
}

/**
 * Consistent page gutter + max-width. Every section funnels its content
 * through this so horizontal rhythm is identical everywhere.
 */
export function Container({
  size = 'default',
  as: Tag = 'div',
  className,
  children,
  ...props
}: ContainerProps) {
  const Component = Tag as React.ElementType
  return (
    <Component
      className={cn(
        'mx-auto w-full px-5 sm:px-8 lg:px-12',
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
