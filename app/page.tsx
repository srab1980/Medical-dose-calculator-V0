"use client"

import { useEffect, useState } from "react"
import { PediatricDoseCalculator } from "../components/PediatricDoseCalculator"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration)
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError)
        })
    }
  }, [])

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-background dark:bg-gray-900">
      <PediatricDoseCalculator key="v2.1-flashcard-update" />
    </main>
  )
}
