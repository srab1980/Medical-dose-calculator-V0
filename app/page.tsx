"use client"

import { useEffect } from "react"
import { PediatricDoseCalculator } from "../components/PediatricDoseCalculator"

export default function Home() {
  useEffect(() => {
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

  return (
    <main className="min-h-screen bg-background dark:bg-gray-900">
      <PediatricDoseCalculator />
    </main>
  )
}
