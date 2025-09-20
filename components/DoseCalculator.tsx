import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { calculateDose } from '../utils/doseCalculator'

export function DoseCalculator({ medications }) {
  const [formInputs, setFormInputs] = useState({
    ageYears: '',
    ageMonths: '',
    weightKg: '',
    medication: ''
  })
  const [result, setResult] = useState(null)

  const updateFormInput = (field: string, value: string) => {
    setFormInputs(prev => ({ ...prev, [field]: value }))
  }

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    const { ageYears, ageMonths, weightKg, medication } = formInputs
    if (ageYears && ageMonths && weightKg && medication) {
      try {
        const totalAgeInMonths = parseInt(ageYears) * 12 + parseInt(ageMonths)
        const calculationResult = calculateDose(medication, parseFloat(weightKg), totalAgeInMonths)
        setResult(calculationResult)
      } catch (error) {
        alert('Error calculating dose: ' + (error instanceof Error ? error.message : String(error)))
      }
    } else {
      alert('Please fill in all fields')
    }
  }

  return (
    <div>
      <form onSubmit={handleCalculate} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ageYears">Age (Years)</Label>
            <Input
              id="ageYears"
              type="number"
              value={formInputs.ageYears}
              onChange={(e) => updateFormInput('ageYears', e.target.value)}
              placeholder="Enter age in years"
            />
          </div>
          <div>
            <Label htmlFor="ageMonths">Age (Months)</Label>
            <Input
              id="ageMonths"
              type="number"
              value={formInputs.ageMonths}
              onChange={(e) => updateFormInput('ageMonths', e.target.value)}
              placeholder="Enter additional months"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="weightKg">Weight (kg)</Label>
          <Input
            id="weightKg"
            type="number"
            step="0.1"
            value={formInputs.weightKg}
            onChange={(e) => updateFormInput('weightKg', e.target.value)}
            placeholder="Enter weight in kg"
          />
        </div>
        <div>
          <Label htmlFor="medication">Medication</Label>
          <Select onValueChange={(value) => updateFormInput('medication', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select medication" />
            </SelectTrigger>
            <SelectContent>
              {medications.map((med) => (
                <SelectItem key={med.name} value={med.name}>{med.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full">Calculate Dose</Button>
      </form>
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h3 className="font-bold text-lg mb-2">Result:</h3>
          <p><strong>Dose:</strong> {result.dose} mg daily</p>
          <p><strong>Dose in mL:</strong> {result.doseMl} mL</p>
          <p><strong>Frequency:</strong> {result.frequency}</p>
          <p><strong>Reference:</strong> {result.reference}</p>
          {result.comment && <p><strong>Comment:</strong> {result.comment}</p>}
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {result.referenceLabel}
          </a>
        </div>
      )}
    </div>
  )
}
