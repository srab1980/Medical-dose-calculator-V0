"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Simple QR scanner placeholder since react-qr-reader has compatibility issues
export function BarcodeScanner({ onScan }: { onScan: (data: string) => void }) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartScan = async () => {
    try {
      setScanning(true)
      setError(null)

      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported in this browser")
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      // For now, we'll simulate a scan result after 3 seconds
      setTimeout(() => {
        const mockBarcode = `MOCK_BARCODE_${Date.now()}`
        onScan(mockBarcode)
        setScanning(false)

        // Stop the camera stream
        stream.getTracks().forEach((track) => track.stop())
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to access camera")
      setScanning(false)
    }
  }

  const handleStopScan = () => {
    setScanning(false)
    setError(null)
  }

  return (
    <Card className="w-full dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center dark:text-white">Barcode Scanner</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

          {scanning ? (
            <div className="text-center">
              <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">Camera is active... Point at a barcode</p>
                <div className="mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              </div>
              <Button onClick={handleStopScan} className="mt-4 bg-transparent" variant="outline">
                Stop Scanning
              </Button>
            </div>
          ) : (
            <Button onClick={handleStartScan} className="w-full">
              Start Scanning
            </Button>
          )}

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Note: This is a demo scanner. In production, integrate with a proper barcode scanning library.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
