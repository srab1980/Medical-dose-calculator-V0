import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = "https://api.fda.gov/drug"
const API_KEY = process.env.NEXT_PUBLIC_OPENFDA_API_KEY || ""

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

function formatText(text: string): string {
  if (!text || text === "Not available") return text
  return text.replace(/\s+/g, " ").replace(/\n/g, "\n\n").trim()
}

async function fetchWithRetry(url: string, retries = 2): Promise<Response | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "PediatricDoseCalculator/1.0",
        },
      })

      clearTimeout(timeoutId)

      if (response.ok) return response

      // For 404 or 429, don't retry - just return null
      if (response.status === 404 || response.status === 429) {
        console.log(`API returned ${response.status} for ${url}, using fallback data`)
        return null
      }

      // For other errors, retry
      console.warn(`Attempt ${i + 1} failed with status ${response.status}`)
    } catch (error) {
      console.warn(`Fetch attempt ${i + 1} failed:`, error)
      // Don't throw, just continue to next retry
    }

    // Wait before retrying
    if (i < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)))
    }
  }

  // After all retries, return null instead of throwing
  console.log(`All fetch attempts failed for ${url}, using fallback data`)
  return null
}

function getKnownDrugMappings(): { [key: string]: { generic: string; brands: string[] } } {
  return {
    augmentin: {
      generic: "amoxicillin clavulanate",
      brands: ["augmentin", "amoxicillin clavulanate", "amoxicillin and clavulanate potassium"],
    },
    zinnat: {
      generic: "cefuroxime",
      brands: ["zinnat", "cefuroxime", "ceftin"],
    },
    klacid: {
      generic: "clarithromycin",
      brands: ["klacid", "clarithromycin", "biaxin"],
    },
    zithromax: {
      generic: "azithromycin",
      brands: ["zithromax", "azithromycin", "z-pak"],
    },
    suprax: {
      generic: "cefixime",
      brands: ["suprax", "cefixime"],
    },
    panadol: {
      generic: "acetaminophen",
      brands: ["panadol", "acetaminophen", "paracetamol", "tylenol"],
    },
    adol: {
      generic: "acetaminophen",
      brands: ["adol", "acetaminophen", "paracetamol"],
    },
    brufen: {
      generic: "ibuprofen",
      brands: ["brufen", "ibuprofen", "advil", "motrin"],
    },
    aerius: {
      generic: "desloratadine",
      brands: ["aerius", "desloratadine", "clarinex"],
    },
    zyrtec: {
      generic: "cetirizine",
      brands: ["zyrtec", "cetirizine"],
    },
    depakine: {
      generic: "valproic acid",
      brands: ["depakine", "valproic acid", "depakote", "sodium valproate"],
    },
    tegretol: {
      generic: "carbamazepine",
      brands: ["tegretol", "carbamazepine"],
    },
    trileptal: {
      generic: "oxcarbazepine",
      brands: ["trileptal", "oxcarbazepine"],
    },
    metronidazole: {
      generic: "metronidazole",
      brands: ["metronidazole", "flagyl"],
    },
    amoxicillin: {
      generic: "amoxicillin",
      brands: ["amoxicillin", "amoxil"],
    },
    septrin: {
      generic: "sulfamethoxazole trimethoprim",
      brands: ["septrin", "bactrim", "sulfamethoxazole trimethoprim", "co-trimoxazole"],
    },
    zovirax: {
      generic: "acyclovir",
      brands: ["zovirax", "acyclovir"],
    },
    nystatin: {
      generic: "nystatin",
      brands: ["nystatin", "mycostatin"],
    },
    nitrofurantoin: {
      generic: "nitrofurantoin",
      brands: ["nitrofurantoin", "macrobid", "macrodantin"],
    },
  }
}

function extractDrugMapping(drugName: string): { generic: string; brands: string[] } | null {
  const mappings = getKnownDrugMappings()
  const lowerDrugName = drugName.toLowerCase()

  // Check for exact matches first
  for (const [key, mapping] of Object.entries(mappings)) {
    if (lowerDrugName.includes(key)) {
      return mapping
    }
  }

  return null
}

