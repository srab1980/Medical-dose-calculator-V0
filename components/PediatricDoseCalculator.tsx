"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Moon, Sun, Printer, Search, X } from "lucide-react"
import { calculateDose } from "../utils/doseCalculator"
import { medicationData } from "../data/medicationData"
import { fetchDrugInfo, fetchDrugInteractions } from "../utils/openFdaApi"

type SavedCalculation = {
  id: string
  date: string
  medication: string
  dose: string
  doseMl: string
  frequency: string
}

type DrugInfo = {
  drugName: string
  genericName: string
  brandName: string
  adverseEvents: string[]
  indications: string
  warnings: string
  precautions: string
  dosageAdministration: string
  interactions: string
  contraindications: string
  pediatricUse: string
}

export function PediatricDoseCalculator() {
  const [formInputs, setFormInputs] = useState({
    ageYears: "",
    ageMonths: "",
    weightKg: "",
    medication: "",
  })
  const [result, setResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("antibiotics")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null)
  const [drugInteractions, setDrugInteractions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("savedCalculations")
    if (saved) {
      setSavedCalculations(JSON.parse(saved))
    }
    const darkMode = localStorage.getItem("darkMode")
    if (darkMode) {
      setIsDarkMode(JSON.parse(darkMode))
    }
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode))
  }, [isDarkMode])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const updateFormInput = (field: string, value: string) => {
    setFormInputs((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formInputs.ageYears && !formInputs.ageMonths) {
      newErrors.age = "Please enter either years or months"
    }
    if (!formInputs.weightKg) {
      newErrors.weightKg = "Weight is required"
    }
    if (!formInputs.medication) {
      newErrors.medication = "Please select a medication"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const { ageYears, ageMonths, weightKg, medication } = formInputs
      try {
        setIsLoading(true)
        const totalAgeInMonths = (Number.parseInt(ageYears) || 0) * 12 + (Number.parseInt(ageMonths) || 0)
        const calculationResult = calculateDose(medication, Number.parseFloat(weightKg), totalAgeInMonths)
        setResult(calculationResult)

        // Fetch drug information from OpenFDA API with better error handling
        try {
          const drugInfoResult = await fetchDrugInfo(medication)
          setDrugInfo(drugInfoResult)

          // Fetch drug interactions
          const interactionsResult = await fetchDrugInteractions(medication)
          setDrugInteractions(interactionsResult)
        } catch (apiError) {
          console.warn("FDA API unavailable, continuing without drug information:", apiError)
          // Set a fallback message instead of showing an error
          setDrugInfo({
            drugName: medication,
            genericName: "API unavailable",
            brandName: medication,
            adverseEvents: ["FDA database temporarily unavailable"],
            indications: "Please consult prescribing information for detailed drug information.",
            warnings: "Please consult prescribing information for warnings.",
            precautions: "Please consult prescribing information for precautions.",
            dosageAdministration: "Please consult prescribing information for dosage details.",
            interactions: "Please consult prescribing information for drug interactions.",
            contraindications: "Please consult prescribing information for contraindications.",
            pediatricUse: "Please consult prescribing information for pediatric use.",
          })
          setDrugInteractions(["Drug interaction data temporarily unavailable"])
        }
      } catch (error) {
        alert("Error calculating dose: " + (error instanceof Error ? error.message : String(error)))
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleClear = () => {
    setFormInputs({
      ageYears: "",
      ageMonths: "",
      weightKg: "",
      medication: "",
    })
    setResult(null)
    setDrugInfo(null)
    setDrugInteractions([])
    setErrors({})
    setSearchTerm("")
    setShowSearchDropdown(false)
  }

  const handleSave = () => {
    if (result) {
      const newCalculation: SavedCalculation = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        medication: formInputs.medication,
        dose: `${result.dose} mg daily`,
        doseMl: `${result.doseMl} mL`,
        frequency: result.frequency,
      }
      const updatedCalculations = [...savedCalculations, newCalculation]
      setSavedCalculations(updatedCalculations)
      localStorage.setItem("savedCalculations", JSON.stringify(updatedCalculations))
    }
  }

  // Get filtered medications based on search term
  const filteredMedications = (activeTab === "antibiotics" ? medicationData.antibiotics : medicationData.other).filter(
    (med) => {
      if (!searchTerm) return true
      return med.name.toLowerCase().includes(searchTerm.toLowerCase())
    },
  )

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowSearchDropdown(value.length > 0)
  }

  // Handle medication selection from search dropdown
  const handleMedicationSelect = (medicationName: string) => {
    updateFormInput("medication", medicationName)
    setSearchTerm(medicationName)
    setShowSearchDropdown(false)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("")
    setShowSearchDropdown(false)
    updateFormInput("medication", "")
  }

  const handlePrint = () => {
    if (printRef.current) {
      const content = printRef.current
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write("<html><head><title>Print</title>")
        printWindow.document.write(
          "<style>body { font-family: Arial, sans-serif; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }</style>",
        )
        printWindow.document.write("</head><body>")
        printWindow.document.write(content.innerHTML)
        printWindow.document.write("</body></html>")
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  // Clear search when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchTerm("")
    setShowSearchDropdown(false)
    setFormInputs((prev) => ({ ...prev, medication: "" }))
  }

  const renderMedicationForm = () => (
    <form onSubmit={handleCalculate} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ageYears" className="dark:text-white">
            Age (Years)
          </Label>
          <Input
            id="ageYears"
            type="number"
            min="0"
            max="18"
            value={formInputs.ageYears}
            onChange={(e) => updateFormInput("ageYears", e.target.value)}
            placeholder="Enter age in years"
            className="dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <Label htmlFor="ageMonths" className="dark:text-white">
            Age (Months)
          </Label>
          <Input
            id="ageMonths"
            type="number"
            min="0"
            max="11"
            value={formInputs.ageMonths}
            onChange={(e) => updateFormInput("ageMonths", e.target.value)}
            placeholder="Enter additional months"
            className="dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      {errors.age && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errors.age}</AlertDescription>
        </Alert>
      )}
      <div>
        <Label htmlFor="weightKg" className="dark:text-white">
          Weight (kg)
        </Label>
        <Input
          id="weightKg"
          type="number"
          step="0.1"
          min="0.1"
          max="150"
          value={formInputs.weightKg}
          onChange={(e) => updateFormInput("weightKg", e.target.value)}
          placeholder="Enter weight in kg"
          className="dark:bg-gray-700 dark:text-white"
        />
        {errors.weightKg && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errors.weightKg}</AlertDescription>
          </Alert>
        )}
      </div>
      <div>
        <Label htmlFor="medicationSearch" className="dark:text-white">
          Search & Select Medication
        </Label>
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="medicationSearch"
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => searchTerm.length > 0 && setShowSearchDropdown(true)}
              placeholder="Type to search medications..."
              className="pl-10 pr-10 dark:bg-gray-700 dark:text-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredMedications.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                  No medications found for "{searchTerm}"
                </div>
              ) : (
                filteredMedications.map((med) => (
                  <button
                    key={med.name}
                    type="button"
                    onClick={() => handleMedicationSelect(med.name)}
                    className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="font-medium text-sm dark:text-white">{med.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{med.reference}</div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected Medication Display */}
        {formInputs.medication && (
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-blue-900 dark:text-blue-100">Selected:</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">{formInputs.medication}</div>
              </div>
              <button
                type="button"
                onClick={() => updateFormInput("medication", "")}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {errors.medication && (
          <Alert variant="destructive" className="mt-2">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errors.medication}</AlertDescription>
          </Alert>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
          disabled={isLoading || !formInputs.medication}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Calculating...
            </div>
          ) : (
            "Calculate Dose"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
          className="border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
        >
          Clear
        </Button>
      </div>
    </form>
  )

  return (
    <div className={`container mx-auto p-4 ${isDarkMode ? "dark" : ""}`}>
      <div className="flex justify-end mb-4">
        <div className="flex items-center space-x-2">
          <Sun className="h-4 w-4" />
          <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} aria-label="Toggle dark mode" />
          <Moon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="w-full lg:w-2/3 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center dark:text-white">Pediatric Dose Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="antibiotics">Antibiotics ({medicationData.antibiotics.length})</TabsTrigger>
                <TabsTrigger value="other">Other Medications ({medicationData.other.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="antibiotics">{renderMedicationForm()}</TabsContent>
              <TabsContent value="other">{renderMedicationForm()}</TabsContent>
            </Tabs>
            {result && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md dark:bg-gray-700 dark:text-white">
                <h3 className="font-bold text-lg mb-2">Result:</h3>
                <p>
                  <strong>Dose:</strong> {result.dose} mg daily
                </p>
                <p>
                  <strong>Dose in mL:</strong> {result.doseMl} mL
                </p>
                <p>
                  <strong>Frequency:</strong> {result.frequency}
                </p>
                <p>
                  <strong>Reference:</strong> {result.reference}
                </p>
                {result.comment && (
                  <p>
                    <strong>Comment:</strong> {result.comment}
                  </p>
                )}
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {result.referenceLabel}
                </a>
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleSave}>Save Calculation</Button>
                  <Button onClick={handlePrint} className="flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                </div>
              </div>
            )}
            {drugInfo && drugInfo.drugName && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md dark:bg-gray-700 dark:text-white">
                <h3 className="font-bold text-lg mb-2">
                  Drug Information: {drugInfo.brandName || drugInfo.drugName} ({drugInfo.genericName || "N/A"})
                </h3>
                <Tabs defaultValue="indications">
                  <TabsList>
                    <TabsTrigger value="indications">Indications</TabsTrigger>
                    <TabsTrigger value="dosage">Dosage & Administration</TabsTrigger>
                    <TabsTrigger value="warnings">Warnings</TabsTrigger>
                    <TabsTrigger value="precautions">Precautions</TabsTrigger>
                    <TabsTrigger value="interactions">Interactions</TabsTrigger>
                    <TabsTrigger value="adverse">Adverse Events</TabsTrigger>
                    <TabsTrigger value="pediatric">Pediatric Use</TabsTrigger>
                  </TabsList>
                  <TabsContent value="indications">
                    <ScrollArea className="h-[300px] p-4">
                      <h4 className="font-semibold mb-2">Indications and Usage</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {(drugInfo.indications || "No information available")
                          .split("\n")
                          .filter(Boolean)
                          .map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                      </ul>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="dosage">
                    <ScrollArea className="h-[300px] p-4">
                      <h4 className="font-semibold mb-2">Dosage and Administration</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {(drugInfo.dosageAdministration || "No information available")
                          .split("\n")
                          .filter(Boolean)
                          .map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                      </ul>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="warnings">
                    <ScrollArea className="h-[300px] p-4">
                      <h4 className="font-semibold mb-2">Warnings</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        {drugInfo.warnings &&
                        drugInfo.warnings !== "No information available" &&
                        drugInfo.warnings !== "Please consult prescribing information for warnings." ? (
                          drugInfo.warnings
                            .split(/(?<=[.!?])\s+/)
                            .filter((item) => item.trim().length > 15)
                            .map((item, index) => (
                              <li key={index} className="text-sm leading-relaxed">
                                {item.trim()}
                              </li>
                            ))
                        ) : (
                          <li className="text-sm text-gray-500">No warnings information available</li>
                        )}
                      </ul>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="precautions">
                    <ScrollArea className="h-[300px] p-4">
                      <h4 className="font-semibold mb-2">Precautions</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        {drugInfo.precautions &&
                        drugInfo.precautions !== "No information available" &&
                        drugInfo.precautions !== "Please consult prescribing information for precautions." ? (
                          drugInfo.precautions
                            .split(/(?<=[.!?])\s+/)
                            .filter((item) => item.trim().length > 15)
                            .map((item, index) => (
                              <li key={index} className="text-sm leading-relaxed">
                                {item.trim()}
                              </li>
                            ))
                        ) : (
                          <li className="text-sm text-gray-500">No precautions information available</li>
                        )}
                      </ul>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="interactions">
                    <ScrollArea className="h-[300px] p-4">
                      <h4 className="font-semibold mb-2">Drug Interactions</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {(drugInfo.interactions || "No information available")
                          .split("\n")
                          .filter(Boolean)
                          .map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                      </ul>
                      {drugInteractions.length > 0 && (
                        <>
                          <h5 className="font-semibold mt-4 mb-2">Additional Interactions:</h5>
                          <ul className="list-disc pl-5 space-y-1">
                            {drugInteractions.map((interaction, index) => (
                              <li key={index}>{interaction}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="adverse">
                    <ScrollArea className="h-[300px] p-4">
                      <h4 className="font-semibold mb-2">Adverse Events</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {drugInfo.adverseEvents &&
                        drugInfo.adverseEvents.length > 0 &&
                        !drugInfo.adverseEvents.includes("Information not available from FDA database") ? (
                          drugInfo.adverseEvents.map((event, index) => (
                            <li key={index} className="text-sm leading-relaxed">
                              {event}
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-gray-500">No adverse events information available</li>
                        )}
                      </ul>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="pediatric">
                    <ScrollArea className="h-[300px] p-4">
                      <h4 className="font-semibold mb-2">Pediatric Use</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {(drugInfo.pediatricUse || "No information available")
                          .split("\n")
                          .filter(Boolean)
                          .map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                      </ul>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="w-full lg:w-1/3 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-bold dark:text-white">Reference Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4">
                {activeTab === "antibiotics" && (
                  <div>
                    <h3 className="font-semibold mb-2 dark:text-white">Antibiotics</h3>
                    <ul className="space-y-2">
                      {medicationData.antibiotics.map((med) => (
                        <li key={med.name} className="text-sm dark:text-gray-300">
                          <strong>{med.name}:</strong> {med.reference}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {activeTab === "other" && (
                  <div>
                    <h3 className="font-semibold mb-2 dark:text-white">Other Medications</h3>
                    <ul className="space-y-2">
                      {medicationData.other.map((med) => (
                        <li key={med.name} className="text-sm dark:text-gray-300">
                          <strong>{med.name}:</strong> {med.reference}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      {savedCalculations.length > 0 && (
        <Card className="mt-6 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-bold dark:text-white">Saved Calculations</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div ref={printRef}>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left dark:text-white">Date</th>
                      <th className="text-left dark:text-white">Medication</th>
                      <th className="text-left dark:text-white">Dose</th>
                      <th className="text-left dark:text-white">Dose (mL)</th>
                      <th className="text-left dark:text-white">Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedCalculations.map((calc) => (
                      <tr key={calc.id} className="dark:text-gray-300">
                        <td>{calc.date}</td>
                        <td>{calc.medication}</td>
                        <td>{calc.dose}</td>
                        <td>{calc.doseMl}</td>
                        <td>{calc.frequency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
