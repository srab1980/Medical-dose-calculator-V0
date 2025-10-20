interface DrugInfo {
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

const cache: { [key: string]: { data: DrugInfo; timestamp: number } } = {}
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

function getEnhancedFallbackInfo(drugName: string): DrugInfo {
  // Enhanced fallback with accurate drug information
  const drugInfo: { [key: string]: Partial<DrugInfo> } = {
    augmentin: {
      genericName: "Amoxicillin/Clavulanate",
      indications:
        "Beta-lactam antibiotic combination used to treat bacterial infections including respiratory tract infections, urinary tract infections, and skin infections.",
      warnings:
        "May cause allergic reactions in patients with penicillin allergy. Monitor for signs of Clostridioides difficile-associated diarrhea. Can cause severe skin reactions including Stevens-Johnson syndrome.",
      precautions:
        "Use with caution in patients with hepatic impairment. Adjust dose in renal impairment. Monitor liver function during prolonged therapy.",
      pediatricUse: "Approved for pediatric use. Dosing based on weight and severity of infection.",
      adverseEvents: [
        "Diarrhea",
        "Nausea",
        "Vomiting",
        "Abdominal pain",
        "Skin rash",
        "Allergic reactions",
        "Clostridioides difficile colitis",
      ],
    },
    zinnat: {
      genericName: "Cefuroxime",
      indications:
        "Second-generation cephalosporin antibiotic used to treat respiratory tract infections, urinary tract infections, and skin infections.",
      warnings:
        "May cause allergic reactions in patients with cephalosporin or penicillin allergy. Monitor for superinfection.",
      precautions:
        "Use with caution in patients with renal impairment. Monitor for signs of superinfection with prolonged use.",
      pediatricUse: "Safe for pediatric use with appropriate weight-based dosing.",
      adverseEvents: ["Allergic reactions", "Diarrhea", "Nausea", "Vomiting", "Skin rash", "Superinfection"],
    },
    klacid: {
      genericName: "Clarithromycin",
      indications:
        "Macrolide antibiotic used to treat respiratory tract infections, skin infections, and H. pylori eradication.",
      warnings:
        "May prolong QT interval. Avoid in patients with known QT prolongation or electrolyte abnormalities. Can cause hepatotoxicity.",
      precautions:
        "Drug interactions with many medications. Check for interactions before prescribing. Monitor liver function.",
      pediatricUse: "Approved for pediatric use with weight-based dosing.",
      adverseEvents: [
        "Nausea",
        "Vomiting",
        "Diarrhea",
        "Abdominal pain",
        "Skin rash",
        "Hepatotoxicity",
        "QT prolongation",
      ],
    },
    zithromax: {
      genericName: "Azithromycin",
      indications:
        "Macrolide antibiotic used for respiratory tract infections, skin infections, and sexually transmitted infections.",
      warnings:
        "May cause cardiac arrhythmias. Use with caution in patients with cardiac conditions. Can prolong QT interval.",
      precautions:
        "Monitor for cardiac arrhythmias in high-risk patients. Use with caution in patients with liver disease.",
      pediatricUse: "Commonly used in pediatric patients with appropriate dosing.",
      adverseEvents: [
        "Nausea",
        "Vomiting",
        "Diarrhea",
        "Abdominal pain",
        "Skin rash",
        "Cardiac arrhythmias",
        "QT prolongation",
      ],
    },
    suprax: {
      genericName: "Cefixime",
      indications:
        "Third-generation cephalosporin antibiotic used for urinary tract infections and respiratory tract infections.",
      warnings: "May cause allergic reactions in patients with cephalosporin allergy. Monitor for superinfection.",
      precautions: "Use with caution in patients with renal impairment. Monitor for signs of superinfection.",
      pediatricUse: "Approved for pediatric use with weight-based dosing.",
      adverseEvents: ["Allergic reactions", "Diarrhea", "Nausea", "Vomiting", "Skin rash", "Superinfection"],
    },
    panadol: {
      genericName: "Acetaminophen (Paracetamol)",
      indications: "Analgesic and antipyretic used for pain relief and fever reduction.",
      warnings:
        "Risk of hepatotoxicity with overdose. Maximum daily dose should not exceed recommended limits. Can cause severe liver damage.",
      precautions: "Use with caution in patients with liver disease. Monitor liver function with prolonged use.",
      pediatricUse: "Safe for pediatric use when dosed appropriately by weight.",
      adverseEvents: ["Liver damage", "Hepatotoxicity", "Nausea", "Vomiting", "Skin rash", "Allergic reactions"],
    },
    adol: {
      genericName: "Acetaminophen (Paracetamol)",
      indications: "Analgesic and antipyretic used for pain relief and fever reduction.",
      warnings:
        "Risk of hepatotoxicity with overdose. Do not exceed recommended dosing. Can cause severe liver damage.",
      precautions: "Use with caution in patients with liver disease. Monitor liver function with prolonged use.",
      pediatricUse: "Safe for pediatric use when dosed appropriately by weight.",
      adverseEvents: ["Liver damage", "Hepatotoxicity", "Nausea", "Vomiting", "Skin rash", "Allergic reactions"],
    },
    brufen: {
      genericName: "Ibuprofen",
      indications: "NSAID used for pain, inflammation, and fever reduction.",
      warnings:
        "May increase risk of cardiovascular events and GI bleeding. Avoid in patients with kidney disease. Can cause serious GI complications.",
      precautions:
        "Use with caution in elderly patients. Monitor renal function. Use lowest effective dose for shortest duration.",
      pediatricUse: "Approved for children 6 months and older with appropriate dosing.",
      adverseEvents: ["GI bleeding", "Cardiovascular events", "Nausea", "Vomiting", "Skin rash", "Renal impairment"],
    },
    aerius: {
      genericName: "Desloratadine",
      indications: "Second-generation antihistamine used for allergic rhinitis and chronic urticaria.",
      warnings: "Generally well tolerated. Use with caution in patients with hepatic impairment.",
      precautions: "Monitor for drowsiness in some patients. Adjust dose in hepatic impairment.",
      pediatricUse: "Approved for pediatric use in children 6 months and older.",
      adverseEvents: ["Drowsiness", "Headache", "Nausea", "Fatigue", "Skin rash", "Dry mouth"],
    },
    zyrtec: {
      genericName: "Cetirizine",
      indications: "Second-generation antihistamine used for allergic rhinitis and chronic urticaria.",
      warnings: "May cause drowsiness in some patients. Adjust dose in renal impairment.",
      precautions: "Use with caution in elderly patients. Monitor for sedation effects.",
      pediatricUse: "Safe for pediatric use in children 6 months and older.",
      adverseEvents: ["Drowsiness", "Fatigue", "Headache", "Nausea", "Skin rash", "Dry mouth"],
    },
    depakine: {
      genericName: "Valproic Acid",
      indications: "Anticonvulsant used for epilepsy, bipolar disorder, and migraine prophylaxis.",
      warnings:
        "Risk of hepatotoxicity, pancreatitis, and teratogenicity. Regular monitoring required. Can cause serious birth defects.",
      precautions:
        "Monitor liver function, platelet count, and ammonia levels regularly. Use effective contraception in women of childbearing age.",
      pediatricUse: "Used in pediatric epilepsy with careful monitoring and dosing.",
      adverseEvents: [
        "Hepatotoxicity",
        "Pancreatitis",
        "Teratogenicity",
        "Nausea",
        "Vomiting",
        "Hair loss",
        "Weight gain",
      ],
    },
    tegretol: {
      genericName: "Carbamazepine",
      indications: "Anticonvulsant used for epilepsy, trigeminal neuralgia, and bipolar disorder.",
      warnings:
        "Risk of serious skin reactions, blood dyscrasias, and hyponatremia. Can cause Stevens-Johnson syndrome.",
      precautions: "Regular monitoring of blood counts and liver function required. Monitor sodium levels.",
      pediatricUse: "Used in pediatric epilepsy with appropriate monitoring.",
      adverseEvents: [
        "Stevens-Johnson syndrome",
        "Blood dyscrasias",
        "Hyponatremia",
        "Nausea",
        "Vomiting",
        "Dizziness",
      ],
    },
    trileptal: {
      genericName: "Oxcarbazepine",
      indications: "Anticonvulsant used for partial seizures in epilepsy.",
      warnings: "Risk of hyponatremia and serious skin reactions. Monitor sodium levels regularly.",
      precautions:
        "Monitor sodium levels regularly. Use with caution in patients with cardiac conduction abnormalities.",
      pediatricUse: "Approved for pediatric use in children 2 years and older.",
      adverseEvents: ["Hyponatremia", "Serious skin reactions", "Nausea", "Vomiting", "Dizziness", "Fatigue"],
    },
    metronidazole: {
      genericName: "Metronidazole",
      indications: "Antibiotic and antiprotozoal used for anaerobic infections and protozoal infections.",
      warnings:
        "Avoid alcohol during treatment. May cause peripheral neuropathy with prolonged use. Can cause seizures.",
      precautions:
        "Use with caution in patients with renal impairment, elderly patients, and those with folate deficiency. Monitor for neurological symptoms.",
      pediatricUse: "Used in pediatric patients with appropriate dosing for specific indications.",
      adverseEvents: ["Peripheral neuropathy", "Seizures", "Nausea", "Vomiting", "Diarrhea", "Metallic taste"],
    },
    amoxicillin: {
      genericName: "Amoxicillin",
      indications: "Penicillin antibiotic used to treat various bacterial infections.",
      warnings: "Contraindicated in patients with penicillin allergy. Can cause severe allergic reactions.",
      precautions: "Monitor for signs of allergic reactions. Use with caution in patients with mononucleosis.",
      pediatricUse: "Commonly used in pediatric patients with appropriate dosing.",
      adverseEvents: ["Allergic reactions", "Anaphylaxis", "Nausea", "Vomiting", "Diarrhea", "Skin rash"],
    },
    septrin: {
      genericName: "Sulfamethoxazole/Trimethoprim",
      indications:
        "Antibiotic combination used for urinary tract infections, respiratory infections, and Pneumocystis pneumonia prophylaxis.",
      warnings:
        "May cause serious skin reactions (Stevens-Johnson syndrome). Monitor for blood dyscrasias. Can cause hyperkalemia.",
      precautions:
        "Use with caution in patients with renal impairment, elderly patients, and those with folate deficiency. Monitor blood counts and electrolytes.",
      pediatricUse: "Used in pediatric patients over 2 months of age with appropriate dosing.",
      adverseEvents: ["Stevens-Johnson syndrome", "Blood dyscrasias", "Hyperkalemia", "Nausea", "Vomiting", "Diarrhea"],
    },
    zovirax: {
      genericName: "Acyclovir",
      indications: "Antiviral medication used for herpes simplex virus and varicella-zoster virus infections.",
      warnings:
        "May cause nephrotoxicity, especially with IV administration. Ensure adequate hydration. Can cause neurological effects.",
      precautions:
        "Adjust dose in renal impairment. Monitor renal function during treatment. Ensure adequate hydration.",
      pediatricUse: "Safe for pediatric use with appropriate dosing for viral infections.",
      adverseEvents: ["Nephrotoxicity", "Neurological effects", "Nausea", "Vomiting", "Diarrhea", "Headache"],
    },
    nystatin: {
      genericName: "Nystatin",
      indications: "Antifungal medication used for oral and intestinal candidiasis.",
      warnings: "Generally well tolerated. Rare hypersensitivity reactions may occur.",
      precautions: "Continue treatment for 48 hours after symptoms resolve. Monitor for signs of resistance.",
      pediatricUse: "Safe for use in infants and children including neonates.",
      adverseEvents: ["Hypersensitivity reactions", "GI upset", "Nausea", "Vomiting", "Diarrhea", "Oral irritation"],
    },
    nitrofurantoin: {
      genericName: "Nitrofurantoin",
      indications: "Antibiotic used specifically for urinary tract infections.",
      warnings:
        "May cause pulmonary toxicity with long-term use. Contraindicated in patients with significant renal impairment. Can cause hepatotoxicity.",
      precautions:
        "Take with food to reduce GI upset. Monitor for signs of pulmonary or hepatic toxicity. Monitor lung function with long-term use.",
      pediatricUse: "Used in children over 1 month of age for urinary tract infections.",
      adverseEvents: [
        "Pulmonary toxicity",
        "Hepatotoxicity",
        "GI upset",
        "Nausea",
        "Vomiting",
        "Peripheral neuropathy",
      ],
    },
  }

  const lowerDrugName = drugName.toLowerCase()
  let matchedInfo: Partial<DrugInfo> = {}

  // Find matching drug info
  for (const [key, info] of Object.entries(drugInfo)) {
    if (lowerDrugName.includes(key)) {
      matchedInfo = info
      break
    }
  }

  return {
    drugName: drugName,
    genericName: matchedInfo.genericName || "Generic name not available",
    brandName: drugName,
    adverseEvents: matchedInfo.adverseEvents || ["Consult prescribing information for complete adverse event profile"],
    indications:
      matchedInfo.indications ||
      "Please consult prescribing information or medical references for detailed indications.",
    warnings: matchedInfo.warnings || "Please consult prescribing information for complete warnings and precautions.",
    precautions: matchedInfo.precautions || "Please consult prescribing information for complete precautions.",
    dosageAdministration: "Please consult prescribing information for dosage and administration details.",
    interactions: "Please consult prescribing information for drug interaction information.",
    contraindications: "Please consult prescribing information for contraindications.",
    pediatricUse: matchedInfo.pediatricUse || "Please consult prescribing information for pediatric use information.",
  }
}

export async function fetchDrugInfo(drugName: string): Promise<DrugInfo> {
  const cacheKey = drugName.toLowerCase()
  const cachedData = cache[cacheKey]

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data
  }

  // Always use enhanced fallback info first, then try to enhance with API data
  const enhancedInfo = getEnhancedFallbackInfo(drugName)

  try {
    const response = await fetch(`/api/drug-info?drugName=${encodeURIComponent(drugName)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Check if the response is actually JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.warn("API response is not JSON, using enhanced fallback data")
      cache[cacheKey] = { data: enhancedInfo, timestamp: Date.now() }
      return enhancedInfo
    }

    // Always try to parse the response, even if not ok
    const text = await response.text()

    let apiDrugInfo
    try {
      apiDrugInfo = JSON.parse(text)
    } catch (parseError) {
      console.warn("Failed to parse JSON response:", parseError)
      cache[cacheKey] = { data: enhancedInfo, timestamp: Date.now() }
      return enhancedInfo
    }

    // Validate that we got a proper drug info object
    if (apiDrugInfo && typeof apiDrugInfo === "object" && apiDrugInfo.drugName) {
      // Merge API data with enhanced fallback, preferring enhanced data for key fields
      const mergedInfo: DrugInfo = {
        drugName: drugName,
        genericName:
          enhancedInfo.genericName !== "Generic name not available"
            ? enhancedInfo.genericName
            : apiDrugInfo.genericName || enhancedInfo.genericName,
        brandName: apiDrugInfo.brandName || enhancedInfo.brandName,
        adverseEvents:
          enhancedInfo.adverseEvents.length > 1 &&
          !enhancedInfo.adverseEvents.includes("Consult prescribing information for complete adverse event profile")
            ? enhancedInfo.adverseEvents
            : apiDrugInfo.adverseEvents || enhancedInfo.adverseEvents,
        indications:
          enhancedInfo.indications !==
          "Please consult prescribing information or medical references for detailed indications."
            ? enhancedInfo.indications
            : apiDrugInfo.indications || enhancedInfo.indications,
        warnings:
          enhancedInfo.warnings !== "Please consult prescribing information for complete warnings and precautions."
            ? enhancedInfo.warnings
            : apiDrugInfo.warnings || enhancedInfo.warnings,
        precautions:
          enhancedInfo.precautions !== "Please consult prescribing information for complete precautions."
            ? enhancedInfo.precautions
            : apiDrugInfo.precautions || enhancedInfo.precautions,
        dosageAdministration: apiDrugInfo.dosageAdministration || enhancedInfo.dosageAdministration,
        interactions: apiDrugInfo.interactions || enhancedInfo.interactions,
        contraindications: apiDrugInfo.contraindications || enhancedInfo.contraindications,
        pediatricUse:
          enhancedInfo.pediatricUse !== "Please consult prescribing information for pediatric use information."
            ? enhancedInfo.pediatricUse
            : apiDrugInfo.pediatricUse || enhancedInfo.pediatricUse,
      }

      // Cache the result
      cache[cacheKey] = { data: mergedInfo, timestamp: Date.now() }
      return mergedInfo
    } else {
      console.warn("Invalid drug info structure received, using fallback")
      cache[cacheKey] = { data: enhancedInfo, timestamp: Date.now() }
      return enhancedInfo
    }
  } catch (error) {
    console.warn("Error fetching drug information, using enhanced fallback:", error)
    cache[cacheKey] = { data: enhancedInfo, timestamp: Date.now() }
    return enhancedInfo
  }
}

export async function fetchDrugInteractions(drugName: string): Promise<string[]> {
  try {
    // For now, we'll extract interactions from the main drug info
    const drugInfo = await fetchDrugInfo(drugName)

    if (
      drugInfo.interactions &&
      drugInfo.interactions !== "Please consult prescribing information for drug interaction information."
    ) {
      // Split the interactions text into individual items
      const interactions = drugInfo.interactions
        .split(/[.!?]+/)
        .filter((item) => item.trim().length > 10)
        .map((item) => item.trim())
        .slice(0, 5)

      return interactions.length > 0 ? interactions : ["No specific drug interaction data available from FDA database"]
    }

    return ["No specific drug interaction data available from FDA database"]
  } catch (error) {
    console.warn("Error fetching drug interactions:", error)
    return ["Drug interaction data not available"]
  }
}
