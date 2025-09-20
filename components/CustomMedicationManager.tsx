'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

type CustomMedication = {
  id: string;
  name: string;
  dosageGuidelines: string;
}

export function CustomMedicationManager() {
  const [customMedications, setCustomMedications] = useState<CustomMedication[]>([])
  const [newMedication, setNewMedication] = useState({ name: '', dosageGuidelines: '' })

  useEffect(() => {
    const savedMedications = localStorage.getItem('customMedications')
    if (savedMedications) {
      setCustomMedications(JSON.parse(savedMedications))
    }
  }, [])

  const saveMedication = () => {
    if (newMedication.name && newMedication.dosageGuidelines) {
      const updatedMedications = [...customMedications, { ...newMedication, id: Date.now().toString() }]
      setCustomMedications(updatedMedications)
      localStorage.setItem('customMedications', JSON.stringify(updatedMedications))
      setNewMedication({ name: '', dosageGuidelines: '' })
    }
  }

  const deleteMedication = (id: string) => {
    const updatedMedications = customMedications.filter(med => med.id !== id)
    setCustomMedications(updatedMedications)
    localStorage.setItem('customMedications', JSON.stringify(updatedMedications))
  }

  return (
    <Card className="w-full dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center dark:text-white">Custom Medication Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="medicationName" className="dark:text-white">Medication Name</Label>
            <Input
              id="medicationName"
              value={newMedication.name}
              onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
              className="dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <Label htmlFor="dosageGuidelines" className="dark:text-white">Dosage Guidelines</Label>
            <Textarea
              id="dosageGuidelines"
              value={newMedication.dosageGuidelines}
              onChange={(e) => setNewMedication({ ...newMedication, dosageGuidelines: e.target.value })}
              className="dark:bg-gray-700 dark:text-white"
            />
          </div>
          <Button onClick={saveMedication}>Add Medication</Button>
        </div>
        <ScrollArea className="h-[300px] mt-4">
          <div className="space-y-2">
            {customMedications.map((med) => (
              <div key={med.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                <div>
                  <h3 className="font-bold dark:text-white">{med.name}</h3>
                  <p className="text-sm dark:text-gray-300">{med.dosageGuidelines}</p>
                </div>
                <Button variant="destructive" onClick={() => deleteMedication(med.id)}>Delete</Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
