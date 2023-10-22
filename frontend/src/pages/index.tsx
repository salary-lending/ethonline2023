import Layout from '@/components/layout/Layout'
import { useRouter } from 'next/navigation'
import { disconnect } from 'process'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()


  return router.push("/mint")
}
