"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  getAdminOverrides,
  saveAdminOverrides,
  clearAdminOverrides,
  type MedicationOverride,
  getDefaultMedicationEdits,
  saveDefaultMedicationEdits,
  type DefaultMedicationEdit,
} from "@/utils/adminOverrides"
import { Trash2, Plus, RefreshCw, Search, Edit2, Save, X } from "lucide-react"

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"overrides" | "reference">("overrides")
  const [overrides, setOverrides] = useState<MedicationOverride[]>([])
  const [defaultEdits, setDefaultEdits] = useState<DefaultMedicationEdit[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingDefaultName, setEditingDefaultName] = useState<string | null>(null)
  const [inlineEditingMed, setInlineEditingMed] = useState<string | null>(null)
  const [inlineEditData, setInlineEditData] = useState<any>(null)

  const [newOverride, setNewOverride] = useState<MedicationOverride>({
    medication: "",
    doseFormula: "",
    frequency: "",
    reference: "",
    referenceUrl: "",
    maxDose: undefined,
    comment: "",
    minAgeMonths: undefined,
    maxAgeMonths: undefined,
    ageLabel: "",
    minWeightKg: undefined, // Added weight range fields
    maxWeightKg: undefined,
    weightLabel: "",
    doseMl: "",
    concentrationMg: undefined,
    concentrationMl: undefined,
    medication2: "",
    concentrationMg2: undefined,
    concentrationMl2: undefined,
    doseMl2: "",
    maxDose2: undefined,
  })

  useEffect(() => {
    setOverrides(getAdminOverrides())
    setDefaultEdits(getDefaultMedicationEdits())
  }, [])

  const generateReferenceFromFormula = (formula: string): string => {
    // Extract mg/kg value from formulas like "12 * weightKg" or "30 * weightKg"
    const match = formula.match(/(\d+(?:\.\d+)?)\s*\*\s*weightKg/)
    if (match) {
      return `${match[1]} mg/kg/day`
    }
    return formula // Return formula as-is if pattern doesn't match
  }

  const handleAddOverride = () => {
    if (!newOverride.medication || !newOverride.doseFormula) {
      alert("Please fill in medication name and dose formula")
      return
    }

    const referenceText = newOverride.reference || generateReferenceFromFormula(newOverride.doseFormula)
    const overrideWithReference = { ...newOverride, reference: referenceText }

    if (editingDefaultName !== null) {
      const existingEditIndex = defaultEdits.findIndex((edit) => edit.name === editingDefaultName)

      const newEdit: DefaultMedicationEdit = {
        name: overrideWithReference.medication,
        defaultFormula: overrideWithReference.doseFormula,
        frequency: overrideWithReference.frequency,
        reference: referenceText,
        referenceUrl: overrideWithReference.referenceUrl || "",
        maxDose: overrideWithReference.maxDose,
        comment: overrideWithReference.comment,
        concentrationMg: overrideWithReference.concentrationMg,
        concentrationMl: overrideWithReference.concentrationMl,
        ageRanges:
          overrideWithReference.minAgeMonths !== undefined && overrideWithReference.maxAgeMonths !== undefined
            ? [
                {
                  min: overrideWithReference.minAgeMonths,
                  max: overrideWithReference.maxAgeMonths,
                  formula: overrideWithReference.doseFormula,
                  label: overrideWithReference.ageLabel || "",
                },
              ]
            : undefined,
      }

      let updatedEdits: DefaultMedicationEdit[]
      if (existingEditIndex >= 0) {
        updatedEdits = [...defaultEdits]
        updatedEdits[existingEditIndex] = newEdit
      } else {
        updatedEdits = [...defaultEdits, newEdit]
      }

      setDefaultEdits(updatedEdits)
      saveDefaultMedicationEdits(updatedEdits)
      setEditingDefaultName(null)

      setNewOverride({
        medication: "",
        doseFormula: "",
        frequency: "",
        reference: "",
        referenceUrl: "",
        maxDose: undefined,
        comment: "",
        minAgeMonths: undefined,
        maxAgeMonths: undefined,
        ageLabel: "",
        minWeightKg: undefined,
        maxWeightKg: undefined,
        weightLabel: "",
        doseMl: "",
        concentrationMg: undefined,
        concentrationMl: undefined,
        medication2: "",
        concentrationMg2: undefined,
        concentrationMl2: undefined,
        doseMl2: "",
        maxDose2: undefined,
      })

      return
    }

    if (editingIndex !== null) {
      const updated = [...overrides]
      updated[editingIndex] = overrideWithReference
      setOverrides(updated)
      saveAdminOverrides(updated)
      setEditingIndex(null)
    } else {
      const existingIndex = overrides.findIndex((o) => {
        if (o.medication !== overrideWithReference.medication) return false

        // Check if both have age ranges and they match
        const ageMatch =
          (overrideWithReference.minAgeMonths !== undefined &&
            overrideWithReference.maxAgeMonths !== undefined &&
            o.minAgeMonths === overrideWithReference.minAgeMonths &&
            o.maxAgeMonths === overrideWithReference.maxAgeMonths) ||
          (overrideWithReference.minAgeMonths === undefined && o.minAgeMonths === undefined)

        // Check if both have weight ranges and they match
        const weightMatch =
          (overrideWithReference.minWeightKg !== undefined &&
            overrideWithReference.maxWeightKg !== undefined &&
            o.minWeightKg === overrideWithReference.minWeightKg &&
            o.maxWeightKg === overrideWithReference.maxWeightKg) ||
          (overrideWithReference.minWeightKg === undefined && o.minWeightKg === undefined)

        return ageMatch && weightMatch
      })

      let updated: MedicationOverride[]
      if (existingIndex >= 0) {
        updated = [...overrides]
        updated[existingIndex] = overrideWithReference
      } else {
        updated = [...overrides, overrideWithReference]
      }

      setOverrides(updated)
      saveAdminOverrides(updated)
    }

    setNewOverride({
      medication: "",
      doseFormula: "",
      frequency: "",
      reference: "",
      referenceUrl: "",
      maxDose: undefined,
      comment: "",
      minAgeMonths: undefined,
      maxAgeMonths: undefined,
      ageLabel: "",
      minWeightKg: undefined,
      maxWeightKg: undefined,
      weightLabel: "",
      doseMl: "",
      concentrationMg: undefined,
      concentrationMl: undefined,
      medication2: "",
      concentrationMg2: undefined,
      concentrationMl2: undefined,
      doseMl2: "",
      maxDose2: undefined,
    })
  }

  const handleEditOverride = (index: number) => {
    setNewOverride({ ...overrides[index] })
    setEditingIndex(index)
    setEditingDefaultName(null) // Ensure default editing is off
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleEditDefaultMedication = (med: (typeof allMedications)[0], ageRange?: (typeof med.ageRanges)[0]) => {
    setEditingIndex(null) // Ensure regular override editing is off
    setEditingDefaultName(med.name)

    if (ageRange) {
      setNewOverride({
        medication: med.name,
        doseFormula: ageRange.formula,
        frequency: med.frequency,
        reference: med.reference,
        referenceUrl: med.referenceUrl,
        maxDose: med.maxDose,
        comment: med.comment || "",
        minAgeMonths: ageRange.min,
        maxAgeMonths: ageRange.max,
        ageLabel: ageRange.label,
        doseMl: "",
        concentrationMg: med.concentrationMg,
        concentrationMl: med.concentrationMl,
        // Combination fields are not directly editable from ageRanges
        medication2: "",
        concentrationMg2: undefined,
        concentrationMl2: undefined,
        doseMl2: "",
        maxDose2: undefined,
      })
    } else {
      setNewOverride({
        medication: med.name,
        doseFormula: med.defaultFormula,
        frequency: med.frequency,
        reference: med.reference,
        referenceUrl: med.referenceUrl,
        maxDose: med.maxDose,
        comment: med.comment || "",
        minAgeMonths: undefined,
        maxAgeMonths: undefined,
        ageLabel: "",
        doseMl: "",
        concentrationMg: med.concentrationMg,
        concentrationMl: med.concentrationMl,
        // Combination fields are not directly editable from default formula
        medication2: "",
        concentrationMg2: undefined,
        concentrationMl2: undefined,
        doseMl2: "",
        maxDose2: undefined,
      })
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleStartInlineEdit = (med: (typeof allMedications)[0]) => {
    setInlineEditingMed(med.name)
    setInlineEditData({
      name: med.name,
      defaultFormula: med.defaultFormula,
      frequency: med.frequency,
      reference: med.reference,
      referenceUrl: med.referenceUrl,
      maxDose: med.maxDose,
      comment: med.comment || "",
      concentrationMg: med.concentrationMg,
      concentrationMl: med.concentrationMl,
    })
  }

  const handleSaveInlineEdit = () => {
    if (!inlineEditData) return

    const existingEditIndex = defaultEdits.findIndex((edit) => edit.name === inlineEditData.name)

    const newEdit: DefaultMedicationEdit = {
      name: inlineEditData.name,
      defaultFormula: inlineEditData.defaultFormula,
      frequency: inlineEditData.frequency,
      reference: inlineEditData.reference,
      referenceUrl: inlineEditData.referenceUrl || "",
      maxDose: inlineEditData.maxDose,
      comment: inlineEditData.comment,
      concentrationMg: inlineEditData.concentrationMg,
      concentrationMl: inlineEditData.concentrationMl,
    }

    let updatedEdits: DefaultMedicationEdit[]
    if (existingEditIndex >= 0) {
      updatedEdits = [...defaultEdits]
      updatedEdits[existingEditIndex] = newEdit
    } else {
      updatedEdits = [...defaultEdits, newEdit]
    }

    setDefaultEdits(updatedEdits)
    saveDefaultMedicationEdits(updatedEdits)
    setInlineEditingMed(null)
    setInlineEditData(null)
  }

  const handleCancelInlineEdit = () => {
    setInlineEditingMed(null)
    setInlineEditData(null)
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditingDefaultName(null)
    setNewOverride({
      medication: "",
      doseFormula: "",
      frequency: "",
      reference: "",
      referenceUrl: "",
      maxDose: undefined,
      comment: "",
      minAgeMonths: undefined,
      maxAgeMonths: undefined,
      ageLabel: "",
      minWeightKg: undefined,
      maxWeightKg: undefined,
      weightLabel: "",
      doseMl: "",
      concentrationMg: undefined,
      concentrationMl: undefined,
      medication2: "",
      concentrationMg2: undefined,
      concentrationMl2: undefined,
      doseMl2: "",
      maxDose2: undefined,
    })
  }

  const handleRemoveOverride = (index: number) => {
    const updated = overrides.filter((_, i) => i !== index)
    setOverrides(updated)
    saveAdminOverrides(updated)
    if (editingIndex === index) {
      setEditingIndex(null)
      handleCancelEdit()
    }
  }

  const handleRemoveDefaultEdit = (medicationName: string) => {
    const updated = defaultEdits.filter((edit) => edit.name !== medicationName)
    setDefaultEdits(updated)
    saveDefaultMedicationEdits(updated)
    if (editingDefaultName === medicationName) {
      setEditingDefaultName(null)
      handleCancelEdit()
    }
  }

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all overrides? This cannot be undone.")) {
      clearAdminOverrides()
      setOverrides([])
      setEditingIndex(null)
      handleCancelEdit()
    }
  }

  const allMedications = [
    // Antibiotics
    {
      name: "Augmentin 457",
      defaultFormula: "90 * weightKg (3mo-12y) or 30 * weightKg (<3mo)",
      frequency: "Every 12 hours",
      reference: "90 mg/kg/day (3mo-12y)",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=b897c800-24a2-4e76-8668-498c5515c3d0",
      concentrationMg: 400,
      concentrationMl: 5,
      ageRanges: [
        { min: 3, max: 144, formula: "90 * weightKg", label: "3 months - 12 years" },
        { min: 0, max: 3, formula: "30 * weightKg", label: "Under 3 months" },
      ],
    },
    {
      name: "Augmentin ES 600",
      defaultFormula: "90 * weightKg (3mo-12y) or 30 * weightKg (<3mo)",
      frequency: "Every 12 hours",
      reference: "90 mg/kg/day (3mo-12y)",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=b897c800-24a2-4e76-8668-498c5515c3d0",
      concentrationMg: 600,
      concentrationMl: 5,
      ageRanges: [
        { min: 3, max: 144, formula: "90 * weightKg", label: "3 months - 12 years" },
        { min: 0, max: 3, formula: "30 * weightKg", label: "Under 3 months" },
      ],
    },
    {
      name: "Zinnat 125",
      defaultFormula: "30 * weightKg",
      frequency: "Every 12 hours",
      reference: "30 mg/kg/day (max 1000mg)",
      maxDose: 1000,
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 125,
      concentrationMl: 5,
      ageRanges: [{ min: 3, max: 144, formula: "30 * weightKg", label: "3 months - 12 years" }],
    },
    {
      name: "Zinnat 250",
      defaultFormula: "30 * weightKg",
      frequency: "Every 12 hours",
      reference: "30 mg/kg/day (max 1000mg)",
      maxDose: 1000,
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 250,
      concentrationMl: 5,
      ageRanges: [{ min: 3, max: 144, formula: "30 * weightKg", label: "3 months - 12 years" }],
    },
    {
      name: "Klacid 125",
      defaultFormula: "15 * weightKg",
      frequency: "Every 12 hours",
      reference: "15 mg/kg/day",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 125,
      concentrationMl: 5,
      ageRanges: [{ min: 3, max: 144, formula: "15 * weightKg", label: "3 months - 12 years" }],
    },
    {
      name: "Klacid 250",
      defaultFormula: "15 * weightKg",
      frequency: "Every 12 hours",
      reference: "15 mg/kg/day",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 250,
      concentrationMl: 5,
      ageRanges: [{ min: 3, max: 144, formula: "15 * weightKg", label: "3 months - 12 years" }],
    },
    {
      name: "Metronidazole 125",
      defaultFormula: "50 * weightKg",
      frequency: "Every 8 hours",
      reference: "50 mg/kg/day",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 125,
      concentrationMl: 5,
      ageRanges: [{ min: 3, max: 144, formula: "50 * weightKg", label: "3 months - 12 years" }],
    },
    {
      name: "Metronidazole 250",
      defaultFormula: "50 * weightKg",
      frequency: "Every 8 hours",
      reference: "50 mg/kg/day",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 250,
      concentrationMl: 5,
      ageRanges: [{ min: 3, max: 144, formula: "50 * weightKg", label: "3 months - 12 years" }],
    },
    {
      name: "Zithromax",
      defaultFormula: "30 * weightKg",
      frequency: "Once daily",
      reference: "30 mg/kg/day",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 200,
      concentrationMl: 5,
      ageRanges: [{ min: 3, max: 144, formula: "30 * weightKg", label: "3 months - 12 years" }],
    },
    {
      name: "Suprax 100",
      defaultFormula: "8 * weightKg",
      frequency: "Once daily",
      reference: "8 mg/kg/day",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 100,
      concentrationMl: 5,
      ageRanges: [{ min: 3, max: 144, formula: "8 * weightKg", label: "3 months - 12 years" }],
    },
    {
      name: "Amoxicillin 250",
      defaultFormula: "45 * weightKg",
      frequency: "Every 12 hours",
      reference: "45 mg/kg/day",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 250,
      concentrationMl: 5,
      ageRanges: [{ min: 3, max: 144, formula: "45 * weightKg", label: "3 months - 12 years" }],
    },
    {
      name: "Septrin (SULFAMETHOXAZOLE)",
      defaultFormula: "100 * weightKg",
      frequency: "Every 12 hours",
      reference: "100 mg/kg/day",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 400,
      concentrationMl: 5,
      ageRanges: [{ min: 3, max: 144, formula: "100 * weightKg", label: "3 months - 12 years" }],
    },
    {
      name: "Septrin (TRIMETHOPRIM)",
      defaultFormula: "20 * weightKg",
      frequency: "Every 12 hours",
      reference: "20 mg/kg/day",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 80,
      concentrationMl: 5,
      ageRanges: [{ min: 3, max: 144, formula: "20 * weightKg", label: "3 months - 12 years" }],
    },
    {
      name: "Zovirax",
      defaultFormula: "80 * weightKg",
      frequency: "5 times daily",
      reference: "80 mg/kg/day (2y-12y)",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 400,
      concentrationMl: 5,
      ageRanges: [
        { min: 24, max: 144, formula: "80 * weightKg", label: "2-12 years" },
        { min: 0, max: 24, formula: "0", label: "Under 2 years (not recommended)" },
      ],
    },
    {
      name: "Nystatin",
      defaultFormula: "800000 (<3mo) or 2400000 (3mo-12y)",
      frequency: "4 times daily",
      reference: "800,000 units/day (<3mo) or 2,400,000 units/day (3mo-12y)",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 100000,
      concentrationMl: 1,
      ageRanges: [
        { min: 0, max: 3, formula: "800000", label: "Under 3 months" },
        { min: 3, max: 144, formula: "2400000", label: "3 months - 12 years" },
      ],
    },
    {
      name: "Nitrofurantoin",
      defaultFormula: "1 * weightKg",
      frequency: "Once daily at bedtime",
      reference: "1 mg/kg/day (3mo-12y)",
      comment: "For UTI prophylaxis - take with food",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 25,
      concentrationMl: 5,
      ageRanges: [{ min: 3, max: 144, formula: "1 * weightKg", label: "3 months - 12 years" }],
    },

    // Pain & Fever
    {
      name: "PANADOL BABY and INFANT 120 MG/5ML",
      defaultFormula: "75 * weightKg",
      frequency: "Every 4 hours",
      reference: "75 mg/kg/day (max 4000mg)",
      maxDose: 4000,
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 120,
      concentrationMl: 5,
      ageRanges: [{ min: 3, max: 144, formula: "75 * weightKg", label: "3 months - 12 years, ≤40kg" }],
    },
    {
      name: "PANADOL Elixir 240 MG/5ML",
      defaultFormula: "75 * weightKg",
      frequency: "Every 4 hours",
      reference: "75 mg/kg/day (max 4000mg)",
      maxDose: 4000,
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 240,
      concentrationMl: 5,
      ageRanges: [{ min: 3, max: 144, formula: "75 * weightKg", label: "3 months - 12 years, ≤40kg" }],
    },
    {
      name: "ADOL DROPS 100 MG/ML",
      defaultFormula: "15 * weightKg",
      frequency: "Every 4-6 hours as needed",
      reference: "10-15 mg/kg/dose (max 60mg/kg/day)",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 100,
      concentrationMl: 1,
      ageRanges: [{ min: 3, max: 144, formula: "15 * weightKg", label: "3 months - 12 years, ≤40kg" }],
    },
    {
      name: "BRUFEN PAEDIATRIC SYRUP 100 MG/5 ML",
      defaultFormula: "10 * weightKg",
      frequency: "Every 6-8 hours as needed",
      reference: "5-10 mg/kg/dose (max 40mg/kg/day)",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 100,
      concentrationMl: 5,
      ageRanges: [{ min: 6, max: 144, formula: "10 * weightKg", label: "6 months - 12 years, ≥5kg" }],
    },

    // Antihistamines
    {
      name: "AERIUS SYRUP 0.5 MG/ML",
      defaultFormula: "Age-based dosing",
      frequency: "Once daily",
      reference: "Age-based: 1mg (6-11mo), 1.25mg (1-5y), 2.5mg (6-11y), 5mg (12y+)",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 0.5,
      concentrationMl: 1,
      ageRanges: [
        { min: 6, max: 11, formula: "1", label: "6-11 months" },
        { min: 12, max: 60, formula: "1.25", label: "1-5 years" },
        { min: 61, max: 132, formula: "2.5", label: "6-11 years" },
        { min: 133, max: 216, formula: "5", label: "12+ years" },
      ],
    },
    {
      name: "ZYRTEC SYRUP 1 MG/ML",
      defaultFormula: "Age-based dosing",
      frequency: "Once daily",
      reference: "Age-based: 2.5mg (6mo-5y), 5-10mg (5y+)",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 1,
      concentrationMl: 1,
      ageRanges: [
        { min: 6, max: 24, formula: "2.5", label: "6 months - 2 years" },
        { min: 24, max: 60, formula: "2.5", label: "2-5 years (can increase to 5mg)" },
        { min: 61, max: 216, formula: "5", label: "5+ years (can increase to 10mg)" },
      ],
    },

    // Anticonvulsants
    {
      name: "DEPAKINE 57.64MG/ML SYRUP",
      defaultFormula: "20 * weightKg (≤3mo) or 30 * weightKg (>3mo)",
      frequency: "2-3 times daily",
      reference: "10-20 mg/kg/day (≤3mo) or 15-30 mg/kg/day (>3mo)",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 57.64,
      concentrationMl: 1,
      ageRanges: [
        { min: 0, max: 3, formula: "20 * weightKg", label: "≤3 months" },
        { min: 4, max: 216, formula: "30 * weightKg", label: ">3 months" },
      ],
    },
    {
      name: "DEPAKINE DROPS 200 MG/ML",
      defaultFormula: "20 * weightKg (≤3mo) or 30 * weightKg (>3mo)",
      frequency: "2-3 times daily",
      reference: "10-20 mg/kg/day (≤3mo) or 15-30 mg/kg/day (>3mo)",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 200,
      concentrationMl: 1,
      ageRanges: [
        { min: 0, max: 3, formula: "20 * weightKg", label: "≤3 months" },
        { min: 4, max: 216, formula: "30 * weightKg", label: ">3 months" },
      ],
    },
    {
      name: "TEGRETOL 100 MG/5 ML",
      defaultFormula: "10 * weightKg (<6y) or 200mg (≥6y)",
      frequency: "2-3 times daily",
      reference: "5-10 mg/kg/day (<6y) or 200mg/day (≥6y)",
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 100,
      concentrationMl: 5,
      ageRanges: [
        { min: 0, max: 71, formula: "10 * weightKg", label: "<6 years" },
        { min: 72, max: 216, formula: "200", label: "≥6 years" },
      ],
    },
    {
      name: "TRILEPTAL 60 MG/ML",
      defaultFormula: "8 * weightKg",
      frequency: "Twice daily",
      reference: "8-10 mg/kg/day (1mo+), max 600mg/day (≥4y)",
      maxDose: 600,
      referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=another-id",
      concentrationMg: 60,
      concentrationMl: 1,
      ageRanges: [
        { min: 1, max: 47, formula: "8 * weightKg", label: "1 month - <4 years" },
        { min: 48, max: 216, formula: "8 * weightKg", label: "≥4 years (max 600mg)" },
      ],
    },
  ]

  const getMedicationWithEdits = (med: (typeof allMedications)[0]) => {
    // First, check if there's an override for this medication (without age range)
    const override = overrides.find(
      (o) => o.medication === med.name && o.minAgeMonths === undefined && o.maxAgeMonths === undefined,
    )

    if (override) {
      // If there's an override, use it to populate the reference summary
      return {
        ...med,
        defaultFormula: override.doseFormula,
        frequency: override.frequency || med.frequency,
        reference: override.reference || med.reference,
        referenceUrl: override.referenceUrl || med.referenceUrl,
        maxDose: override.maxDose !== undefined ? override.maxDose : med.maxDose,
        comment: override.comment || med.comment,
        concentrationMg: override.concentrationMg !== undefined ? override.concentrationMg : med.concentrationMg,
        concentrationMl: override.concentrationMl !== undefined ? override.concentrationMl : med.concentrationMl,
        ageRanges: med.ageRanges, // Keep original age ranges for now
        isEdited: true,
        isOverride: true, // Flag to show this is from an override
      }
    }

    // Otherwise check for default edits
    const edit = defaultEdits.find((e) => e.name === med.name)
    if (edit) {
      return {
        ...med,
        defaultFormula: edit.defaultFormula,
        frequency: edit.frequency || med.frequency,
        reference: edit.reference || med.reference,
        referenceUrl: edit.referenceUrl || med.referenceUrl,
        maxDose: edit.maxDose !== undefined ? edit.maxDose : med.maxDose,
        comment: edit.comment || med.comment,
        concentrationMg: edit.concentrationMg !== undefined ? edit.concentrationMg : med.concentrationMg,
        concentrationMl: edit.concentrationMl !== undefined ? edit.concentrationMl : med.concentrationMl,
        ageRanges: edit.ageRanges || med.ageRanges,
        isEdited: true,
        isOverride: false,
      }
    }
    return { ...med, isEdited: false, isOverride: false }
  }

  const filteredMedications = allMedications
    .map(getMedicationWithEdits)
    .filter((med) => med.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleMedicationClick = (med: (typeof allMedications)[0], ageRange?: (typeof med.ageRanges)[0]) => {
    setEditingIndex(null)
    setEditingDefaultName(null) // Ensure default editing is off

    if (ageRange) {
      setNewOverride({
        medication: med.name,
        doseFormula: ageRange.formula,
        frequency: med.frequency,
        reference: med.reference,
        referenceUrl: med.referenceUrl,
        maxDose: med.maxDose,
        comment: med.comment || "",
        minAgeMonths: ageRange.min,
        maxAgeMonths: ageRange.max,
        ageLabel: ageRange.label,
        doseMl: "",
        concentrationMg: med.concentrationMg,
        concentrationMl: med.concentrationMl,
        // Combination fields are not directly editable when clicking an age range
        medication2: "",
        concentrationMg2: undefined,
        concentrationMl2: undefined,
        doseMl2: "",
        maxDose2: undefined,
      })
    } else {
      setNewOverride({
        medication: med.name,
        doseFormula: med.defaultFormula,
        frequency: med.frequency,
        reference: med.reference,
        referenceUrl: med.referenceUrl,
        maxDose: med.maxDose,
        comment: med.comment || "",
        minAgeMonths: undefined,
        maxAgeMonths: undefined,
        ageLabel: "",
        doseMl: "",
        concentrationMg: med.concentrationMg,
        concentrationMl: med.concentrationMl,
        // Combination fields are not directly editable when clicking default
        medication2: "",
        concentrationMg2: undefined,
        concentrationMl2: undefined,
        doseMl2: "",
        maxDose2: undefined,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="bg-gray-800 border-purple-500">
          <CardHeader>
            <CardTitle className="text-3xl text-white flex items-center gap-2">
              <span className="text-4xl">🔐</span>
              Admin Control Panel
            </CardTitle>
            <CardDescription className="text-gray-300">
              Modify medication calculation parameters. Changes are saved locally and will override default
              calculations.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="flex gap-2">
          <Button
            onClick={() => setActiveTab("overrides")}
            className={`flex-1 ${activeTab === "overrides" ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-700 hover:bg-gray-600"}`}
          >
            Medication Overrides
          </Button>
          <Button
            onClick={() => setActiveTab("reference")}
            className={`flex-1 ${activeTab === "reference" ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-600"}`}
          >
            Reference Summary Editor
          </Button>
        </div>

        {activeTab === "overrides" ? (
          <>
            {/* Overrides Tab Content */}
            <Card className="bg-gray-800 border-blue-500">
              <CardHeader>
                <CardTitle className="text-white">
                  Quick Reference - All Medications ({allMedications.length})
                </CardTitle>
                <CardDescription className="text-gray-300">Click medication name to add as override</CardDescription>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search medications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 text-white border-gray-600"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {filteredMedications.map((med) => (
                    <div key={med.name} className="bg-gray-700 p-3 rounded border border-gray-600">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-blue-300">{med.name}</div>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        <div>Frequency: {med.frequency}</div>
                        <div>Reference: {med.reference}</div>
                        {med.concentrationMg && med.concentrationMl && (
                          <div>
                            Concentration: {med.concentrationMg} mg / {med.concentrationMl} mL
                          </div>
                        )}
                        {med.maxDose && <div>Max Dose: {med.maxDose} mg</div>}
                        {med.comment && <div>Comment: {med.comment}</div>}
                      </div>

                      {med.ageRanges && med.ageRanges.length > 1 ? (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-400 mb-1">Click age range to use:</div>
                          {med.ageRanges.map((range, idx) => (
                            <Button
                              key={idx}
                              size="sm"
                              variant="outline"
                              onClick={() => handleMedicationClick(med, range)}
                              className="w-full text-left justify-start bg-gray-600 hover:bg-gray-500 text-white border-gray-500 mb-1"
                            >
                              <span className="font-mono text-xs mr-2">{range.label}:</span>
                              <span className="text-green-300 font-mono text-xs">{range.formula}</span>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMedicationClick(med)}
                          className="w-full text-left justify-start bg-gray-600 hover:bg-gray-500 text-white border-gray-500"
                        >
                          <span className="text-green-300 font-mono text-xs">{med.defaultFormula}</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-green-500">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {editingIndex !== null ? "Edit Override" : "Add New Override"}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {editingIndex !== null
                    ? "Update the override or click Cancel to discard changes"
                    : "Click a medication above to populate the form, then modify as needed. Add age or weight ranges for specific dosing scenarios."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medication" className="text-white">
                      Medication Name
                    </Label>
                    <Input
                      id="medication"
                      value={newOverride.medication}
                      onChange={(e) => setNewOverride({ ...newOverride, medication: e.target.value })}
                      placeholder="e.g., Augmentin 457"
                      className="bg-gray-700 text-white border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="formula" className="text-white">
                      Dose Formula
                    </Label>
                    <Input
                      id="formula"
                      value={newOverride.doseFormula}
                      onChange={(e) => setNewOverride({ ...newOverride, doseFormula: e.target.value })}
                      placeholder="e.g., 30 * weightKg or 10 * weightKg"
                      className="bg-gray-700 text-white border-gray-600 font-mono"
                    />
                    <p className="text-xs text-gray-400">Use "weightKg" for weight in kg, "ageInMonths" for age</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="concentrationMg" className="text-white">
                        Concentration (mg)
                      </Label>
                      <Input
                        id="concentrationMg"
                        type="number"
                        value={newOverride.concentrationMg || ""}
                        onChange={(e) =>
                          setNewOverride({
                            ...newOverride,
                            concentrationMg: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="e.g., 400"
                        className="bg-gray-700 text-white border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="concentrationMl" className="text-white">
                        Concentration (mL)
                      </Label>
                      <Input
                        id="concentrationMl"
                        type="number"
                        value={newOverride.concentrationMl || ""}
                        onChange={(e) =>
                          setNewOverride({
                            ...newOverride,
                            concentrationMl: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="e.g., 5"
                        className="bg-gray-700 text-white border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doseMl" className="text-white">
                      Custom mL Formula (Optional)
                    </Label>
                    <Input
                      id="doseMl"
                      value={newOverride.doseMl || ""}
                      onChange={(e) => setNewOverride({ ...newOverride, doseMl: e.target.value })}
                      placeholder="Leave empty for auto-calculation"
                      className="bg-gray-700 text-white border-gray-600 font-mono"
                    />
                    <p className="text-xs text-gray-400">
                      Advanced: Use "dose" variable (e.g., dose / 5). Leave empty to auto-calculate.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency" className="text-white">
                      Frequency
                    </Label>
                    <Input
                      id="frequency"
                      value={newOverride.frequency}
                      onChange={(e) => setNewOverride({ ...newOverride, frequency: e.target.value })}
                      placeholder="e.g., Every 12 hours"
                      className="bg-gray-700 text-white border-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ageLabel" className="text-white">
                      Age Range Label (Optional)
                    </Label>
                    <Input
                      id="ageLabel"
                      value={newOverride.ageLabel || ""}
                      onChange={(e) => setNewOverride({ ...newOverride, ageLabel: e.target.value })}
                      placeholder="e.g., 3 months - 2 years"
                      className="bg-gray-700 text-white border-gray-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="minAge" className="text-white">
                        Min Age (months)
                      </Label>
                      <Input
                        id="minAge"
                        type="number"
                        value={newOverride.minAgeMonths || ""}
                        onChange={(e) =>
                          setNewOverride({
                            ...newOverride,
                            minAgeMonths: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="e.g., 3"
                        className="bg-gray-700 text-white border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxAge" className="text-white">
                        Max Age (months)
                      </Label>
                      <Input
                        id="maxAge"
                        type="number"
                        value={newOverride.maxAgeMonths || ""}
                        onChange={(e) =>
                          setNewOverride({
                            ...newOverride,
                            maxAgeMonths: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="e.g., 24"
                        className="bg-gray-700 text-white border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weightLabel" className="text-white">
                      Weight Range Label (Optional)
                    </Label>
                    <Input
                      id="weightLabel"
                      value={newOverride.weightLabel || ""}
                      onChange={(e) => setNewOverride({ ...newOverride, weightLabel: e.target.value })}
                      placeholder="e.g., 5-10 kg"
                      className="bg-gray-700 text-white border-gray-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="minWeight" className="text-white">
                        Min Weight (kg)
                      </Label>
                      <Input
                        id="minWeight"
                        type="number"
                        step="0.1"
                        value={newOverride.minWeightKg || ""}
                        onChange={(e) =>
                          setNewOverride({
                            ...newOverride,
                            minWeightKg: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="e.g., 5"
                        className="bg-gray-700 text-white border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxWeight" className="text-white">
                        Max Weight (kg)
                      </Label>
                      <Input
                        id="maxWeight"
                        type="number"
                        step="0.1"
                        value={newOverride.maxWeightKg || ""}
                        onChange={(e) =>
                          setNewOverride({
                            ...newOverride,
                            maxWeightKg: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="e.g., 10"
                        className="bg-gray-700 text-white border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference" className="text-white">
                      Reference
                    </Label>
                    <Input
                      id="reference"
                      value={newOverride.reference}
                      onChange={(e) => setNewOverride({ ...newOverride, reference: e.target.value })}
                      placeholder="e.g., 30 mg/kg/day"
                      className="bg-gray-700 text-white border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referenceUrl" className="text-white">
                      Reference URL (DailyMed Link)
                    </Label>
                    <Input
                      id="referenceUrl"
                      value={newOverride.referenceUrl || ""}
                      onChange={(e) => setNewOverride({ ...newOverride, referenceUrl: e.target.value })}
                      placeholder="e.g., https://dailymed.nlm.nih.gov/..."
                      className="bg-gray-700 text-white border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDose" className="text-white">
                      Max Dose (optional)
                    </Label>
                    <Input
                      id="maxDose"
                      type="number"
                      value={newOverride.maxDose || ""}
                      onChange={(e) =>
                        setNewOverride({ ...newOverride, maxDose: e.target.value ? Number(e.target.value) : undefined })
                      }
                      placeholder="e.g., 1000"
                      className="bg-gray-700 text-white border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment" className="text-white">
                      Comment (optional)
                    </Label>
                    <Input
                      id="comment"
                      value={newOverride.comment || ""}
                      onChange={(e) => setNewOverride({ ...newOverride, comment: e.target.value })}
                      placeholder="e.g., Take with food"
                      className="bg-gray-700 text-white border-gray-600"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-4 mt-4">
                  <h3 className="text-white font-semibold mb-3">
                    Secondary Medication Component (Optional - for Combination Medications)
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    For combination medications like Augmentin (Amoxicillin + Clavulanic acid), add the second component
                    details below.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medication2" className="text-white">
                        Secondary Medication Name
                      </Label>
                      <Input
                        id="medication2"
                        value={newOverride.medication2 || ""}
                        onChange={(e) => setNewOverride({ ...newOverride, medication2: e.target.value })}
                        placeholder="e.g., Clavulanic acid"
                        className="bg-gray-700 text-white border-gray-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="concentrationMg2" className="text-white">
                          Concentration (mg)
                        </Label>
                        <Input
                          id="concentrationMg2"
                          type="number"
                          value={newOverride.concentrationMg2 || ""}
                          onChange={(e) =>
                            setNewOverride({
                              ...newOverride,
                              concentrationMg2: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          placeholder="e.g., 57"
                          className="bg-gray-700 text-white border-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="concentrationMl2" className="text-white">
                          Concentration (mL)
                        </Label>
                        <Input
                          id="concentrationMl2"
                          type="number"
                          value={newOverride.concentrationMl2 || ""}
                          onChange={(e) =>
                            setNewOverride({
                              ...newOverride,
                              concentrationMl2: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          placeholder="e.g., 5"
                          className="bg-gray-700 text-white border-gray-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doseMl2" className="text-white">
                        Custom Content Formula (Optional)
                      </Label>
                      <Input
                        id="doseMl2"
                        value={newOverride.doseMl2 || ""}
                        onChange={(e) => setNewOverride({ ...newOverride, doseMl2: e.target.value })}
                        placeholder="Leave empty for auto-calculation"
                        className="bg-gray-700 text-white border-gray-600 font-mono"
                      />
                      <p className="text-xs text-gray-400">
                        Formula to calculate secondary medication content. Use "dose" variable. Auto-calculated from
                        concentration if empty.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxDose2" className="text-white">
                        Max Dose/Content (optional)
                      </Label>
                      <Input
                        id="maxDose2"
                        value={newOverride.maxDose2 || ""}
                        onChange={(e) => setNewOverride({ ...newOverride, maxDose2: e.target.value })}
                        placeholder="e.g., 125 or 10 * weightKg"
                        className="bg-gray-700 text-white border-gray-600 font-mono"
                      />
                      <p className="text-xs text-gray-400">
                        Maximum content limit for secondary medication. Supports numbers or weight-based formulas like
                        "10 * weightKg". Content will not exceed this value.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddOverride} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    {editingIndex !== null ? "Update Override" : "Add Override"}
                  </Button>
                  {editingIndex !== null && (
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="bg-gray-700 hover:bg-gray-600 text-white"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-yellow-500">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Active Overrides ({overrides.length})</CardTitle>
                  {overrides.length > 0 && (
                    <Button onClick={handleClearAll} variant="destructive" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {overrides.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No overrides configured. Click a medication above to add one.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {overrides.map((override, index) => (
                      <div
                        key={index}
                        className={`bg-gray-700 p-4 rounded-lg border ${editingIndex === index ? "border-green-500 border-2" : "border-gray-600"}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{override.medication}</h3>
                            {override.ageLabel && (
                              <div className="text-xs text-purple-300 mt-1">
                                Age Range: {override.ageLabel} ({override.minAgeMonths}-{override.maxAgeMonths} months)
                              </div>
                            )}
                            {override.weightLabel && (
                              <div className="text-xs text-cyan-300 mt-1">
                                Weight Range: {override.weightLabel} ({override.minWeightKg}-{override.maxWeightKg} kg)
                              </div>
                            )}
                            {!override.ageLabel &&
                              !override.weightLabel &&
                              (override.minAgeMonths !== undefined || override.minWeightKg !== undefined) && (
                                <div className="text-xs text-gray-400 mt-1">
                                  {override.minAgeMonths !== undefined &&
                                    `Age: ${override.minAgeMonths}-${override.maxAgeMonths} months`}
                                  {override.minAgeMonths !== undefined && override.minWeightKg !== undefined && " | "}
                                  {override.minWeightKg !== undefined &&
                                    `Weight: ${override.minWeightKg}-${override.maxWeightKg} kg`}
                                </div>
                              )}
                            {editingIndex === index && (
                              <div className="text-xs text-green-400 mt-1 font-semibold">✏️ Currently Editing</div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditOverride(index)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleRemoveOverride(index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Formula:</span>
                            <span className="text-green-300 ml-2 font-mono">{override.doseFormula}</span>
                          </div>
                          {override.concentrationMg && override.concentrationMl && (
                            <div>
                              <span className="text-gray-400">Concentration:</span>
                              <span className="text-cyan-300 ml-2">
                                {override.concentrationMg} mg / {override.concentrationMl} mL
                              </span>
                            </div>
                          )}
                          {override.doseMl && (
                            <div>
                              <span className="text-gray-400">mL Formula:</span>
                              <span className="text-cyan-300 ml-2 font-mono">{override.doseMl}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-400">Frequency:</span>
                            <span className="text-blue-300 ml-2">{override.frequency}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Reference:</span>
                            <span className="text-purple-300 ml-2">{override.reference}</span>
                          </div>
                          {override.referenceUrl && (
                            <div className="md:col-span-2">
                              <span className="text-gray-400">Reference URL:</span>
                              <a
                                href={override.referenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 ml-2 hover:underline break-all"
                              >
                                {override.referenceUrl}
                              </a>
                            </div>
                          )}
                          {override.maxDose && (
                            <div>
                              <span className="text-gray-400">Max Dose:</span>
                              <span className="text-yellow-300 ml-2">{override.maxDose} mg</span>
                            </div>
                          )}
                          {override.comment && (
                            <div className="md:col-span-2">
                              <span className="text-gray-400">Comment:</span>
                              <span className="text-gray-300 ml-2">{override.comment}</span>
                            </div>
                          )}
                          {override.medication2 && (
                            <div className="md:col-span-2 border-t border-gray-600 pt-2 mt-2">
                              <div className="text-sm font-semibold text-cyan-300 mb-2">
                                Secondary Component: {override.medication2}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {override.concentrationMg2 && override.concentrationMl2 && (
                                  <div>
                                    <span className="text-gray-400">Concentration:</span>
                                    <span className="text-cyan-300 ml-2">
                                      {override.concentrationMg2} mg / {override.concentrationMl2} mL
                                    </span>
                                  </div>
                                )}
                                {override.doseMl2 && (
                                  <div>
                                    <span className="text-gray-400">mL Formula:</span>
                                    <span className="text-cyan-300 ml-2 font-mono">{override.doseMl2}</span>
                                  </div>
                                )}
                                {override.maxDose2 && (
                                  <div>
                                    <span className="text-gray-400">Max Dose:</span>
                                    <span className="text-yellow-300 ml-2">{override.maxDose2}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="bg-gray-800 border-green-500">
              <CardHeader>
                <CardTitle className="text-white">Reference Summary - Direct Editor</CardTitle>
                <CardDescription className="text-gray-300">
                  Edit default medication values directly. Click Edit to modify any medication.
                </CardDescription>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search medications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 text-white border-gray-600"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredMedications.map((med) => (
                  <div
                    key={med.name}
                    className={`bg-gray-700 p-4 rounded border ${
                      inlineEditingMed === med.name
                        ? "border-green-500 border-2"
                        : med.isEdited
                          ? "border-green-500"
                          : "border-gray-600"
                    }`}
                  >
                    {inlineEditingMed === med.name && inlineEditData ? (
                      // Inline edit mode
                      <div className="space-y-3">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-semibold text-white">{med.name}</h3>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSaveInlineEdit}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              onClick={handleCancelInlineEdit}
                              size="sm"
                              variant="outline"
                              className="bg-gray-600 hover:bg-gray-500"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-gray-400">Dose Formula</Label>
                            <Input
                              value={inlineEditData.defaultFormula}
                              onChange={(e) => setInlineEditData({ ...inlineEditData, defaultFormula: e.target.value })}
                              className="bg-gray-600 text-white border-gray-500 font-mono text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-400">Frequency</Label>
                            <Input
                              value={inlineEditData.frequency}
                              onChange={(e) => setInlineEditData({ ...inlineEditData, frequency: e.target.value })}
                              className="bg-gray-600 text-white border-gray-500 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-400">Reference</Label>
                            <Input
                              value={inlineEditData.reference}
                              onChange={(e) => setInlineEditData({ ...inlineEditData, reference: e.target.value })}
                              className="bg-gray-600 text-white border-gray-500 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-400">Reference URL</Label>
                            <Input
                              value={inlineEditData.referenceUrl || ""}
                              onChange={(e) => setInlineEditData({ ...inlineEditData, referenceUrl: e.target.value })}
                              className="bg-gray-600 text-white border-gray-500 text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-gray-400">Concentration (mg)</Label>
                              <Input
                                type="number"
                                value={inlineEditData.concentrationMg || ""}
                                onChange={(e) =>
                                  setInlineEditData({
                                    ...inlineEditData,
                                    concentrationMg: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                                className="bg-gray-600 text-white border-gray-500 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-400">Concentration (mL)</Label>
                              <Input
                                type="number"
                                value={inlineEditData.concentrationMl || ""}
                                onChange={(e) =>
                                  setInlineEditData({
                                    ...inlineEditData,
                                    concentrationMl: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                                className="bg-gray-600 text-white border-gray-500 text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-400">Max Dose (mg)</Label>
                            <Input
                              type="number"
                              value={inlineEditData.maxDose || ""}
                              onChange={(e) =>
                                setInlineEditData({
                                  ...inlineEditData,
                                  maxDose: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                              className="bg-gray-600 text-white border-gray-500 text-sm"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-xs text-gray-400">Comment</Label>
                            <Input
                              value={inlineEditData.comment || ""}
                              onChange={(e) => setInlineEditData({ ...inlineEditData, comment: e.target.value })}
                              className="bg-gray-600 text-white border-gray-500 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Display mode
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-blue-300 flex items-center gap-2">
                              {med.name}
                              {med.isEdited && (
                                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">EDITED</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleStartInlineEdit(med)}
                              variant="ghost"
                              size="sm"
                              className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                              title="Edit medication values"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            {med.isEdited && (
                              <Button
                                onClick={() => handleRemoveDefaultEdit(med.name)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                title="Restore original values"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-300 space-y-1">
                          <div>
                            <span className="text-gray-400">Formula:</span>{" "}
                            <span className="font-mono text-green-300">{med.defaultFormula}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Frequency:</span> {med.frequency}
                          </div>
                          <div>
                            <span className="text-gray-400">Reference:</span> {med.reference}
                          </div>
                          {med.concentrationMg && med.concentrationMl && (
                            <div>
                              <span className="text-gray-400">Concentration:</span> {med.concentrationMg} mg /{" "}
                              {med.concentrationMl} mL
                            </div>
                          )}
                          {med.maxDose && (
                            <div>
                              <span className="text-gray-400">Max Dose:</span> {med.maxDose} mg
                            </div>
                          )}
                          {med.comment && (
                            <div>
                              <span className="text-gray-400">Comment:</span> {med.comment}
                            </div>
                          )}
                          {med.referenceUrl && (
                            <div>
                              <span className="text-gray-400">URL:</span>{" "}
                              <a
                                href={med.referenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline text-xs break-all"
                              >
                                {med.referenceUrl}
                              </a>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {/* Instructions */}
        <Card className="bg-gray-800 border-purple-500">
          <CardHeader>
            <CardTitle className="text-white">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-2 text-sm">
            <p>
              <strong className="text-white">Medication Overrides Tab:</strong> Add age-specific or general overrides
              for medications
            </p>
            <p>
              <strong className="text-white">Reference Summary Editor Tab:</strong> Edit default medication values
              directly with inline editing
            </p>
            <p className="text-yellow-400 pt-2">
              ⚠️ Keep this URL private: <code className="bg-gray-700 px-2 py-1 rounded">/admin-secret-panel</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
