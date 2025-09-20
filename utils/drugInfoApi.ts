const API_KEY = process.env.NEXT_PUBLIC_OPENFDA_API_KEY

export async function fetchDrugInfo(drugName: string) {
  const url = `https://api.fda.gov/drug/label.json?api_key=${API_KEY}&search=openfda.brand_name:"${encodeURIComponent(drugName)}"&limit=1`
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0]
      return {
        brandName: result.openfda.brand_name[0],
        genericName: result.openfda.generic_name[0],
        indications: result.indications_and_usage,
        warnings: result.warnings,
        adverseReactions: result.adverse_reactions
      }
    } else {
      throw new Error('No drug information found')
    }
  } catch (error) {
    console.error('Error fetching drug information:', error)
    throw error
  }
}
