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
import { Badge } from "@/components/ui/badge"
import {
  Moon,
  Sun,
  Printer,
  Search,
  X,
  AlertTriangle,
  Info,
  Calculator,
  History,
  BookOpen,
  Shield,
  TrendingUp,
} from "lucide-react"
import { calculateDose } from "../utils/doseCalculator"
import { medicationData } from "../data/medicationData"
import { fetchDrugInfo, fetchDrugInteractions } from "../utils/openFdaApi"
import { MedicationLearningGame } from "./MedicationLearningGame"

type SavedCalculation = {
  id: string
  date: string
  medication: string
  dose: string
  doseMl: string
  frequency: string
  patientAge: string
  patientWeight: string
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

type PatientProfile = {
  id: string
  name: string
  dateOfBirth: string
  weight: string
  allergies: string[]
  medicalConditions: string[]
}

export function PediatricDoseCalculator() {
  const [formInputs, setFormInputs] = useState({
    ageYears: "",
    ageMonths: "",
    weightKg: "",
    medication: "",
    indication: "",
    patientName: "",
  })
  const [result, setResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("antibiotics")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([])
  const [patientProfiles, setPatientProfiles] = useState<PatientProfile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null)
  const [drugInteractions, setDrugInteractions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDosageChart, setShowDosageChart] = useState(false)
  const [calculationHistory, setCalculationHistory] = useState<SavedCalculation[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null)
  const [showSafetyAlerts, setShowSafetyAlerts] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("savedCalculations")
    if (saved) {
      setSavedCalculations(JSON.parse(saved))
      setCalculationHistory(JSON.parse(saved))
    }
    const profiles = localStorage.getItem("patientProfiles")
    if (profiles) {
      setPatientProfiles(JSON.parse(profiles))
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

    // Enhanced validation
    const weight = Number.parseFloat(formInputs.weightKg)
    const ageYears = Number.parseInt(formInputs.ageYears) || 0
    const ageMonths = Number.parseInt(formInputs.ageMonths) || 0

    if (weight < 0.5 || weight > 150) {
      newErrors.weightKg = "Weight should be between 0.5kg and 150kg"
    }

    if (ageYears > 18) {
      newErrors.age = "This calculator is for pediatric patients (≤18 years)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getSafetyAlerts = (medication: string, weight: number, ageInMonths: number) => {
    const alerts = []

    // Age-based alerts
    if (ageInMonths < 1) {
      alerts.push({
        type: "warning",
        message: "Neonatal dosing requires special consideration. Consult pediatric specialist.",
        icon: <AlertTriangle className="h-4 w-4" />,
      })
    }

    // Weight-based alerts
    if (weight < 2.5) {
      alerts.push({
        type: "warning",
        message: "Low birth weight patient. Consider dose adjustment.",
        icon: <AlertTriangle className="h-4 w-4" />,
      })
    }

    // Medication-specific alerts
    if (medication.toLowerCase().includes("aspirin") && ageInMonths < 144) {
      alerts.push({
        type: "error",
        message: "Aspirin contraindicated in children <12 years due to Reye's syndrome risk.",
        icon: <Shield className="h-4 w-4" />,
      })
    }

    return alerts
  }

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const { ageYears, ageMonths, weightKg, medication, indication, patientName } = formInputs
      try {
        setIsLoading(true)
        const totalAgeInMonths = (Number.parseInt(ageYears) || 0) * 12 + (Number.parseInt(ageMonths) || 0)
        const calculationResult = calculateDose(medication, Number.parseFloat(weightKg), totalAgeInMonths)

        // Add safety alerts
        const safetyAlerts = getSafetyAlerts(medication, Number.parseFloat(weightKg), totalAgeInMonths)
        calculationResult.safetyAlerts = safetyAlerts

        setResult(calculationResult)

        // Fetch drug information
        try {
          const drugInfoResult = await fetchDrugInfo(medication)
          setDrugInfo(drugInfoResult)

          const interactionsResult = await fetchDrugInteractions(medication)
          setDrugInteractions(interactionsResult)
        } catch (apiError) {
          console.warn("FDA API unavailable, continuing without drug information:", apiError)
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

  const handleSave = () => {
    if (result) {
      const newCalculation: SavedCalculation = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        medication: formInputs.medication,
        dose: `${result.dose} mg daily`,
        doseMl: `${result.doseMl} mL`,
        frequency: result.frequency,
        patientAge: `${formInputs.ageYears || 0}y ${formInputs.ageMonths || 0}m`,
        patientWeight: `${formInputs.weightKg}kg`,
      }
      const updatedCalculations = [...savedCalculations, newCalculation]
      setSavedCalculations(updatedCalculations)
      setCalculationHistory(updatedCalculations)
      localStorage.setItem("savedCalculations", JSON.JSON.stringify(updatedCalculations))
    }
  }

  const savePatientProfile = () => {
    if (formInputs.patientName && formInputs.weightKg && (formInputs.ageYears || formInputs.ageMonths)) {
      const newProfile: PatientProfile = {
        id: Date.now().toString(),
        name: formInputs.patientName,
        dateOfBirth: calculateDateOfBirth(
          Number.parseInt(formInputs.ageYears) || 0,
          Number.parseInt(formInputs.ageMonths) || 0,
        ),
        weight: formInputs.weightKg,
        allergies: [],
        medicalConditions: [],
      }
      const updatedProfiles = [...patientProfiles, newProfile]
      setPatientProfiles(updatedProfiles)
      localStorage.setItem("patientProfiles", JSON.JSON.stringify(updatedProfiles))
    }
  }

  const calculateDateOfBirth = (years: number, months: number) => {
    const now = new Date()
    const birthDate = new Date(now.getFullYear() - years, now.getMonth() - months, now.getDate())
    return birthDate.toISOString().split("T")[0]
  }

  const loadPatientProfile = (profile: PatientProfile) => {
    const today = new Date()
    const birthDate = new Date(profile.dateOfBirth)
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth())
    const ageYears = Math.floor(ageInMonths / 12)
    const remainingMonths = ageInMonths % 12

    setFormInputs((prev) => ({
      ...prev,
      patientName: profile.name,
      ageYears: ageYears.toString(),
      ageMonths: remainingMonths.toString(),
      weightKg: profile.weight,
    }))
    setSelectedPatient(profile)
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

  const handleClear = () => {
    setFormInputs({
      ageYears: "",
      ageMonths: "",
      weightKg: "",
      medication: "",
      indication: "",
      patientName: "",
    })
    setResult(null)
    setDrugInfo(null)
    setDrugInteractions([])
    setErrors({})
    setSearchTerm("")
    setShowSearchDropdown(false)
    setSelectedPatient(null)
  }

  const handlePrint = () => {
    if (printRef.current) {
      const content = printRef.current
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write("<html><head><title>Pediatric Dose Calculation Report</title>")
        printWindow.document.write(
          "<style>body { font-family: Arial, sans-serif; margin: 20px; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } .header { text-align: center; margin-bottom: 20px; } .patient-info { background-color: #f5f5f5; padding: 10px; margin-bottom: 20px; }</style>",
        )
        printWindow.document.write("</head><body>")
        printWindow.document.write(`
          <div class="header">
            <h1>Pediatric Dose Calculation Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        `)
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
      {/* Patient Information Section */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-900 dark:text-blue-100">
          <Info className="h-4 w-4" />
          Patient Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="patientName" className="dark:text-white">
              Patient Name (Optional)
            </Label>
            <Input
              id="patientName"
              type="text"
              value={formInputs.patientName}
              onChange={(e) => updateFormInput("patientName", e.target.value)}
              placeholder="Enter patient name"
              className="dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <Label htmlFor="indication" className="dark:text-white">
              Indication (Optional)
            </Label>
            <Input
              id="indication"
              type="text"
              value={formInputs.indication}
              onChange={(e) => updateFormInput("indication", e.target.value)}
              placeholder="e.g., UTI, pneumonia"
              className="dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </Card>

      {/* Patient Profiles */}
      {patientProfiles.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <History className="h-4 w-4" />
            Saved Patient Profiles
          </h4>
          <div className="flex flex-wrap gap-2">
            {patientProfiles.map((profile) => (
              <Badge
                key={profile.id}
                variant="outline"
                className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                onClick={() => loadPatientProfile(profile)}
              >
                {profile.name} ({profile.weight}kg)
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ageYears" className="dark:text-white">
            Age (Years) *
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
            Age (Months) *
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
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errors.age}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="weightKg" className="dark:text-white">
          Weight (kg) *
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
          <Alert variant="destructive" className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errors.weightKg}</AlertDescription>
          </Alert>
        )}
      </div>

      <div>
        <Label htmlFor="medicationSearch" className="dark:text-white">
          Search & Select Medication *
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
            <AlertTriangle className="h-4 w-4" />
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
            <>
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Dose
            </>
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

      {formInputs.patientName && (
        <Button type="button" variant="outline" onClick={savePatientProfile} className="w-full bg-transparent">
          Save Patient Profile
        </Button>
      )}
    </form>
  )

  return (
    <div className={`container mx-auto p-4 ${isDarkMode ? "dark" : ""}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pediatric Dose Calculator</h1>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="text-xs">
            v2.0 Enhanced
          </Badge>
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} aria-label="Toggle dark mode" />
            <Moon className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="w-full lg:w-2/3 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center dark:text-white flex items-center justify-center gap-2">
              <Calculator className="h-6 w-6" />
              Dose Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="antibiotics">Antibiotics ({medicationData.antibiotics.length})</TabsTrigger>
                <TabsTrigger value="other">Other Medications ({medicationData.other.length})</TabsTrigger>
                <TabsTrigger value="game">Learning Game</TabsTrigger>
              </TabsList>
              <TabsContent value="antibiotics">{renderMedicationForm()}</TabsContent>
              <TabsContent value="other">{renderMedicationForm()}</TabsContent>
              <TabsContent value="game">
                <MedicationLearningGame />
              </TabsContent>
            </Tabs>

            {/* Safety Alerts */}
            {result && result.safetyAlerts && result.safetyAlerts.length > 0 && showSafetyAlerts && (
              <div className="mt-4 space-y-2">
                {result.safetyAlerts.map((alert: any, index: number) => (
                  <Alert
                    key={index}
                    variant={alert.type === "error" ? "destructive" : "default"}
                    className="border-l-4 border-l-orange-500"
                  >
                    <div className="flex items-center gap-2">
                      {alert.icon}
                      <AlertDescription className="font-medium">{alert.message}</AlertDescription>
                    </div>
                  </Alert>
                ))}
              </div>
            )}

            {result && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md dark:bg-gray-700 dark:text-white">
                <div ref={printRef}>
                  {formInputs.patientName && (
                    <div className="patient-info mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Patient Information</h4>
                      <p>
                        <strong>Name:</strong> {formInputs.patientName}
                      </p>
                      <p>
                        <strong>Age:</strong> {formInputs.ageYears || 0} years, {formInputs.ageMonths || 0} months
                      </p>
                      <p>
                        <strong>Weight:</strong> {formInputs.weightKg} kg
                      </p>
                      {formInputs.indication && (
                        <p>
                          <strong>Indication:</strong> {formInputs.indication}
                        </p>
                      )}
                    </div>
                  )}

                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Calculation Result:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p>
                        <strong>Medication:</strong> {formInputs.medication}
                      </p>
                      <p>
                        <strong>Dose:</strong> {result.dose} mg daily
                      </p>
                      <p>
                        <strong>Dose in mL:</strong> {result.doseMl} mL
                      </p>
                      <p>
                        <strong>Frequency:</strong> {result.frequency}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p>
                        <strong>Reference:</strong> {result.reference}
                      </p>
                      {result.comment && (
                        <p>
                          <strong>Comment:</strong> {result.comment}
                        </p>
                      )}
                      <p>
                        <strong>Calculated on:</strong> {new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400 inline-flex items-center gap-1 mt-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    {result.referenceLabel}
                  </a>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSave} className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Save Calculation
                  </Button>
                  <Button onClick={handlePrint} className="flex items-center gap-2 bg-transparent" variant="outline">
                    <Printer className="h-4 w-4" />
                    Print Report
                  </Button>
                </div>
              </div>
            )}

            {drugInfo && drugInfo.drugName && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md dark:bg-gray-700 dark:text-white">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Drug Information: {drugInfo.brandName || drugInfo.drugName} ({drugInfo.genericName || "N/A"})
                </h3>
                <Tabs defaultValue="indications">
                  <TabsList className="grid grid-cols-4 lg:grid-cols-7">
                    <TabsTrigger value="indications">Indications</TabsTrigger>
                    <TabsTrigger value="dosage">Dosage</TabsTrigger>
                    <TabsTrigger value="warnings">Warnings</TabsTrigger>
                    <TabsTrigger value="precautions">Precautions</TabsTrigger>
                    <TabsTrigger value="interactions">Interactions</TabsTrigger>
                    <TabsTrigger value="adverse">Adverse</TabsTrigger>
                    <TabsTrigger value="pediatric">Pediatric</TabsTrigger>
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
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-blue-500" />
                        Dosage and Administration
                      </h4>
                      <ul className="space-y-3">
                        {drugInfo.dosageAdministration &&
                        drugInfo.dosageAdministration !== "No information available" &&
                        drugInfo.dosageAdministration !==
                          "Please consult prescribing information for dosage and administration details." ? (
                          drugInfo.dosageAdministration
                            .split(/(?<=[.!?])\s+/)
                            .filter((sentence) => sentence.trim().length > 10)
                            .map((sentence, index) => {
                              const cleanSentence = sentence
                                .trim()
                                .replace(/^\d+\.\s*/, "")
                                .replace(/^$$\d+$$\s*/, "")
                              return (
                                <li key={index} className="flex items-start gap-2 text-sm leading-relaxed">
                                  <div className="flex-shrink-0 mt-1">
                                    {cleanSentence.toLowerCase().includes("pediatric") ||
                                    cleanSentence.toLowerCase().includes("child") ? (
                                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    ) : cleanSentence.toLowerCase().includes("adult") ? (
                                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    ) : cleanSentence.toLowerCase().includes("dose") ||
                                      cleanSentence.toLowerCase().includes("mg") ? (
                                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    ) : cleanSentence.toLowerCase().includes("administration") ||
                                      cleanSentence.toLowerCase().includes("take") ? (
                                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    ) : (
                                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                    )}
                                  </div>
                                  <span>{cleanSentence}</span>
                                </li>
                              )
                            })
                        ) : (
                          <li className="flex items-start gap-2 text-sm text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-gray-300 mt-1 flex-shrink-0"></div>
                            <span>No dosage information available</span>
                          </li>
                        )}
                      </ul>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="warnings">
                    <ScrollArea className="h-[300px] p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Warnings
                      </h4>
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
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-yellow-500" />
                        Precautions
                      </h4>
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
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Drug Interactions
                      </h4>
                      <ul className="space-y-3">
                        {drugInfo.interactions &&
                        drugInfo.interactions !== "No information available" &&
                        drugInfo.interactions !==
                          "Please consult prescribing information for drug interaction information." ? (
                          drugInfo.interactions
                            .split(/(?<=[.!?])\s+/)
                            .filter((sentence) => sentence.trim().length > 15)
                            .map((sentence, index) => {
                              const cleanSentence = sentence
                                .trim()
                                .replace(/^\d+\.\s*/, "")
                                .replace(/^$$\d+$$\s*/, "")
                              return (
                                <li key={index} className="flex items-start gap-2 text-sm leading-relaxed">
                                  <div className="flex-shrink-0 mt-1">
                                    {cleanSentence.toLowerCase().includes("contraindicated") ||
                                    cleanSentence.toLowerCase().includes("avoid") ? (
                                      <Shield className="h-3 w-3 text-red-500" />
                                    ) : cleanSentence.toLowerCase().includes("caution") ||
                                      cleanSentence.toLowerCase().includes("monitor") ? (
                                      <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                    ) : cleanSentence.toLowerCase().includes("increase") ||
                                      cleanSentence.toLowerCase().includes("decrease") ? (
                                      <TrendingUp className="h-3 w-3 text-blue-500" />
                                    ) : cleanSentence.toLowerCase().includes("warfarin") ||
                                      cleanSentence.toLowerCase().includes("anticoagulant") ? (
                                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    ) : cleanSentence.toLowerCase().includes("enzyme") ||
                                      cleanSentence.toLowerCase().includes("cyp") ? (
                                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                    ) : (
                                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                    )}
                                  </div>
                                  <span>{cleanSentence}</span>
                                </li>
                              )
                            })
                        ) : (
                          <li className="flex items-start gap-2 text-sm text-gray-500">
                            <div className="w-3 h-3 rounded-full bg-gray-300 mt-1 flex-shrink-0"></div>
                            <span>No drug interaction information available</span>
                          </li>
                        )}
                      </ul>
                      {drugInteractions.length > 0 &&
                        !drugInteractions.includes("Drug interaction data temporarily unavailable") &&
                        !drugInteractions.includes("Drug interaction data not available") && (
                          <>
                            <h5 className="font-semibold mt-6 mb-3 flex items-center gap-2">
                              <Info className="h-4 w-4 text-blue-500" />
                              Additional Interactions:
                            </h5>
                            <ul className="space-y-3">
                              {drugInteractions.map((interaction, index) => {
                                const cleanInteraction = interaction
                                  .trim()
                                  .replace(/^\d+\.\s*/, "")
                                  .replace(/^$$\d+$$\s*/, "")
                                return (
                                  <li key={index} className="flex items-start gap-2 text-sm leading-relaxed">
                                    <div className="flex-shrink-0 mt-1">
                                      <Info className="h-3 w-3 text-blue-500" />
                                    </div>
                                    <span>{cleanInteraction}</span>
                                  </li>
                                )
                              })}
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
            <CardTitle className="text-xl font-bold dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Reference Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4">
                {activeTab === "antibiotics" && (
                  <div>
                    <h3 className="font-semibold mb-2 dark:text-white">Antibiotics</h3>
                    <ul className="space-y-2">
                      {medicationData.antibiotics.map((med) => (
                        <li
                          key={med.name}
                          className="text-sm dark:text-gray-300 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
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
                        <li
                          key={med.name}
                          className="text-sm dark:text-gray-300 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
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
            <CardTitle className="text-xl font-bold dark:text-white flex items-center gap-2">
              <History className="h-5 w-5" />
              Calculation History ({savedCalculations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 dark:text-white">Date</th>
                      <th className="text-left p-2 dark:text-white">Patient</th>
                      <th className="text-left p-2 dark:text-white">Medication</th>
                      <th className="text-left p-2 dark:text-white">Dose</th>
                      <th className="text-left p-2 dark:text-white">Volume</th>
                      <th className="text-left p-2 dark:text-white">Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedCalculations.map((calc) => (
                      <tr key={calc.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300">
                        <td className="p-2">{calc.date}</td>
                        <td className="p-2">
                          {calc.patientAge} / {calc.patientWeight}
                        </td>
                        <td className="p-2">{calc.medication}</td>
                        <td className="p-2">{calc.dose}</td>
                        <td className="p-2">{calc.doseMl}</td>
                        <td className="p-2">{calc.frequency}</td>
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
