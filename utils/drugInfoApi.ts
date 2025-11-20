export async function fetchDrugInfo(drugName: string) {
  try {
    const response = await fetch(`/api/drug-info?drugName=${encodeURIComponent(drugName)}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch drug information')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching drug information:', error)
    throw error
  }
}
