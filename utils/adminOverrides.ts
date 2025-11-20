// Admin configuration overrides stored in localStorage
export interface MedicationOverride {
  medication: string
  doseFormula: string // e.g., "90 * weightKg", "30 * weightKg"
  frequency: string
  reference: string
  referenceUrl?: string // e.g., "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=..."
  maxDose?: number | string // Support formula like "90 * weightKg"
  comment?: string
  minAgeMonths?: number
  maxAgeMonths?: number
  ageLabel?: string // e.g., "3-36 months", "2-12 years"
  minWeightKg?: number // Added min weight range
  maxWeightKg?: number // Added max weight range
  weightLabel?: string // Added weight range label
  doseMl?: string
  concentrationMg?: number // e.g., 400 for 400mg/5mL
  concentrationMl?: number // e.g., 5 for 400mg/5mL
  medication2?: string
  concentrationMg2?: number
  concentrationMl2?: number
  doseMl2?: string
  maxDose2?: number | string // Support formula like "90 * weightKg"
}

export interface DefaultMedicationEdit {
  name: string
  defaultFormula: string
  frequency: string
  reference: string
  referenceUrl: string
  maxDose?: number
  comment?: string
  concentrationMg?: number
  concentrationMl?: number
  ageRanges?: Array<{
    min: number
    max: number
    formula: string
    label: string
  }>
}

import { DEFAULT_OVERRIDES } from "./defaultOverrides"

export function getAdminOverrides(): MedicationOverride[] {
  if (typeof window === "undefined") return [...DEFAULT_OVERRIDES]
  try {
    const overrides = localStorage.getItem("admin_medication_overrides")
    const localOverrides = overrides ? JSON.parse(overrides) : []
    // localStorage overrides take precedence
    return [...DEFAULT_OVERRIDES, ...localOverrides]
  } catch {
    return [...DEFAULT_OVERRIDES]
  }
}

export function saveAdminOverrides(overrides: MedicationOverride[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("admin_medication_overrides", JSON.stringify(overrides))
}

export function getOverrideForMedication(
  medication: string,
  ageInMonths?: number,
  weightKg?: number,
): MedicationOverride | null {
  const overrides = getAdminOverrides()

  console.log("[v0] Searching for override:", { medication, ageInMonths, weightKg })
  console.log(
    "[v0] Available overrides:",
    overrides.map((o) => ({
      name: o.medication,
      minAge: o.minAgeMonths,
      maxAge: o.maxAgeMonths,
      minWeight: o.minWeightKg,
      maxWeight: o.maxWeightKg,
    })),
  )

  // Try to match by age with optional weight restrictions
  if (ageInMonths !== undefined) {
    const matches = overrides.filter(
      (o) =>
        o.medication === medication &&
        o.minAgeMonths !== undefined &&
        o.maxAgeMonths !== undefined &&
        ageInMonths >= o.minAgeMonths &&
        ageInMonths <= o.maxAgeMonths,
    )

    console.log("[v0] Age-based matches found:", matches.length)

    // If we have weight, further filter by weight if weight restrictions exist
    if (weightKg !== undefined && matches.length > 0) {
      const weightFiltered = matches.filter((o) => {
        // Check min weight if defined
        if (o.minWeightKg !== undefined && weightKg < o.minWeightKg) return false
        // Check max weight if defined
        if (o.maxWeightKg !== undefined && weightKg > o.maxWeightKg) return false
        return true
      })
      if (weightFiltered.length > 0) {
        console.log("[v0] Found age+weight match!")
        return weightFiltered[0]
      }
    }

    // Return age-matched override even if no weight restrictions
    if (matches.length > 0) {
      console.log("[v0] Found age-only match!")
      return matches[0]
    }
  }

  // Try weight-only based match (no age restrictions)
  if (weightKg !== undefined) {
    const weightMatch = overrides.find(
      (o) =>
        o.medication === medication &&
        (o.minWeightKg !== undefined || o.maxWeightKg !== undefined) &&
        o.minAgeMonths === undefined &&
        o.maxAgeMonths === undefined &&
        (o.minWeightKg === undefined || weightKg >= o.minWeightKg) &&
        (o.maxWeightKg === undefined || weightKg <= o.maxWeightKg),
    )
    if (weightMatch) {
      console.log("[v0] Found weight-only match!")
      return weightMatch
    }
  }

  // General override (no age/weight restrictions)
  const generalOverride = overrides.find(
    (o) =>
      o.medication === medication &&
      o.minAgeMonths === undefined &&
      o.maxAgeMonths === undefined &&
      o.minWeightKg === undefined &&
      o.maxWeightKg === undefined,
  )

  if (generalOverride) {
    console.log("[v0] Found general override!")
  } else {
    console.log("[v0] No override found for this medication")
  }

  return generalOverride || null
}

export function clearAdminOverrides(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("admin_medication_overrides")
}

const STORAGE_KEY_DEFAULTS = "medicationDefaultEdits"

export function getDefaultMedicationEdits(): DefaultMedicationEdit[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DEFAULTS)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveDefaultMedicationEdits(edits: DefaultMedicationEdit[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY_DEFAULTS, JSON.stringify(edits))
}

export function getDefaultMedicationEdit(medicationName: string): DefaultMedicationEdit | null {
  const edits = getDefaultMedicationEdits()
  return edits.find((edit) => edit.name === medicationName) || null
}

export function exportOverridesToCode(): string {
  const overrides = getAdminOverrides()
  return `// Default medication overrides
export const DEFAULT_OVERRIDES: MedicationOverride[] = ${JSON.stringify(overrides, null, 2)}`
}
