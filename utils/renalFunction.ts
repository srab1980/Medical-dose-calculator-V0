export function calculateCreatinineClearance(weightKg: number, ageYears: number, serumCreatinine: number): number {
  // Schwartz formula for pediatric patients
  const k = ageYears <= 1 ? 0.45 : ageYears <= 13 ? 0.55 : 0.7
  return (k * weightKg) / serumCreatinine
}
