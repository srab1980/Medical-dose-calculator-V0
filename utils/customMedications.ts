export interface CustomMedication {
  name: string
  category: "antibiotics" | "other"
  defaultFormula: string
  frequency: string
  reference: string
  referenceUrl?: string
  concentrationMg?: number
  concentrationMl?: number
  maxDose?: number | string
  comment?: string
  ageRanges?: Array<{
    min: number
    max: number
    formula: string
    label: string
  }>
}

const STORAGE_KEY = "customMedications"

export function getCustomMedications(): CustomMedication[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveCustomMedications(medications: CustomMedication[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(medications))
}

export function addCustomMedication(medication: CustomMedication): void {
  const existing = getCustomMedications()
  existing.push(medication)
  saveCustomMedications(existing)
}

export function removeCustomMedication(medicationName: string): void {
  const existing = getCustomMedications()
  const filtered = existing.filter((m) => m.name !== medicationName)
  saveCustomMedications(filtered)
}

export function updateCustomMedication(medicationName: string, updatedMedication: CustomMedication): void {
  const existing = getCustomMedications()
  const index = existing.findIndex((m) => m.name === medicationName)
  if (index >= 0) {
    existing[index] = updatedMedication
    saveCustomMedications(existing)
  }
}
