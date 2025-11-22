import { getOverrideForMedication, getDefaultMedicationEdit } from "./adminOverrides"

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
  maxDoseReached?: string
} {
  console.log("[v0] === DOSE CALCULATION START ===")
  console.log("[v0] Medication:", medication)
  console.log("[v0] Weight:", weightKg, "kg")
  console.log("[v0] Age:", ageInMonths, "months")

  const override = getOverrideForMedication(medication, ageInMonths, weightKg)

  console.log("[v0] Override found:", override ? "YES" : "NO")
  if (override) {
    console.log("[v0] Override details:", JSON.stringify(override, null, 2))
  }

  if (override) {
    try {
      console.log("[v0] Using override for calculation")
      console.log("[v0] Patient weight:", weightKg)
      console.log("[v0] Max weight limit:", override.maxWeightKg)
      console.log("[v0] Max dose limit:", override.maxDose)
      console.log("[v0] Max dose 2 limit:", override.maxDose2)

      const dose = eval(
        override.doseFormula.replace(/weightKg/g, String(weightKg)).replace(/ageInMonths/g, String(ageInMonths)),
      )

      console.log("[v0] Calculated dose from formula:", dose, "mg")

      let finalDose = dose
      const comment = override.comment
      let maxDoseReached: string | undefined

      if (override.maxWeightKg && weightKg > override.maxWeightKg) {
        console.log("[v0] ⚠️ WEIGHT EXCEEDS MAX!")
        console.log("[v0] Patient weight:", weightKg, "kg")
        console.log("[v0] Max weight:", override.maxWeightKg, "kg")

        const maxWeightDose = eval(
          override.doseFormula
            .replace(/weightKg/g, String(override.maxWeightKg))
            .replace(/ageInMonths/g, String(ageInMonths)),
        )

        console.log("[v0] Dose capped to max weight dose:", maxWeightDose, "mg")
        finalDose = maxWeightDose
      }

      if (override.maxDose) {
        let maxDoseValue: number

        if (typeof override.maxDose === "string") {
          console.log("[v0] Evaluating maxDose formula:", override.maxDose)
          maxDoseValue = eval(
            override.maxDose.replace(/weightKg/g, String(weightKg)).replace(/ageInMonths/g, String(ageInMonths)),
          )
        } else {
          maxDoseValue = override.maxDose
        }

        console.log("[v0] Checking primary max dose")
        console.log("[v0] Current dose:", finalDose, "mg")
        console.log("[v0] Max allowed:", maxDoseValue, "mg")

        if (finalDose > maxDoseValue) {
          console.log("[v0] ⚠️ PRIMARY DOSE EXCEEDS MAX!")
          const originalDose = finalDose
          finalDose = maxDoseValue

          if (override.maxWeightKg && weightKg > override.maxWeightKg) {
            maxDoseReached = `Maximum weight and dose limits exceeded: Patient weight (${weightKg} kg) exceeds maximum pediatric weight limit (${override.maxWeightKg} kg). Calculated dose at ${override.maxWeightKg} kg was ${Math.round(originalDose)} mg/day, but has been further capped at the maximum safe dose of ${maxDoseValue} mg/day. Consider following adult dosing regimen for patients over ${override.maxWeightKg} kg.`
          } else {
            maxDoseReached = `Maximum dose limit reached: Calculated dose was ${Math.round(dose)} mg, but it has been capped at the maximum safe dose of ${maxDoseValue} mg/day for this medication.`
          }
        } else if (override.maxWeightKg && weightKg > override.maxWeightKg) {
          maxDoseReached = `Maximum weight limit exceeded: Patient weight (${weightKg} kg) exceeds maximum pediatric weight limit (${override.maxWeightKg} kg). Current calculation shows maximum safe pediatric dose: ${Math.round(finalDose)} mg/day (calculated at ${override.maxWeightKg} kg). Consider following adult dosing regimen for patients over ${override.maxWeightKg} kg.`
        }
      } else if (override.maxWeightKg && weightKg > override.maxWeightKg) {
        maxDoseReached = `Maximum weight limit exceeded: Patient weight (${weightKg} kg) exceeds maximum pediatric weight limit (${override.maxWeightKg} kg). Current calculation shows maximum safe pediatric dose: ${Math.round(finalDose)} mg/day (calculated at ${override.maxWeightKg} kg). Consider following adult dosing regimen for patients over ${override.maxWeightKg} kg.`
      }

      let doseMl = 0
      if (override.doseMl && override.doseMl.trim() !== "") {
        const cleanFormula = override.doseMl.trim()

        const isPlaceholder =
          cleanFormula.includes("Formula") ||
          cleanFormula.includes("formula") ||
          cleanFormula.includes("optional") ||
          cleanFormula.includes("Concentration") ||
          cleanFormula.includes("leave empty")

        if (!isPlaceholder) {
          try {
            if (cleanFormula.toLowerCase().includes("dose") || !isNaN(Number(cleanFormula))) {
              const mlFormula = cleanFormula.replace(/dose/gi, String(finalDose))
              doseMl = eval(
                mlFormula.replace(/weightKg/g, String(weightKg)).replace(/ageInMonths/g, String(ageInMonths)),
              )
            }
          } catch (mlError) {
            console.error("[v0] Error evaluating mL formula:", mlError)
          }
        }
      }

      if (doseMl === 0 && override.concentrationMg && override.concentrationMl) {
        let dosesPerDay = 1
        const freqLower = override.frequency.toLowerCase()
        if (freqLower.includes("12 hours") || freqLower.includes("twice")) {
          dosesPerDay = 2
        } else if (freqLower.includes("8 hours")) {
          dosesPerDay = 3
        } else if (freqLower.includes("6 hours")) {
          dosesPerDay = 4
        } else if (freqLower.includes("4 hours")) {
          dosesPerDay = 6
        } else if (freqLower.includes("5 times")) {
          dosesPerDay = 5
        }

        doseMl = (finalDose * override.concentrationMl) / override.concentrationMg / dosesPerDay
        console.log("[v0] Auto-calculated doseMl:", doseMl, "mL (", dosesPerDay, "doses/day)")
      }

      if (
        !maxDoseReached &&
        override.medication2 &&
        override.maxDose2 &&
        override.concentrationMg2 &&
        override.concentrationMl2
      ) {
        let dosesPerDay = 1
        const freqLower = override.frequency.toLowerCase()
        if (freqLower.includes("12 hours") || freqLower.includes("twice")) {
          dosesPerDay = 2
        } else if (freqLower.includes("8 hours")) {
          dosesPerDay = 3
        } else if (freqLower.includes("6 hours")) {
          dosesPerDay = 4
        } else if (freqLower.includes("4 hours")) {
          dosesPerDay = 6
        } else if (freqLower.includes("5 times")) {
          dosesPerDay = 5
        }

        // Calculate the secondary medication content from the mL dose
        const secondaryContent = (doseMl * dosesPerDay * override.concentrationMg2) / override.concentrationMl2

        // Evaluate maxDose2 formula if it's a string (e.g., "10 * weightKg")
        let maxDose2Value: number

        if (typeof override.maxDose2 === "string") {
          console.log("[v0] Evaluating maxDose2 formula:", override.maxDose2)
          maxDose2Value = eval(
            override.maxDose2.replace(/weightKg/g, String(weightKg)).replace(/ageInMonths/g, String(ageInMonths)),
          )
        } else {
          maxDose2Value = override.maxDose2
        }

        console.log("[v0] Checking secondary medication (", override.medication2, ")")
        console.log("[v0] Secondary content:", secondaryContent, "mg/day")
        console.log("[v0] Max allowed:", maxDose2Value, "mg/day")

        if (secondaryContent > maxDose2Value) {
          console.log("[v0] ⚠️ SECONDARY MEDICATION EXCEEDS MAX!")

          // Cap the mL dose based on secondary medication limit
          const maxMlPerDose = (maxDose2Value * override.concentrationMl2) / (override.concentrationMg2 * dosesPerDay)
          doseMl = maxMlPerDose

          console.log("[v0] Capping mL dose to:", doseMl, "mL per dose")

          // Recalculate primary dose based on capped mL
          if (override.concentrationMg && override.concentrationMl) {
            finalDose = (doseMl * dosesPerDay * override.concentrationMg) / override.concentrationMl
            console.log("[v0] Primary dose adjusted to:", finalDose, "mg/day")
          }

          maxDoseReached = `Maximum dose limit reached for ${override.medication2}: Calculated content was ${Math.round(secondaryContent)} mg/day, but it has been capped at the maximum safe dose of ${maxDose2Value} mg/day. Primary medication (${medication}) dose adjusted accordingly to ${Math.round(finalDose)} mg/day.`
        }
      }

      console.log("[v0] === FINAL RESULTS ===")
      console.log("[v0] Final dose:", finalDose, "mg")
      console.log("[v0] Final doseMl:", doseMl, "mL")
      console.log("[v0] Max dose alert:", maxDoseReached || "NONE")
      console.log("[v0] === DOSE CALCULATION END ===")

      const url = override.referenceUrl || ""
      let referenceLabel = "Reference"

      if (override.referenceUrl) {
        if (override.referenceUrl.includes("dailymed")) {
          referenceLabel = "DailyMed - " + override.medication
        } else if (override.referenceUrl.includes("lexi.com")) {
          referenceLabel = "LEXICOMP - " + override.medication
        } else if (override.referenceUrl.includes("drugs.com")) {
          referenceLabel = "Drugs.com - " + override.medication
        } else {
          referenceLabel = "Reference - " + override.medication
        }
      }

      return {
        dose: Math.round(finalDose * 10) / 10,
        doseMl: Math.round(doseMl * 100) / 100,
        frequency: override.frequency,
        reference: override.reference || "",
        url,
        referenceLabel,
        comment,
        maxDoseReached,
      }
    } catch (error) {
      console.error("Error evaluating override formula:", error)
    }
  }

  const defaultEdit = getDefaultMedicationEdit(medication)

  let dose = 0
  let doseMl = 0
  let frequency = ""
  let reference = ""
  let url = ""
  let referenceLabel = ""
  let comment: string | undefined
  let maxDose: number | undefined
  let maxDoseReached: string | undefined

  if (defaultEdit) {
    try {
      // Find matching age range if exists
      let formulaToUse = defaultEdit.defaultFormula
      if (defaultEdit.ageRanges) {
        const matchingRange = defaultEdit.ageRanges.find(
          (range) => ageInMonths >= range.min && ageInMonths <= range.max,
        )
        if (matchingRange) {
          formulaToUse = matchingRange.formula
        }
      }

      dose = eval(formulaToUse.replace(/weightKg/g, String(weightKg)).replace(/ageInMonths/g, String(ageInMonths)))
      frequency = defaultEdit.frequency
      reference = defaultEdit.reference
      url = defaultEdit.referenceUrl
      referenceLabel = `DailyMed - ${medication} Reference`
      comment = defaultEdit.comment
      maxDose = defaultEdit.maxDose

      // Calculate mL dose based on concentration
      if (defaultEdit.concentrationMg && defaultEdit.concentrationMl) {
        let dosesPerDay = 1
        const freqLower = frequency.toLowerCase()
        if (freqLower.includes("12 hours") || freqLower.includes("twice")) {
          dosesPerDay = 2
        } else if (freqLower.includes("8 hours")) {
          dosesPerDay = 3
        } else if (freqLower.includes("6 hours")) {
          dosesPerDay = 4
        } else if (freqLower.includes("4 hours")) {
          dosesPerDay = 6
        } else if (freqLower.includes("5 times")) {
          dosesPerDay = 5
        }

        doseMl = (dose * defaultEdit.concentrationMl) / defaultEdit.concentrationMg / dosesPerDay
      }

      // Check max dose
      if (maxDose && dose > maxDose) {
        const originalDose = dose
        dose = maxDose
        doseMl =
          (dose * (defaultEdit.concentrationMl || 5)) /
          (defaultEdit.concentrationMg || 400) /
          (frequency.includes("12 hours")
            ? 2
            : frequency.includes("8 hours")
              ? 3
              : frequency.includes("6 hours")
                ? 4
                : 1)
        maxDoseReached = `Maximum weight limit exceeded: Patient weight (${weightKg} kg) exceeds maximum pediatric weight limit (${override.maxWeightKg} kg). Current calculation shows maximum safe pediatric dose: ${Math.round(dose)} mg/day (calculated at ${override.maxWeightKg} kg). Consider following adult dosing regimen for patients over ${override.maxWeightKg} kg.`
      }

      return {
        dose: Number(dose.toFixed(1)),
        doseMl: Number(doseMl.toFixed(2)),
        frequency,
        reference,
        url,
        referenceLabel,
        comment,
        maxDoseReached,
      }
    } catch (error) {
      console.error("Error using edited default medication:", error)
    }
  }

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
        maxDose = 1000 // Set max dose
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
        dose = 12 * weightKg // Updated to 12 mg/kg as per user's example
        maxDose = 500 // Set max dose to 500mg
        doseMl = Number(((dose * 5) / 200).toFixed(1))
        frequency = "Once daily"
        reference = "10-12 mg/kg/day (3mo-12y)"
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
      url =
        "https://online.lexi.com/lco/action/doc/retrieve/docid/pdh_f/129791?cesid=9zMcYVtKhP7&searchUrl=%2Flco%2Faction%2Fsearch%3Fq%3Dacetaminophen%26t%3Dname%26acs%3Dtrue%26acq%3Daceta#don"
      referenceLabel = "LEXICOMP - Nitrofurantoin"
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
      referenceLabel = "LEXICOMP - PANADOL BABY and INFANT"
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
        reference = "Adult dose: 200-400 mg every 4-6 hours"
      }
      url = "https://online.lexi.com/lco/action/doc/retrieve/docid/pdh_f/129889"
      referenceLabel = "LEXICOMP - ADOL DROPS"
      break

    case "BRUFEN PAEDIATRIC SYRUP 100 MG/5 ML":
      if (ageInMonths >= 6 && ageInMonths < 144 && weightKg >= 5) {
        dose = 10 * weightKg
        doseMl = Number(((dose * 5) / 100).toFixed(1))
        frequency = "Every 6-8 hours as needed"
        reference = "5-10 mg/kg/dose"
        if (doseMl * 4 > 40 * weightKg) {
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

  // No need to repeat the maxWeightKg check here as it's already handled in the override section

  return {
    dose: Number(dose.toFixed(1)),
    doseMl: Number(doseMl.toFixed(2)),
    frequency,
    reference,
    url,
    referenceLabel,
    comment,
    maxDoseReached,
  }
}
