// medicationData.ts

interface Medication {
  name: string
  category: string
  dosing?: string
  reference?: string
}

// Antibiotics medications
const antibiotics: Medication[] = [
  {
    name: "Augmentin 457",
    category: "antibiotics",
    reference: "50-90 mg/kg/day (3mo-12y), 30 mg/kg/day (<3mo)",
  },
  {
    name: "Augmentin ES 600",
    category: "antibiotics",
    reference: "50-90 mg/kg/day (3mo-12y), 30 mg/kg/day (<3mo)",
  },
  {
    name: "Zinnat 125",
    category: "antibiotics",
    reference: "30 mg/kg/day (3mo-12y), max 1000 mg/day",
  },
  {
    name: "Zinnat 250",
    category: "antibiotics",
    reference: "30 mg/kg/day (3mo-12y), max 1000 mg/day",
  },
  {
    name: "Klacid 125",
    category: "antibiotics",
    reference: "15 mg/kg/day (3mo-12y)",
  },
  {
    name: "Klacid 250",
    category: "antibiotics",
    reference: "15 mg/kg/day (3mo-12y)",
  },
  {
    name: "Metronidazole 125",
    category: "antibiotics",
    reference: "35-50 mg/kg/day (3mo-12y)",
  },
  {
    name: "Metronidazole 250",
    category: "antibiotics",
    reference: "35-50 mg/kg/day (3mo-12y)",
  },
  {
    name: "Zithromax",
    category: "antibiotics",
    reference: "10 -12 mg/kg/day (3mo-12y)",
  },
  {
    name: "Suprax 100",
    category: "antibiotics",
    reference: "8 mg/kg/day (3mo-12y)",
  },
  {
    name: "Amoxicillin 250",
    category: "antibiotics",
    reference: "40-45 mg/kg/day (3mo-12y)",
  },
  {
    name: "Zovirax",
    category: "antibiotics",
    reference: "80 mg/kg/day (2y-12y)",
  },
  {
    name: "Septrin (SULFAMETHOXAZOLE)",
    category: "antibiotics",
    reference: "75-100 mg/kg/day (3mo-12y)",
  },
  {
    name: "Septrin (TRIMETHOPRIM)",
    category: "antibiotics",
    reference: "15-20 mg/kg/day (3mo-12y)",
  },
  {
    name: "Nystatin",
    category: "antibiotics",
    reference: "800,000 units/day (<12mo), 2,400,000 units/day (1y-12y)",
  },
  {
    name: "Nitrofurantoin",
    category: "antibiotics",
    reference: "5-7 mg/kg/day (3mo-12y)",
  },
]

// Other medications
const other: Medication[] = [
  {
    name: "PANADOL BABY and INFANT 120 MG/5ML",
    category: "other",
    reference: "60 mg/kg/day, max 4000 mg/day",
  },
  {
    name: "PANADOL Elixir 240 MG/5ML",
    category: "other",
    reference: "60 mg/kg/day, max 4000 mg/day",
  },
  {
    name: "ADOL DROPS 100 MG/ML",
    category: "other",
    reference: "10-15 mg/kg/dose, , max 40 mg/kg/day (<2m), max 60 mg/kg/day (>2m)",
  },
  {
    name: "BRUFEN PAEDIATRIC SYRUP 100 MG/5 ML",
    category: "other",
    reference: "5-10 mg/kg/dose, max 40 mg/kg/day",
  },
  {
    name: "AERIUS  SYRUP 0.5 MG/ML",
    category: "other",
    reference: "1-5 mg daily based on age",
  },
  {
    name: "ZYRTEC SYRUP 1 MG/ML",
    category: "other",
    reference: "2.5-10 mg daily based on age",
  },
  {
    name: "DEPAKINE 57.64MG/ML SYRUP",
    category: "other",
    reference: "10-30 mg/kg/day based on age",
  },
  {
    name: "DEPAKINE DROPS 200 MG/ML",
    category: "other",
    reference: "10-30 mg/kg/day based on age",
  },
  {
    name: "TEGRETOL 100 MG/5 ML",
    category: "other",
    reference: "5-10 mg/kg/day (<6y), 200 mg/day initial (≥6y)",
  },
  {
    name: "TRILEPTAL 60 MG/ML",
    category: "other",
    reference: "8-10 mg/kg/day, max 600 mg/day (≥4y)",
  },
]

// Export the data structure that matches what the component expects
export const medicationData = {
  antibiotics,
  other,
}

// Also export as default for backward compatibility
export default medicationData
