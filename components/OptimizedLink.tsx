'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode, MouseEvent } from 'react'

interface OptimizedLinkProps {
  href: string
  children: ReactNode
  className?: string
  prefetch?: boolean
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  [key: string]: any
}

/**
 * Optimized Link component with prefetching and smooth navigation
 */
export default function OptimizedLink({ 
  href, 
  children, 
  className,
  prefetch = true,
  onClick,
  ...props 
}: OptimizedLinkProps) {
  const router = useRouter()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Custom onClick handler varsa çalıştır
    if (onClick) {
      onClick(e)
    }

    // Eğer preventDefault çağrılmadıysa, smooth navigation yap
    if (!e.defaultPrevented) {
      // Prefetch yap (eğer aktifse)
      if (prefetch) {
        router.prefetch(href)
      }
    }
  }

  return (
    <Link
      href={href}
      className={className}
      prefetch={prefetch}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  )
}

