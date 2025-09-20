"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Define jsPDF type to avoid TypeScript errors
declare const jsPDF: any

export function ReportGenerator({ calculations = [] }: { calculations: any[] }) {
  const [reportType, setReportType] = useState("pdf")

  const generatePDF = async () => {
    try {
      // Dynamically import jsPDF to avoid SSR issues
      const { jsPDF } = await import("jspdf")
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF()
      doc.text("Dosage Calculations Report", 20, 10)

      // Use autoTable method
      ;(doc as any).autoTable({
        head: [["Date", "Medication", "Dose", "Frequency"]],
        body: calculations.map((calc) => [calc.date, calc.medication, calc.dose, calc.frequency]),
      })

      doc.save("dosage-calculations-report.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF report")
    }
  }

  const generateCSV = () => {
    try {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        "Date,Medication,Dose,Frequency\n" +
        calculations.map((calc) => `${calc.date},${calc.medication},${calc.dose},${calc.frequency}`).join("\n")

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", "dosage-calculations-report.csv")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error generating CSV:", error)
      alert("Error generating CSV report")
    }
  }

  const chartData = calculations.map((calc) => ({
    name: calc.medication?.substring(0, 10) + "..." || "Unknown",
    dose: Number.parseFloat(calc.dose) || 0,
  }))

  return (
    <Card className="w-full dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center dark:text-white">Report Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select onValueChange={setReportType} defaultValue="pdf">
            <SelectTrigger className="dark:bg-gray-700 dark:text-white">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={reportType === "pdf" ? generatePDF : generateCSV}>
            Generate {reportType.toUpperCase()} Report
          </Button>
        </div>
        {calculations.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Dosage Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="dose" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
