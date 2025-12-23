'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PaymentsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/payment-approval')
  }, [router])

  return null
}
