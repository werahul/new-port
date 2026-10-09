import { cn } from '@/lib/utils'

type ContainerSize = 'default' | 'narrow' | 'wide'

const sizeMap: Record<ContainerSize, string> = {
  default: 'max-w-content',
  narrow: 'max-w-4xl',
  wide: 'max-w-[1600px]',
}

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize
  as?: keyof JSX.IntrinsicElements
}

/** Page gutter + max width. 16px gutter on phones, wider from there. */
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
      className={cn('mx-auto w-full px-4 sm:px-8 lg:px-10', sizeMap[size], className)}
      {...props}
    >
      {children}
    </Component>
  )
}