function getSearchTerms(drugName: string): { term: string; type: "exact" | "brand" | "generic" }[] {
  const terms: { term: string; type: "exact" | "brand" | "generic" }[] = []

  // Get known mapping
  const mapping = extractDrugMapping(drugName)

  if (mapping) {
    // Add brand names (most specific first)
    mapping.brands.forEach((brand) => {
      terms.push({ term: brand, type: "brand" })
    })

    // Add generic name
    terms.push({ term: mapping.generic, type: "generic" })
  } else {
    // For unknown drugs, only use exact matches
    const baseName = drugName
      .replace(/\s*\d+.*$/g, "")
      .replace(/\s*(mg|ml|drops|syrup|elixir|suspension).*$/gi, "")
      .trim()

    terms.push({ term: drugName, type: "exact" })
    if (baseName !== drugName) {
      terms.push({ term: baseName, type: "exact" })
    }
  }

  return terms
}

function isRelevantMatch(drugName: string, labelInfo: any): boolean {
  const originalLower = drugName.toLowerCase()
  const mapping = extractDrugMapping(drugName)

  if (!mapping) {
    // For unknown drugs, be very strict
    const brandNames = labelInfo?.openfda?.brand_name || []
    const genericNames = labelInfo?.openfda?.generic_name || []

    const allNames = [...brandNames, ...genericNames].map((name: string) => name.toLowerCase())

    // Check if any of the FDA names contain our search term
    return allNames.some((name: string) =>
      name.includes(
        originalLower
          .replace(/\s*\d+.*$/g, "")
          .replace(/\s*(mg|ml|drops|syrup|elixir|suspension).*$/gi, "")
          .trim(),
      ),
    )
  }

  // For known drugs, check if the result matches our expected generic or brands
  const brandNames = (labelInfo?.openfda?.brand_name || []).map((name: string) => name.toLowerCase())
  const genericNames = (labelInfo?.openfda?.generic_name || []).map((name: string) => name.toLowerCase())
  const substanceNames = (labelInfo?.openfda?.substance_name || []).map((name: string) => name.toLowerCase())

  const allNames = [...brandNames, ...genericNames, ...substanceNames]

  // Check if any FDA name matches our expected generic or brand names
  return mapping.brands.some((expectedBrand) =>
    allNames.some(
      (fdaName) => fdaName.includes(expectedBrand.toLowerCase()) || expectedBrand.toLowerCase().includes(fdaName),
    ),
  )
}

