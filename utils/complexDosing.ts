export function calculateComplexDose(standardDose: number, creatinineClearance: number, regimen: string): number {
  let adjustedDose = standardDose

  if (creatinineClearance < 30) {
    adjustedDose *= 0.5 // 50% dose reduction for severe renal impairment
  } else if (creatinineClearance < 60) {
    adjustedDose *= 0.75 // 25% dose reduction for moderate renal impairment
  }

  switch (regimen) {
    case 'loading':
      adjustedDose *= 2 // Double the first dose for loading dose regimen
      break
    case 'tapering':
      // Implement a simple tapering schedule (e.g., reduce by 25% each week)
      adjustedDose = [
        adjustedDose,
        adjustedDose * 0.75,
        adjustedDose * 0.5,
        adjustedDose * 0.25
      ]
      break
    default:
      // Standard dosing, no changes
      break
  }

  return adjustedDose
}
