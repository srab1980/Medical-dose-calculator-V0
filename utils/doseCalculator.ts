export function calculateDose(
  medication: string,
  weightKg: number,
  ageInMonths: number,
): {
  dose: number
  doseMl: number
  frequency: string
  reference: string
  url: string
  referenceLabel: string
  comment?: string
} {
  let dose = 0
  let doseMl = 0
  let frequency = ""
  let reference = ""
  let url = ""
  let referenceLabel = ""
  let comment: string | undefined

  switch (medication) {
    // Antibiotics
    case "Augmentin 457":
    case "Augmentin ES 600":
      if (ageInMonths >= 3 && ageInMonths < 144) {
        dose = 90 * weightKg
        reference = "90 mg/kg/day"
      } else if (ageInMonths < 3) {
        dose = 30 * weightKg
        reference = "30 mg/kg/day"
      }
      doseMl = Number(((dose * 5) / (medication === "Augmentin 457" ? 400 : 600) / 2).toFixed(1))
      frequency = "Every 12 hours"
      url = "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=b897c800-24a2-4e76-8668-498c5515c3d0"
      referenceLabel = `Dailymed - ${medication} Reference`
      break

    case "Zinnat 125":
    case "Zinnat 250":
      if (ageInMonths >= 3 && ageInMonths < 144) {
        dose = 30 * weightKg
        if (dose > 1000) {
          dose = 1000
          comment = "Maximum daily dose is 1000 mg"
        }
        reference = "30 mg/kg/day"
        doseMl = Number(((dose * 5) / (medication === "Zinnat 125" ? 125 : 250) / 2).toFixed(1))
      }
      frequency = "Every 12 hours"
      url = "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=135e2dfc-eb47-4d04-a903-a081d36c267e"
      referenceLabel = "Dailymed - Zinnat Reference"
      break

    case "Klacid 125":
    case "Klacid 250":
      if (ageInMonths >= 3 && ageInMonths < 144) {
        dose = 15 * weightKg
        doseMl = Number(((dose * 5) / (medication === "Klacid 125" ? 125 : 250) / 2).toFixed(1))
        frequency = "Every 12 hours"
        reference = "15 mg/kg/day"
      }
      url = "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=22457862-0f88-4be8-b507-1c8f264269f2"
      referenceLabel = "Dailymed - Klacid Reference"
      break

    case "Metronidazole 125":
    case "Metronidazole 250":
      if (ageInMonths >= 3 && ageInMonths < 144) {
        dose = 50 * weightKg
        doseMl = Number(((dose * 5) / (medication === "Metronidazole 125" ? 125 : 250) / 3).toFixed(1))
        frequency = "Every 8 hours"
        reference = "50 mg/kg/day"
      }
      url = "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=23927a8b-1641-4104-aa85-d7b7bf4ebb9d"
      referenceLabel = "Dailymed - Metronidazole Reference"
      break

    case "Zithromax":
      if (ageInMonths >= 3 && ageInMonths < 144) {
        dose = 30 * weightKg
        doseMl = Number(((dose * 5) / 200).toFixed(1))
        frequency = "Once daily"
        reference = "30 mg/kg/day"
      }
      url = "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=071e71b8-bb53-4075-9bda-2ec48affa018"
      referenceLabel = "Dailymed - Zithromax Reference"
      break

    case "Suprax 100":
      if (ageInMonths >= 3 && ageInMonths < 144) {
        dose = 8 * weightKg
        doseMl = Number(((dose * 5) / 100).toFixed(1))
        frequency = "Once daily"
        reference = "8 mg/kg/day"
      }
      url = "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=068e6edd-a5fe-40d8-8dcf-ac82b78dced4"
      referenceLabel = "Dailymed - Suprax 100 Reference"
      break

    case "Amoxicillin 250":
      if (ageInMonths >= 3 && ageInMonths < 144) {
        dose = 45 * weightKg
        doseMl = Number(((dose * 5) / 250 / 2).toFixed(1))
        frequency = "Every 12 hours"
        reference = "45 mg/kg/day"
      }
      url = "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=649d285c-8fcb-48dd-aa5e-2f34128102f5"
      referenceLabel = "Dailymed - Amoxicillin 250 Reference"
      break

    case "Septrin (SULFAMETHOXAZOLE)":
      if (ageInMonths >= 3 && ageInMonths < 144) {
        dose = 100 * weightKg
        doseMl = Number(((dose * 5) / 400 / 2).toFixed(1)) // Assuming 400mg/5ml concentration
        frequency = "Every 12 hours"
        reference = "100 mg/kg/day"
      }
      url = "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a4468b8e-2f84-4742-94e6-77b1e0b24a6f"
      referenceLabel = "Dailymed - Septrin (Sulfamethoxazole) Reference"
      break

    case "Septrin (TRIMETHOPRIM)":
      if (ageInMonths >= 3 && ageInMonths < 144) {
        dose = 20 * weightKg
        doseMl = Number(((dose * 5) / 80 / 2).toFixed(1)) // Assuming 80mg/5ml concentration
        frequency = "Every 12 hours"
        reference = "20 mg/kg/day"
      }
      url = "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a4468b8e-2f84-4742-94e6-77b1e0b24a6f"
      referenceLabel = "Dailymed - Septrin (Trimethoprim) Reference"
      break

    case "Zovirax":
      if (ageInMonths >= 24 && ageInMonths < 144) {
        dose = 80 * weightKg
        doseMl = Number(((dose * 5) / 400 / 5).toFixed(1)) // Assuming 400mg/5ml, 5 times daily
        frequency = "5 times daily"
        reference = "80 mg/kg/day (2y-12y)"
      } else if (ageInMonths < 24) {
        dose = 0
        doseMl = 0
        frequency = "Not recommended"
        reference = "Not recommended for children under 2 years"
        comment = "Consult pediatric specialist for children under 2 years"
      }
      url = "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=c6c9f8b8-2f84-4742-94e6-77b1e0b24a6f"
      referenceLabel = "Dailymed - Zovirax Reference"
      break

    case "Nystatin":
      if (ageInMonths < 3) {
        dose = 800000 // 800,000 units/day
        doseMl = Number((dose / 100000).toFixed(1)) // Assuming 100,000 units/ml
        frequency = "4 times daily"
        reference = "800,000 units/day (<3mo)"
      } else if (ageInMonths >= 3 && ageInMonths < 144) {
        dose = 2400000 // 2,400,000 units/day
        doseMl = Number((dose / 100000 / 4).toFixed(1)) // Divided by 4 for QID dosing
        frequency = "4 times daily"
        reference = "2,400,000 units/day (3mo-12y)"
      }
      url = "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d6c9f8b8-2f84-4742-94e6-77b1e0b24a6f"
      referenceLabel = "Dailymed - Nystatin Reference"
      break

    case "Nitrofurantoin":
      if (ageInMonths >= 3 && ageInMonths < 144) {
        dose = 1 * weightKg // 1 mg/kg/day for prophylaxis
        doseMl = Number(((dose * 5) / 25).toFixed(1)) // Assuming 25mg/5ml suspension
        frequency = "Once daily at bedtime"
        reference = "1 mg/kg/day (3mo-12y)"
        comment = "For UTI prophylaxis - take with food"
      }
      url = "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e6c9f8b8-2f84-4742-94e6-77b1e0b24a6f"
      referenceLabel = "Dailymed - Nitrofurantoin Reference"
      break

    // Other Medications
    case "PANADOL BABY and INFANT 120 MG/5ML":
    case "PANADOL Elixir 240 MG/5ML":
      if (ageInMonths >= 3 && ageInMonths < 144 && weightKg <= 40) {
        dose = 75 * weightKg
        doseMl = Number(((dose * 5) / (medication === "PANADOL BABY and INFANT 120 MG/5ML" ? 120 : 240) / 6).toFixed(1))
        frequency = "Every 4 hours"
        reference = "75 mg/kg/day"
        if (doseMl * 6 > 4000) {
          comment = "Maximum daily Dose 4,000 mg/day"
        }
      } else if (weightKg > 40 || ageInMonths >= 144) {
        comment = "Patient should use adult dose"
        dose = 0
        doseMl = 0
        frequency = "N/A"
        reference = "N/A"
      }
      url =
        "https://online.lexi.com/lco/action/doc/retrieve/docid/pdh_f/129791?cesid=9zMcYVtKhP7&searchUrl=%2Flco%2Faction%2Fsearch%3Fq%3Dacetaminophen%26t%3Dname%26acs%3Dtrue%26acq%3Daceta#don"
      referenceLabel = `LEXICOMP - ${medication}`
      break

    case "ADOL DROPS 100 MG/ML":
      if (ageInMonths >= 3 && ageInMonths < 144 && weightKg <= 40) {
        dose = 15 * weightKg
        doseMl = Number((dose / 100).toFixed(1))
        frequency = "Every 4-6 hours as needed"
        reference = "10-15 mg/kg/dose"
        if (dose * 4 > 60 * weightKg) {
          comment = "Maximum daily dose: 60 mg/kg/day"
        }
      } else if (weightKg > 40 || ageInMonths >= 144) {
        comment = "Use adult dosing"
        dose = 500
        doseMl = 5
        frequency = "Every 4-6 hours as needed"
        reference = "Adult dose: 500-1000 mg every 4-6 hours"
      }
      url = "https://online.lexi.com/lco/action/doc/retrieve/docid/pdh_f/129791"
      referenceLabel = "LEXICOMP - ADOL DROPS"
      break

    case "BRUFEN PAEDIATRIC SYRUP 100 MG/5 ML":
      if (ageInMonths >= 6 && ageInMonths < 144 && weightKg >= 5) {
        dose = 10 * weightKg
        doseMl = Number(((dose * 5) / 100).toFixed(1))
        frequency = "Every 6-8 hours as needed"
        reference = "5-10 mg/kg/dose"
        if (dose * 4 > 40 * weightKg) {
          comment = "Maximum daily dose: 40 mg/kg/day"
        }
      } else if (weightKg > 40 || ageInMonths >= 144) {
        comment = "Use adult dosing"
        dose = 400
        doseMl = 20
        frequency = "Every 4-6 hours as needed"
        reference = "Adult dose: 200-400 mg every 4-6 hours"
      }
      url = "https://online.lexi.com/lco/action/doc/retrieve/docid/pdh_f/129889"
      referenceLabel = "LEXICOMP - BRUFEN PAEDIATRIC SYRUP"
      break

    case "AERIUS  SYRUP 0.5 MG/ML":
      if (ageInMonths >= 6 && ageInMonths <= 11) {
        dose = 1
        doseMl = 2
        reference = "Infants 6 to 11 months: 1 mg once daily"
      } else if (ageInMonths > 11 && ageInMonths <= 60) {
        dose = 1.25
        doseMl = 2.5
        reference = "Children 1 to 5 years: 1.25 mg once daily"
      } else if (ageInMonths > 60 && ageInMonths <= 132) {
        dose = 2.5
        doseMl = 5
        reference = "Children 6 to 11 years: 2.5 mg once daily"
      } else if (ageInMonths > 132) {
        dose = 5
        doseMl = 10
        reference = "Children 12 years and older: 5 mg once daily"
      } else {
        dose = 0
        doseMl = 0
        reference = "Not recommended for infants under 6 months"
      }
      frequency = "Once daily"
      url = "https://online.lexi.com/lco/action/doc/retrieve/docid/pdh_f/130064"
      referenceLabel = "LEXICOMP - AERIUS  SYRUP"
      break

    case "ZYRTEC SYRUP 1 MG/ML":
      if (ageInMonths >= 6 && ageInMonths < 24) {
        dose = 2.5
        doseMl = 2.5
        reference = "Infants 6 months to Children <2 years: 2.5 mg once daily"
      } else if (ageInMonths >= 24 && ageInMonths <= 60) {
        dose = 2.5
        doseMl = 2.5
        reference = "Children 2 to 5 years: 2.5 to 5 mg once daily"
        comment = "May increase to 5 mg daily if needed"
      } else if (ageInMonths > 60) {
        dose = 5
        doseMl = 5
        reference = "Children >5 years and Adolescents: 5 to 10 mg once daily"
        comment = "May increase to 10 mg daily if needed"
      } else {
        dose = 0
        doseMl = 0
        reference = "Not recommended for infants under 6 months"
      }
      frequency = "Once daily"
      url = "https://online.lexi.com/lco/action/doc/retrieve/docid/pdh_f/6496808"
      referenceLabel = "LEXICOMP - ZYRTEC SYRUP"
      break

    case "DEPAKINE 57.64MG/ML SYRUP":
    case "DEPAKINE DROPS 200 MG/ML":
      if (ageInMonths <= 3) {
        dose = 20 * weightKg
        frequency = "Twice daily"
        reference = "Neonate and Infant ≤3 months: Initial: 10 to 20 mg/kg/day"
      } else {
        dose = 30 * weightKg
        frequency = "2-3 times daily"
        reference = "Children >3 months: Initial: 15 to 30 mg/kg/day"
      }
      doseMl = Number((dose / (medication === "DEPAKINE 57.64MG/ML SYRUP" ? 57.64 : 200)).toFixed(1))
      comment = "Titrate dose based on clinical response and serum concentrations"
      url = "https://online.lexi.com/lco/action/doc/retrieve/docid/pdh_f/129988"
      referenceLabel = "LEXICOMP - DEPAKINE"
      break

    case "TEGRETOL 100 MG/5 ML":
      if (ageInMonths < 72) {
        dose = 10 * weightKg
        doseMl = Number(((dose * 5) / 100).toFixed(1))
        frequency = "2-3 times daily"
        reference = "Children <6 years: Initial: 5 to 10 mg/kg/day"
      } else {
        dose = 200
        doseMl = 10
        frequency = "2-3 times daily"
        reference = "Children ≥6 years and Adolescents: Initial: 200 mg/day"
      }
      comment = "Titrate dose based on clinical response and serum concentrations"
      url = "https://online.lexi.com/lco/action/doc/retrieve/docid/pdh_f/129819"
      referenceLabel = "LEXICOMP - TEGRETOL"
      break

    case "TRILEPTAL 60 MG/ML":
      if (ageInMonths >= 1 && ageInMonths < 48) {
        dose = 8 * weightKg
        doseMl = Number((dose / 60).toFixed(1))
        frequency = "Twice daily"
        reference = "Children 1 month to <4 years: Initial: 8 to 10 mg/kg/day"
      } else if (ageInMonths >= 48) {
        dose = 8 * weightKg
        if (dose > 600) dose = 600
        doseMl = Number((dose / 60).toFixed(1))
        frequency = "Twice daily"
        reference = "Children ≥4 years and Adolescents: Initial: 8 to 10 mg/kg/day; Max: 600 mg/day"
      } else {
        dose = 0
        doseMl = 0
        reference = "Not recommended for infants <1 month"
      }
      comment = "Titrate dose based on clinical response"
      url = "https://online.lexi.com/lco/action/doc/retrieve/docid/pdh_f/129936"
      referenceLabel = "LEXICOMP - TRILEPTAL SUSPENSION"
      break

    default:
      throw new Error("Medication not found")
  }

  return { dose, doseMl, frequency, reference, url, referenceLabel, comment }
}