function createEnhancedFallback(drugName: string): DrugInfo {
  const mapping = extractDrugMapping(drugName)

  return {
    drugName: drugName,
    genericName: mapping?.generic || "Generic name not available",
    brandName: drugName,
    adverseEvents: ["Consult prescribing information for complete adverse event profile"],
    indications: "Please consult prescribing information or medical references for detailed indications.",
    warnings: "Please consult prescribing information for complete warnings and precautions.",
    precautions: "Please consult prescribing information for complete precautions.",
    dosageAdministration: "Please consult prescribing information for dosage and administration details.",
    interactions: "Please consult prescribing information for drug interaction information.",
    contraindications: "Please consult prescribing information for contraindications.",
    pediatricUse: "Please consult prescribing information for pediatric use information.",
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const drugName = searchParams.get("drugName")

  if (!drugName) {
    return NextResponse.json({ error: "Drug name is required" }, { status: 400 })
  }

  // Always start with fallback data
  const fallbackInfo = createEnhancedFallback(drugName)

  try {
    const searchTerms = getSearchTerms(drugName)
    console.log(`🔍 Searching for drug: ${drugName}`)

    // Try each search term with appropriate strategy
    for (const { term, type } of searchTerms) {
      // Strategy 1: Search by brand name (only for brand terms)
      if (type === "brand" || type === "exact") {
        const brandUrl = `${API_BASE_URL}/label.json?search=openfda.brand_name:"${encodeURIComponent(term)}"&limit=5`

        const brandResponse = await fetchWithRetry(brandUrl)

        if (brandResponse && brandResponse.ok) {
          try {
            const brandData = await brandResponse.json()

            if (brandData.results && brandData.results.length > 0) {
              for (const result of brandData.results) {
                if (isRelevantMatch(drugName, result)) {
                  console.log(`✅ Found via brand search: ${term}`)
                  return NextResponse.json(createDrugInfo(drugName, result, term))
                }
              }
            }
          } catch (jsonError) {
            console.warn(`JSON parse error for brand search:`, jsonError)
          }
        }
      }

      // Strategy 2: Search by generic name (only for generic terms)
      if (type === "generic") {
        const genericUrl = `${API_BASE_URL}/label.json?search=openfda.generic_name:"${encodeURIComponent(term)}"&limit=5`

        const genericResponse = await fetchWithRetry(genericUrl)

        if (genericResponse && genericResponse.ok) {
          try {
            const genericData = await genericResponse.json()

            if (genericData.results && genericData.results.length > 0) {
              for (const result of genericData.results) {
                if (isRelevantMatch(drugName, result)) {
                  console.log(`✅ Found via generic search: ${term}`)
                  return NextResponse.json(createDrugInfo(drugName, result, term))
                }
              }
            }
          } catch (jsonError) {
            console.warn(`JSON parse error for generic search:`, jsonError)
          }
        }
      }

      // Strategy 3: Search in substance name (only for known generics)
      if (type === "generic") {
        const substanceUrl = `${API_BASE_URL}/label.json?search=openfda.substance_name:"${encodeURIComponent(term)}"&limit=5`

        const substanceResponse = await fetchWithRetry(substanceUrl)

        if (substanceResponse && substanceResponse.ok) {
          try {
            const substanceData = await substanceResponse.json()

            if (substanceData.results && substanceData.results.length > 0) {
              for (const result of substanceData.results) {
                if (isRelevantMatch(drugName, result)) {
                  console.log(`✅ Found via substance search: ${term}`)
                  return NextResponse.json(createDrugInfo(drugName, result, term))
                }
              }
            }
          } catch (jsonError) {
            console.warn(`JSON parse error for substance search:`, jsonError)
          }
        }
      }
    }

    // If no results found, try adverse events (for known drugs only)
    const mapping = extractDrugMapping(drugName)
    if (mapping) {
      const eventUrl = `${API_BASE_URL}/event.json?search=patient.drug.medicinalproduct:"${encodeURIComponent(mapping.generic)}"&limit=10`
      const eventResponse = await fetchWithRetry(eventUrl)

      if (eventResponse && eventResponse.ok) {
        try {
          const eventData = await eventResponse.json()

          if (eventData.results) {
            const adverseEvents = [
              ...new Set(
                eventData.results
                  .slice(0, 10)
                  .flatMap((result: any) => result.patient?.reaction?.map((r: any) => r.reactionmeddrapt) || []),
              ),
            ].filter(Boolean)

            if (adverseEvents.length > 0) {
              fallbackInfo.adverseEvents = adverseEvents.slice(0, 10)
            }
          }
        } catch (jsonError) {
          console.warn(`JSON parse error for adverse events:`, jsonError)
        }
      }
    }

    console.log(`ℹ️ Using fallback data for: ${drugName}`)
    return NextResponse.json(fallbackInfo)
  } catch (error) {
    // Catch any unexpected errors and return fallback
    console.warn(`⚠️ Unexpected error, using fallback:`, error)
    return NextResponse.json(fallbackInfo)
  }
}

function createDrugInfo(originalDrugName: string, labelInfo: any, searchTerm: string): DrugInfo {
  return {
    drugName: originalDrugName,
    genericName:
      labelInfo?.openfda?.generic_name?.[0] ||
      extractDrugMapping(originalDrugName)?.generic ||
      "Generic name not available",
    brandName: labelInfo?.openfda?.brand_name?.[0] || originalDrugName,
    adverseEvents: [],
    indications: formatText(
      labelInfo?.indications_and_usage?.[0] || "Please consult prescribing information for detailed indications.",
    ),
    warnings: formatText(
      labelInfo?.boxed_warning?.[0] ||
        labelInfo?.warnings?.[0] ||
        "Please consult prescribing information for complete warnings and precautions.",
    ),
    precautions: formatText(
      labelInfo?.precautions?.[0] || "Please consult prescribing information for complete precautions.",
    ),
    dosageAdministration: formatText(
      labelInfo?.dosage_and_administration?.[0] ||
        "Please consult prescribing information for dosage and administration details.",
    ),
    interactions: formatText(
      labelInfo?.drug_interactions?.[0] || "Please consult prescribing information for drug interaction information.",
    ),
    contraindications: formatText(
      labelInfo?.contraindications?.[0] || "Please consult prescribing information for contraindications.",
    ),
    pediatricUse: formatText(
      labelInfo?.pediatric_use?.[0] || "Please consult prescribing information for pediatric use information.",
    ),
  }
}
