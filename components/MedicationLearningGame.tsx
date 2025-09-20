"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Brain,
  Zap,
  Award,
  BookOpen,
  Timer,
  CheckCircle,
  XCircle,
  Play,
  Home,
  TrendingUp,
  Medal,
  Flame,
  Crown,
  Shuffle,
  Target,
} from "lucide-react"
import { medicationData } from "@/data/medicationData"

// Sound effect system
const playSound = (type: "correct" | "incorrect" | "achievement" | "levelup" | "complete") => {
  // Create audio context for better browser compatibility
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

  const createTone = (frequency: number, duration: number, type: "sine" | "square" | "triangle" = "sine") => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
    oscillator.type = type

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
  }

  try {
    switch (type) {
      case "correct":
        // Pleasant ascending chime
        createTone(523.25, 0.2) // C5
        setTimeout(() => createTone(659.25, 0.2), 100) // E5
        setTimeout(() => createTone(783.99, 0.3), 200) // G5
        break
      case "incorrect":
        // Gentle descending tone
        createTone(349.23, 0.3, "triangle") // F4
        setTimeout(() => createTone(293.66, 0.4, "triangle"), 150) // D4
        break
      case "achievement":
        // Triumphant fanfare
        createTone(523.25, 0.2) // C5
        setTimeout(() => createTone(659.25, 0.2), 100) // E5
        setTimeout(() => createTone(783.99, 0.2), 200) // G5
        setTimeout(() => createTone(1046.5, 0.4), 300) // C6
        break
      case "levelup":
        // Magical ascending scale
        const notes = [261.63, 329.63, 392.0, 523.25, 659.25] // C4, E4, G4, C5, E5
        notes.forEach((note, index) => {
          setTimeout(() => createTone(note, 0.2), index * 100)
        })
        break
      case "complete":
        // Victory fanfare
        createTone(523.25, 0.3) // C5
        setTimeout(() => createTone(659.25, 0.3), 200) // E5
        setTimeout(() => createTone(783.99, 0.3), 400) // G5
        setTimeout(() => createTone(1046.5, 0.6), 600) // C6
        break
    }
  } catch (error) {
    console.log("Audio not supported in this browser")
  }
}

// Comprehensive SVG Icon Library for Medications
const MedicationIcons = {
  // Basic medication forms
  pill: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <ellipse cx="12" cy="12" rx="8" ry="4" fill="currentColor" opacity="0.8" />
      <ellipse cx="12" cy="12" rx="6" ry="3" fill="currentColor" />
      <circle cx="9" cy="11" r="1" fill="white" opacity="0.6" />
    </svg>
  ),

  capsule: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path
        d="M8 4h8c2.2 0 4 1.8 4 4v8c0 2.2-1.8 4-4 4H8c-2.2 0-4-1.8-4-4V8c0-2.2 1.8-4 4-4z"
        fill="currentColor"
        opacity="0.3"
      />
      <path d="M8 4h8c2.2 0 4 1.8 4 4v4H4V8c0-2.2 1.8-4 4-4z" fill="currentColor" />
      <circle cx="7" cy="7" r="1" fill="white" opacity="0.8" />
      <circle cx="17" cy="7" r="1" fill="white" opacity="0.8" />
    </svg>
  ),

  tablet: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
      <line x1="12" y1="6" x2="12" y2="18" stroke="white" strokeWidth="1" opacity="0.6" />
      <circle cx="12" cy="12" r="2" fill="white" opacity="0.4" />
    </svg>
  ),

  // Liquid medications
  syrup: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M8 3h8v2H8V3z" fill="currentColor" />
      <path d="M9 5h6v14c0 1.1-.9 2-2 2h-2c-1.1 0-2-.9-2-2V5z" fill="currentColor" />
      <rect x="9" y="7" width="6" height="8" fill="currentColor" opacity="0.6" />
      <circle cx="12" cy="11" r="1" fill="white" opacity="0.8" />
      <path d="M10 3h4v1h-4V3z" fill="currentColor" opacity="0.8" />
    </svg>
  ),

  drops: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2c-1 2-3 4-3 6 0 1.7 1.3 3 3 3s3-1.3 3-3c0-2-2-4-3-6z" fill="currentColor" />
      <path d="M8 14c-1 2-2 3-2 4 0 1.1.9 2 2 2s2-.9 2-2c0-1-1-2-2-4z" fill="currentColor" opacity="0.7" />
      <path d="M16 14c-1 2-2 3-2 4 0 1.1.9 2 2 2s2-.9 2-2c0-1-1-2-2-4z" fill="currentColor" opacity="0.7" />
      <circle cx="12" cy="6" r="1" fill="white" opacity="0.6" />
    </svg>
  ),

  elixir: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M7 3h10v3H7V3z" fill="currentColor" />
      <path d="M8 6h8v12c0 1.7-1.3 3-3 3h-2c-1.7 0-3-1.3-3-3V6z" fill="currentColor" />
      <path d="M8 8h8v6c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2V8z" fill="currentColor" opacity="0.5" />
      <circle cx="10" cy="11" r="0.5" fill="white" opacity="0.8" />
      <circle cx="14" cy="13" r="0.5" fill="white" opacity="0.8" />
      <circle cx="12" cy="10" r="0.5" fill="white" opacity="0.8" />
    </svg>
  ),

  suspension: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M8 2h8v2H8V2z" fill="currentColor" />
      <path d="M9 4h6v16c0 1.1-.9 2-2 2h-2c-1.1 0-2-.9-2-2V4z" fill="currentColor" />
      <rect x="9" y="6" width="6" height="10" fill="currentColor" opacity="0.4" />
      <circle cx="10.5" cy="9" r="0.5" fill="white" />
      <circle cx="13.5" cy="11" r="0.5" fill="white" />
      <circle cx="11" cy="13" r="0.5" fill="white" />
      <circle cx="13" cy="8" r="0.5" fill="white" />
      <circle cx="11.5" cy="15" r="0.5" fill="white" />
    </svg>
  ),

  // Injectable medications
  syringe: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <rect x="2" y="10" width="16" height="4" rx="2" fill="currentColor" />
      <rect x="18" y="11" width="3" height="2" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="white" opacity="0.8" />
      <rect x="6" y="11.5" width="10" height="1" fill="white" opacity="0.6" />
      <polygon points="21,11 23,12 21,13" fill="currentColor" />
    </svg>
  ),

  injection: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <rect x="3" y="9" width="14" height="6" rx="3" fill="currentColor" />
      <rect x="17" y="10.5" width="4" height="3" fill="currentColor" />
      <circle cx="6" cy="12" r="1.5" fill="white" opacity="0.7" />
      <rect x="8" y="11.5" width="8" height="1" fill="white" opacity="0.5" />
      <path d="M21 10.5l2 1.5-2 1.5v-3z" fill="currentColor" />
    </svg>
  ),

  vial: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <rect x="9" y="2" width="6" height="2" fill="currentColor" />
      <rect x="8" y="4" width="8" height="16" rx="2" fill="currentColor" />
      <rect x="8" y="6" width="8" height="10" fill="currentColor" opacity="0.6" />
      <circle cx="12" cy="10" r="1" fill="white" opacity="0.8" />
      <rect x="10" y="2" width="4" height="1" fill="currentColor" opacity="0.8" />
    </svg>
  ),

  // Specialized medication types
  antibiotic: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2L12 16.8l-6.4 4.4 2.4-7.2-6-4.8h7.6L12 2z" fill="currentColor" />
      <circle cx="12" cy="12" r="3" fill="white" opacity="0.3" />
      <path d="M12 9v6M9 12h6" stroke="white" strokeWidth="1" opacity="0.8" />
    </svg>
  ),

  painkiller: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <path d="M12 6v12M6 12h12" stroke="white" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
    </svg>
  ),

  antiviral: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" fill="currentColor" />
      <polygon points="12,6 18,9 18,15 12,18 6,15 6,9" fill="white" opacity="0.3" />
      <circle cx="12" cy="12" r="2" fill="white" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),

  antihistamine: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="8" fill="currentColor" />
      <circle cx="12" cy="12" r="6" fill="white" opacity="0.4" />
      <path d="M9 9l6 6M15 9l-6 6" stroke="white" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" fill="white" />
    </svg>
  ),

  anticonvulsant: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <rect x="2" y="10" width="20" height="4" rx="2" fill="currentColor" />
      <path d="M4 12h2l2-4 2 8 2-8 2 4 2-2 2 2 2-4 2 4" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="6" cy="12" r="1" fill="white" />
      <circle cx="18" cy="12" r="1" fill="white" />
    </svg>
  ),

  // Age-specific icons
  pediatric: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="12" cy="8" r="4" fill="currentColor" />
      <path d="M12 14c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z" fill="currentColor" />
      <circle cx="12" cy="8" r="2" fill="white" opacity="0.6" />
      <path d="M8 6c0-2 2-4 4-4s4 2 4 4" stroke="white" strokeWidth="1" fill="none" opacity="0.8" />
    </svg>
  ),

  infant: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="12" cy="9" r="5" fill="currentColor" />
      <path d="M12 16c-3 0-6 1.5-6 4v2h12v-2c0-2.5-3-4-6-4z" fill="currentColor" />
      <circle cx="10" cy="8" r="1" fill="white" />
      <circle cx="14" cy="8" r="1" fill="white" />
      <path d="M10 11c1 1 3 1 4 0" stroke="white" strokeWidth="1" fill="none" />
    </svg>
  ),

  // Dosage form icons
  oral: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <ellipse cx="12" cy="12" rx="8" ry="6" fill="currentColor" />
      <ellipse cx="12" cy="10" rx="6" ry="3" fill="white" opacity="0.4" />
      <path d="M6 12c2-1 4-1 6 0s4 1 6 0" stroke="white" strokeWidth="1" fill="none" />
    </svg>
  ),

  topical: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <rect x="6" y="4" width="12" height="16" rx="2" fill="currentColor" />
      <rect x="8" y="6" width="8" height="2" fill="white" opacity="0.8" />
      <circle cx="12" cy="12" r="2" fill="white" opacity="0.6" />
      <path d="M10 15h4M10 17h4" stroke="white" strokeWidth="1" />
    </svg>
  ),

  // Measurement icons
  milligram: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="bold">
        mg
      </text>
      <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),

  milliliter: (className = "w-8 h-8") => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="bold">
        mL
      </text>
      <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
}

// Enhanced medication categorization and icon mapping
const getMedicationIcon = (medicationName: string, category: string, questionType?: string) => {
  const name = medicationName.toLowerCase()

  // Question type specific icons
  if (questionType === "dosage") return MedicationIcons.milligram()
  if (questionType === "volume") return MedicationIcons.milliliter()

  // Age-specific medications
  if (name.includes("baby") || name.includes("infant")) return MedicationIcons.infant()
  if (name.includes("paediatric") || name.includes("pediatric")) return MedicationIcons.pediatric()

  // Form-specific icons
  if (name.includes("drops")) return MedicationIcons.drops()
  if (name.includes("syrup")) return MedicationIcons.syrup()
  if (name.includes("elixir")) return MedicationIcons.elixir()
  if (name.includes("suspension")) return MedicationIcons.suspension()
  if (name.includes("injection") || name.includes("zovirax")) return MedicationIcons.injection()
  if (name.includes("tablet")) return MedicationIcons.tablet()
  if (name.includes("capsule")) return MedicationIcons.capsule()

  // Medication class specific
  if (name.includes("panadol") || name.includes("adol") || name.includes("brufen")) return MedicationIcons.painkiller()
  if (name.includes("aerius") || name.includes("zyrtec")) return MedicationIcons.antihistamine()
  if (name.includes("depakine") || name.includes("tegretol") || name.includes("trileptal"))
    return MedicationIcons.anticonvulsant()
  if (name.includes("zovirax")) return MedicationIcons.antiviral()

  // Category-based defaults
  if (category === "antibiotics") return MedicationIcons.antibiotic()

  // Default based on common forms
  if (name.includes("mg/ml") || name.includes("mg/5ml")) return MedicationIcons.syrup()

  return MedicationIcons.pill()
}

// Enhanced color system
const getMedicationColor = (medicationName: string, category: string, isCorrect?: boolean) => {
  if (isCorrect === true) return "text-green-500"
  if (isCorrect === false) return "text-red-500"

  const name = medicationName.toLowerCase()

  if (name.includes("drops")) return "text-blue-500"
  if (name.includes("syrup") || name.includes("elixir")) return "text-purple-500"
  if (name.includes("injection")) return "text-red-500"
  if (name.includes("panadol") || name.includes("adol") || name.includes("brufen")) return "text-green-500"
  if (name.includes("aerius") || name.includes("zyrtec")) return "text-cyan-500"
  if (name.includes("depakine") || name.includes("tegretol") || name.includes("trileptal")) return "text-indigo-500"
  if (category === "antibiotics") return "text-orange-500"
  if (name.includes("tablet")) return "text-slate-500"
  if (name.includes("capsule")) return "text-pink-500"

  return category === "antibiotics" ? "text-orange-500" : "text-gray-500"
}

interface GameStats {
  totalQuestions: number
  correctAnswers: number
  streak: number
  bestStreak: number
  totalPlayTime: number
  gamesPlayed: number
  averageScore: number
  achievements: string[]
  level: number
  experience: number
  lastPlayed: string
  questionsAsked: string[] // Track asked questions to prevent repetition
  sessionQuestionsAsked: string[] // Track questions in current session
}

interface Question {
  id: string
  type: "multiple-choice" | "flashcard" | "matching" | "fill-blank" | "true-false" | "dosage-calc"
  medication: string
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
  difficulty: "easy" | "medium" | "hard"
  category: "antibiotics" | "other"
  questionCategory?: "dosage" | "indication" | "frequency" | "form" | "age-group" | "volume"
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  condition: (stats: GameStats) => boolean
  unlocked: boolean
  reward: number
}

export function MedicationLearningGame() {
  const [gameMode, setGameMode] = useState<"menu" | "quiz" | "flashcards" | "matching" | "stats">("menu")
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [showAnswer, setShowAnswer] = useState(false)
  const [gameStats, setGameStats] = useState<GameStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    streak: 0,
    bestStreak: 0,
    totalPlayTime: 0,
    gamesPlayed: 0,
    averageScore: 0,
    achievements: [],
    level: 1,
    experience: 0,
    lastPlayed: new Date().toISOString(),
    questionsAsked: [],
    sessionQuestionsAsked: [],
  })
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    startTime: Date.now(),
  })
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy")
  const [category, setCategory] = useState<"all" | "antibiotics" | "other">("all")
  const [timeLeft, setTimeLeft] = useState(30)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null)

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showFinalAchievement, setShowFinalAchievement] = useState(false)
  const [finalAchievementData, setFinalAchievementData] = useState<{
    score: number
    timeBonus: number
    streakBonus: number
    totalXP: number
    newLevel: boolean
    perfectGame: boolean
    newRecord: boolean
    motivationalMessage: string
    performanceRating: string
    badges: string[]
  } | null>(null)

  // Load saved stats on component mount
  useEffect(() => {
    const savedStats = localStorage.getItem("medicationGameStats")
    if (savedStats) {
      const parsed = JSON.parse(savedStats)
      // Ensure new properties exist
      setGameStats({
        ...parsed,
        questionsAsked: parsed.questionsAsked || [],
        sessionQuestionsAsked: [],
      })
    }
  }, [])

  // Save stats whenever they change
  useEffect(() => {
    localStorage.setItem("medicationGameStats", JSON.stringify(gameStats))
  }, [gameStats])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimeUp()
    }
    return () => clearInterval(interval)
  }, [isTimerActive, timeLeft])

  // Enhanced question generation with rotation and variety
  const generateQuestions = useCallback(
    (count = 10): Question[] => {
      const allMedications = [
        ...medicationData.antibiotics.map((med) => ({ ...med, category: "antibiotics" as const })),
        ...medicationData.other.map((med) => ({ ...med, category: "other" as const })),
      ]

      const filteredMeds =
        category === "all" ? allMedications : allMedications.filter((med) => med.category === category)

      const questions: Question[] = []
      const usedQuestionIds = new Set(gameStats.sessionQuestionsAsked)
      const questionTypes = ["multiple-choice", "flashcard", "fill-blank", "true-false", "dosage-calc"] as const
      const questionCategories = ["dosage", "indication", "frequency", "form", "age-group", "volume"] as const

      // Shuffle medications to ensure variety
      const shuffledMeds = [...filteredMeds].sort(() => Math.random() - 0.5)

      for (let i = 0; i < count && questions.length < count; i++) {
        const medIndex = i % shuffledMeds.length
        const med = shuffledMeds[medIndex]

        // Try different question types for variety
        const availableTypes = questionTypes.filter((type) => {
          const questionId = `${med.name}-${type}`
          return !usedQuestionIds.has(questionId)
        })

        if (availableTypes.length === 0) {
          // If all types used, allow repetition but prefer least recently used
          availableTypes.push(...questionTypes)
        }

        const questionType = availableTypes[Math.floor(Math.random() * availableTypes.length)]
        const questionCategory = questionCategories[Math.floor(Math.random() * questionCategories.length)]

        let question: Question

        switch (questionType) {
          case "multiple-choice":
            question = generateMultipleChoiceQuestion(med, allMedications, questionCategory)
            break
          case "flashcard":
            question = generateFlashcardQuestion(med, questionCategory)
            break
          case "fill-blank":
            question = generateFillBlankQuestion(med, questionCategory)
            break
          case "true-false":
            question = generateTrueFalseQuestion(med, allMedications, questionCategory)
            break
          case "dosage-calc":
            question = generateDosageCalculationQuestion(med, questionCategory)
            break
          default:
            question = generateMultipleChoiceQuestion(med, allMedications, questionCategory)
        }

        // Mark question as used
        usedQuestionIds.add(question.id)
        questions.push(question)
      }

      return questions
    },
    [category, gameStats.sessionQuestionsAsked],
  )

  const generateMultipleChoiceQuestion = (med: any, allMeds: any[], questionCategory: string): Question => {
    const questionTypes = [
      {
        question: `What is the dosing reference for ${med.name}?`,
        correctAnswer: med.reference,
        category: "dosage",
        generateOptions: () => {
          const options = [med.reference]
          const sameCategoryMeds = allMeds.filter((m) => m.category === med.category && m.name !== med.name)
          while (options.length < 4 && sameCategoryMeds.length > 0) {
            const randomMed = sameCategoryMeds[Math.floor(Math.random() * sameCategoryMeds.length)]
            if (!options.includes(randomMed.reference)) {
              options.push(randomMed.reference)
              sameCategoryMeds.splice(sameCategoryMeds.indexOf(randomMed), 1)
            }
          }
          return options.sort(() => Math.random() - 0.5)
        },
      },
      {
        question: `Which medication has the dosing: "${med.reference}"?`,
        correctAnswer: med.name,
        category: "indication",
        generateOptions: () => {
          const options = [med.name]
          const sameCategoryMeds = allMeds.filter((m) => m.category === med.category && m.name !== med.name)
          while (options.length < 4 && sameCategoryMeds.length > 0) {
            const randomMed = sameCategoryMeds[Math.floor(Math.random() * sameCategoryMeds.length)]
            if (!options.includes(randomMed.name)) {
              options.push(randomMed.name)
              sameCategoryMeds.splice(sameCategoryMeds.indexOf(randomMed), 1)
            }
          }
          return options.sort(() => Math.random() - 0.5)
        },
      },
      {
        question: `What is the medication category for ${med.name}?`,
        correctAnswer: med.category === "antibiotics" ? "Antibiotic" : "Other Medication",
        category: "form",
        generateOptions: () => {
          const options = [med.category === "antibiotics" ? "Antibiotic" : "Other Medication"]
          const otherOptions = ["Antibiotic", "Analgesic", "Antihistamine", "Anticonvulsant", "Antiviral"]
          otherOptions.forEach((option) => {
            if (!options.includes(option) && options.length < 4) {
              options.push(option)
            }
          })
          return options.sort(() => Math.random() - 0.5)
        },
      },
    ]

    const selectedType = questionTypes[Math.floor(Math.random() * questionTypes.length)]

    return {
      id: `mc-${med.name}-${selectedType.category}-${Date.now()}`,
      type: "multiple-choice",
      medication: med.name,
      question: selectedType.question,
      options: selectedType.generateOptions(),
      correctAnswer: selectedType.correctAnswer,
      explanation: `${med.name}: ${med.reference}`,
      difficulty: difficulty,
      category: med.category,
      questionCategory: selectedType.category as any,
    }
  }

  const generateFlashcardQuestion = (med: any, questionCategory: string): Question => {
    const questions = [
      {
        question: `What is the dosing reference for ${med.name}?`,
        answer: med.reference,
        category: "dosage",
      },
      {
        question: `What type of medication is ${med.name}?`,
        answer: med.category === "antibiotics" ? "Antibiotic" : "Other medication",
        category: "form",
      },
      {
        question: `How should ${med.name} be administered?`,
        answer: med.name.includes("drops") ? "As drops" : med.name.includes("syrup") ? "As syrup" : "Orally",
        category: "form",
      },
    ]

    const selectedQuestion = questions[Math.floor(Math.random() * questions.length)]

    return {
      id: `fc-${med.name}-${selectedQuestion.category}-${Date.now()}`,
      type: "flashcard",
      medication: med.name,
      question: selectedQuestion.question,
      correctAnswer: selectedQuestion.answer,
      explanation: `Remember: ${med.name} - ${selectedQuestion.answer}. Reference: ${med.reference}`,
      difficulty: difficulty,
      category: med.category,
      questionCategory: selectedQuestion.category as any,
    }
  }

  const generateFillBlankQuestion = (med: any, questionCategory: string): Question => {
    const reference = med.reference
    const words = reference.split(" ")
    const importantWords = words.filter(
      (word) =>
        word.includes("mg") ||
        word.includes("kg") ||
        word.includes("day") ||
        word.includes("mo") ||
        word.includes("y") ||
        /\d/.test(word),
    )

    const blankWord =
      importantWords.length > 0
        ? importantWords[Math.floor(Math.random() * importantWords.length)]
        : words[Math.floor(Math.random() * words.length)]

    const questionText = reference.replace(blankWord, "______")

    return {
      id: `fb-${med.name}-${questionCategory}-${Date.now()}`,
      type: "fill-blank",
      medication: med.name,
      question: `Fill in the blank for ${med.name}: ${questionText}`,
      correctAnswer: blankWord,
      explanation: `Complete reference: ${med.reference}`,
      difficulty: difficulty,
      category: med.category,
      questionCategory: questionCategory as any,
    }
  }

  const generateTrueFalseQuestion = (med: any, allMeds: any[], questionCategory: string): Question => {
    const isTrue = Math.random() > 0.5
    let question: string
    let correctAnswer: string

    if (isTrue) {
      question = `True or False: ${med.name} is dosed at ${med.reference}`
      correctAnswer = "True"
    } else {
      const wrongMeds = allMeds.filter((m) => m.name !== med.name && m.category === med.category)
      const wrongMed = wrongMeds[Math.floor(Math.random() * wrongMeds.length)]
      question = `True or False: ${med.name} is dosed at ${wrongMed.reference}`
      correctAnswer = "False"
    }

    return {
      id: `tf-${med.name}-${questionCategory}-${Date.now()}`,
      type: "true-false",
      medication: med.name,
      question: question,
      options: ["True", "False"],
      correctAnswer: correctAnswer,
      explanation: `${med.name} is actually dosed at: ${med.reference}`,
      difficulty: difficulty,
      category: med.category,
      questionCategory: questionCategory as any,
    }
  }

  const generateDosageCalculationQuestion = (med: any, questionCategory: string): Question => {
    const weights = [5, 10, 15, 20, 25, 30]
    const weight = weights[Math.floor(Math.random() * weights.length)]

    // Extract dosage from reference (simplified)
    const doseMatch = med.reference.match(/(\d+)\s*mg\/kg\/day/)
    const dose = doseMatch ? Number.parseInt(doseMatch[1]) : 10

    const totalDose = dose * weight
    const wrongAnswers = [Math.round(totalDose * 0.5), Math.round(totalDose * 1.5), Math.round(totalDose * 2)]

    return {
      id: `dc-${med.name}-${questionCategory}-${Date.now()}`,
      type: "multiple-choice",
      medication: med.name,
      question: `Calculate the daily dose of ${med.name} for a ${weight}kg child:`,
      options: [totalDose, ...wrongAnswers].sort(() => Math.random() - 0.5).map((d) => `${d} mg`),
      correctAnswer: `${totalDose} mg`,
      explanation: `For ${med.name}: ${dose} mg/kg/day × ${weight} kg = ${totalDose} mg/day`,
      difficulty: difficulty,
      category: med.category,
      questionCategory: "dosage",
    }
  }

  // Enhanced achievements with more variety
  const achievements: Achievement[] = [
    {
      id: "first-correct",
      name: "First Success",
      description: "Answer your first question correctly",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      condition: (stats) => stats.correctAnswers >= 1,
      unlocked: false,
      reward: 10,
    },
    {
      id: "streak-5",
      name: "On Fire",
      description: "Get 5 questions correct in a row",
      icon: <Flame className="h-6 w-6 text-orange-500" />,
      condition: (stats) => stats.bestStreak >= 5,
      unlocked: false,
      reward: 25,
    },
    {
      id: "streak-10",
      name: "Unstoppable",
      description: "Get 10 questions correct in a row",
      icon: <Crown className="h-6 w-6 text-yellow-500" />,
      condition: (stats) => stats.bestStreak >= 10,
      unlocked: false,
      reward: 50,
    },
    {
      id: "total-50",
      name: "Knowledge Seeker",
      description: "Answer 50 questions correctly",
      icon: <BookOpen className="h-6 w-6 text-blue-500" />,
      condition: (stats) => stats.correctAnswers >= 50,
      unlocked: false,
      reward: 75,
    },
    {
      id: "total-100",
      name: "Expert",
      description: "Answer 100 questions correctly",
      icon: <Trophy className="h-6 w-6 text-purple-500" />,
      condition: (stats) => stats.correctAnswers >= 100,
      unlocked: false,
      reward: 100,
    },
    {
      id: "perfect-game",
      name: "Perfect Score",
      description: "Complete a game with 100% accuracy",
      icon: <Medal className="h-6 w-6 text-gold-500" />,
      condition: (stats) => stats.averageScore === 100 && stats.gamesPlayed > 0,
      unlocked: false,
      reward: 50,
    },
    {
      id: "variety-master",
      name: "Variety Master",
      description: "Answer 25 different types of questions",
      icon: <Shuffle className="h-6 w-6 text-cyan-500" />,
      condition: (stats) => stats.questionsAsked.length >= 25,
      unlocked: false,
      reward: 40,
    },
    {
      id: "speed-demon",
      name: "Speed Demon",
      description: "Complete a quiz in under 2 minutes",
      icon: <Target className="h-6 w-6 text-red-500" />,
      condition: (stats) => stats.totalPlayTime > 0, // This would need session tracking
      unlocked: false,
      reward: 30,
    },
  ]

  const checkAchievements = (newStats: GameStats) => {
    achievements.forEach((achievement) => {
      if (!newStats.achievements.includes(achievement.id) && achievement.condition(newStats)) {
        newStats.achievements.push(achievement.id)
        newStats.experience += achievement.reward
        setRecentAchievement(achievement)
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)
      }
    })
  }

  const calculateLevel = (experience: number): number => {
    return Math.floor(experience / 100) + 1
  }

  const startGame = (mode: "quiz" | "flashcards") => {
    const newQuestions = generateQuestions(10)
    setQuestions(newQuestions)
    setCurrentQuestion(newQuestions[0])
    setQuestionIndex(0)
    setGameMode(mode)
    setSessionStats({ correct: 0, incorrect: 0, startTime: Date.now() })
    setSelectedAnswer("")
    setShowAnswer(false)

    // Reset session questions
    setGameStats((prev) => ({
      ...prev,
      sessionQuestionsAsked: [],
    }))

    if (mode === "quiz") {
      setTimeLeft(30)
      setIsTimerActive(true)
    }
  }

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return

    setSelectedAnswer(answer)
    setShowAnswer(true)
    setIsTimerActive(false)

    const isCorrect = answer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()

    // Play sound effect
    if (soundEnabled) {
      playSound(isCorrect ? "correct" : "incorrect")
    }

    // Update session stats
    setSessionStats((prev) => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }))

    // Update game stats and track questions
    setGameStats((prev) => {
      const oldLevel = prev.level
      const newStats = {
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        streak: isCorrect ? prev.streak + 1 : 0,
        bestStreak: isCorrect ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak,
        experience: prev.experience + (isCorrect ? 5 : 1),
        lastPlayed: new Date().toISOString(),
        questionsAsked: [...new Set([...prev.questionsAsked, currentQuestion.id])],
        sessionQuestionsAsked: [...prev.sessionQuestionsAsked, currentQuestion.id],
      }

      newStats.level = calculateLevel(newStats.experience)

      // Play level up sound
      if (soundEnabled && newStats.level > oldLevel) {
        setTimeout(() => playSound("levelup"), 500)
      }

      checkAchievements(newStats)

      return newStats
    })
  }

  const handleTimeUp = () => {
    if (!showAnswer) {
      handleAnswer("")
    }
  }

  const nextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      const nextIndex = questionIndex + 1
      setQuestionIndex(nextIndex)
      setCurrentQuestion(questions[nextIndex])
      setSelectedAnswer("")
      setShowAnswer(false)
      setTimeLeft(30)
      setIsTimerActive(gameMode === "quiz")
    } else {
      endGame()
    }
  }

  const endGame = () => {
    setIsTimerActive(false)
    const sessionTime = Date.now() - sessionStats.startTime
    const accuracy = (sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100
    const timeInSeconds = Math.round(sessionTime / 1000)

    // Calculate bonuses and achievements
    const baseScore = Math.round(accuracy)
    const timeBonus = Math.max(0, Math.round((300 - timeInSeconds) / 10)) // Bonus for completing quickly
    const streakBonus = gameStats.streak * 2
    const totalXP = sessionStats.correct * 5 + sessionStats.incorrect * 1 + timeBonus + streakBonus

    const perfectGame = accuracy === 100
    const newRecord = accuracy > gameStats.averageScore
    const fastCompletion = timeInSeconds < 120

    // Generate motivational message
    const getMotivationalMessage = (score: number, perfect: boolean, record: boolean) => {
      if (perfect) return "🎯 PERFECT SCORE! You're a medication dosing expert!"
      if (score >= 90) return "🌟 Outstanding performance! Your knowledge is impressive!"
      if (score >= 80) return "🚀 Great job! You're mastering pediatric medications!"
      if (score >= 70) return "💪 Good work! Keep practicing to improve further!"
      if (score >= 60) return "📚 Nice effort! Review the explanations to boost your score!"
      return "🎯 Every question helps you learn! Keep going!"
    }

    const getPerformanceRating = (score: number) => {
      if (score >= 95) return "Expert"
      if (score >= 85) return "Advanced"
      if (score >= 75) return "Proficient"
      if (score >= 65) return "Developing"
      return "Beginner"
    }

    const badges = []
    if (perfectGame) badges.push("Perfect Score")
    if (newRecord) badges.push("New Personal Best")
    if (fastCompletion) badges.push("Speed Demon")
    if (gameStats.streak >= 5) badges.push("Streak Master")
    if (sessionStats.correct >= 8) badges.push("Knowledge Champion")

    const finalData = {
      score: baseScore,
      timeBonus,
      streakBonus,
      totalXP,
      newLevel: false, // Will be updated below
      perfectGame,
      newRecord,
      motivationalMessage: getMotivationalMessage(baseScore, perfectGame, newRecord),
      performanceRating: getPerformanceRating(baseScore),
      badges,
    }

    setGameStats((prev) => {
      const oldLevel = prev.level
      const newStats = {
        ...prev,
        totalPlayTime: prev.totalPlayTime + sessionTime,
        gamesPlayed: prev.gamesPlayed + 1,
        averageScore: (prev.averageScore * (prev.gamesPlayed - 1) + accuracy) / prev.gamesPlayed,
        experience: prev.experience + totalXP,
      }

      newStats.level = calculateLevel(newStats.experience)
      finalData.newLevel = newStats.level > oldLevel

      checkAchievements(newStats)
      return newStats
    })

    setFinalAchievementData(finalData)

    // Play completion sound and show final achievement
    if (soundEnabled) {
      playSound("complete")
    }

    setTimeout(() => {
      setShowFinalAchievement(true)
    }, 1000)
  }

  const resetGame = () => {
    setGameMode("menu")
    setCurrentQuestion(null)
    setQuestions([])
    setQuestionIndex(0)
    setSelectedAnswer("")
    setShowAnswer(false)
    setIsTimerActive(false)
    setTimeLeft(30)
  }

  const clearQuestionHistory = () => {
    setGameStats((prev) => ({
      ...prev,
      questionsAsked: [],
      sessionQuestionsAsked: [],
    }))
  }

  const renderMenu = () => (
    <div className="space-y-6">
      {/* Player Stats Header */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Crown className="h-6 w-6" />
                Level {gameStats.level}
              </h2>
              <p className="opacity-90">Experience: {gameStats.experience} XP</p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Best Streak</div>
              <div className="text-2xl font-bold flex items-center gap-1">
                <Flame className="h-5 w-5" />
                {gameStats.bestStreak}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress to Level {gameStats.level + 1}</span>
              <span>{gameStats.experience % 100}/100 XP</span>
            </div>
            <Progress value={gameStats.experience % 100} className="h-2" />
          </div>
          <div className="mt-2 text-xs opacity-75">
            Questions explored: {gameStats.questionsAsked.length} |
            <Button
              variant="ghost"
              size="sm"
              onClick={clearQuestionHistory}
              className="text-white hover:text-yellow-200 p-1 h-auto"
            >
              Reset Question Pool
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Game Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-500 hover:scale-105">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3 hover:animate-pulse">
                <div className="relative">
                  <Brain className="h-8 w-8 text-blue-600" />
                  <div className="absolute -top-1 -right-1 text-blue-400 scale-50">
                    {MedicationIcons.pill("w-4 h-4")}
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Quiz Mode</h3>
              <p className="text-gray-600 mb-4">Timed questions with variety and smart rotation</p>

              {/* Difficulty Selection */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Difficulty:</label>
                <div className="flex gap-2 justify-center">
                  {(["easy", "medium", "hard"] as const).map((level) => (
                    <Button
                      key={level}
                      variant={difficulty === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDifficulty(level)}
                      className="capitalize"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Category:</label>
                <div className="flex gap-2 justify-center">
                  {(["all", "antibiotics", "other"] as const).map((cat) => (
                    <Button
                      key={cat}
                      variant={category === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategory(cat)}
                      className="capitalize"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <Button onClick={() => startGame("quiz")} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Start Quiz
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-green-500 hover:scale-105">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-3 hover:animate-pulse">
                <div className="relative">
                  <BookOpen className="h-8 w-8 text-green-600" />
                  <div className="absolute -top-1 -right-1 text-green-400 scale-50">
                    {MedicationIcons.syrup("w-4 h-4")}
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Flashcard Mode</h3>
              <p className="text-gray-600 mb-4">Self-paced learning with detailed explanations</p>

              {/* Category Selection for Flashcards */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Category:</label>
                <div className="flex gap-2 justify-center">
                  {(["all", "antibiotics", "other"] as const).map((cat) => (
                    <Button
                      key={cat}
                      variant={category === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategory(cat)}
                      className="capitalize"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <Button onClick={() => startGame("flashcards")} className="w-full bg-green-600 hover:bg-green-700">
              <BookOpen className="h-4 w-4 mr-2" />
              Start Flashcards
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
              {gameStats.correctAnswers}
              {MedicationIcons.antibiotic("w-4 h-4 text-blue-400")}
            </div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
              {gameStats.gamesPlayed}
              {MedicationIcons.pill("w-4 h-4 text-green-400")}
            </div>
            <div className="text-sm text-gray-600">Games Played</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-1">
              {Math.round(gameStats.averageScore)}%{MedicationIcons.syringe("w-4 h-4 text-purple-400")}
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
              {gameStats.achievements.length}
              {MedicationIcons.capsule("w-4 h-4 text-orange-400")}
            </div>
            <div className="text-sm text-gray-600">Achievements</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {gameStats.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {achievements
                .filter((achievement) => gameStats.achievements.includes(achievement.id))
                .slice(-3)
                .map((achievement) => (
                  <Badge key={achievement.id} variant="secondary" className="flex items-center gap-1">
                    {achievement.icon}
                    {achievement.name}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderQuestion = () => {
    if (!currentQuestion) return null

    return (
      <div className="space-y-6">
        {/* Progress and Timer */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={resetGame}>
              <Home className="h-4 w-4 mr-2" />
              Menu
            </Button>
            <Badge variant="outline">
              Question {questionIndex + 1} of {questions.length}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              {getMedicationIcon(
                currentQuestion.medication,
                currentQuestion.category,
                currentQuestion.questionCategory,
              )}
              {currentQuestion.questionCategory}
            </Badge>
          </div>

          {gameMode === "quiz" && (
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span className={`font-bold ${timeLeft <= 10 ? "text-red-500" : "text-gray-700"}`}>{timeLeft}s</span>
            </div>
          )}
        </div>

        <Progress value={(questionIndex / questions.length) * 100} className="h-2" />

        {/* Question Card */}
        <Card className="border-2 relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 animate-pulse">
            <div
              className={`w-full h-full ${getMedicationColor(currentQuestion.medication, currentQuestion.category)}`}
            >
              {getMedicationIcon(
                currentQuestion.medication,
                currentQuestion.category,
                currentQuestion.questionCategory,
              )}
            </div>
          </div>

          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 ${getMedicationColor(currentQuestion.medication, currentQuestion.category)} shadow-md`}
                >
                  {getMedicationIcon(
                    currentQuestion.medication,
                    currentQuestion.category,
                    currentQuestion.questionCategory,
                  )}
                </div>
                <div>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getMedicationIcon(currentQuestion.medication, currentQuestion.category, "form")}
                      {currentQuestion.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {currentQuestion.type.replace("-", " ")}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
                  {currentQuestion.medication && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
                      <span
                        className={`${getMedicationColor(currentQuestion.medication, currentQuestion.category)} scale-75`}
                      >
                        {getMedicationIcon(currentQuestion.medication, currentQuestion.category)}
                      </span>
                      <span className="font-medium">{currentQuestion.medication}</span>
                    </p>
                  )}
                </div>
              </div>
              <Badge
                variant={
                  currentQuestion.difficulty === "easy"
                    ? "secondary"
                    : currentQuestion.difficulty === "medium"
                      ? "default"
                      : "destructive"
                }
                className="flex items-center gap-1"
              >
                {currentQuestion.difficulty === "easy" && MedicationIcons.pediatric("w-3 h-3")}
                {currentQuestion.difficulty === "medium" && MedicationIcons.tablet("w-3 h-3")}
                {currentQuestion.difficulty === "hard" && MedicationIcons.injection("w-3 h-3")}
                {currentQuestion.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {(currentQuestion.type === "multiple-choice" || currentQuestion.type === "true-false") && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <Button
                    key={index}
                    variant={
                      showAnswer
                        ? option === currentQuestion.correctAnswer
                          ? "default"
                          : selectedAnswer === option
                            ? "destructive"
                            : "outline"
                        : selectedAnswer === option
                          ? "default"
                          : "outline"
                    }
                    className="w-full text-left justify-start h-auto p-4 hover:scale-102 transition-all duration-200"
                    onClick={() => !showAnswer && handleAnswer(option)}
                    disabled={showAnswer}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                        {currentQuestion.type === "true-false"
                          ? option === "True"
                            ? "T"
                            : "F"
                          : String.fromCharCode(65 + index)}
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className={`w-5 h-5 flex-shrink-0 ${getMedicationColor(currentQuestion.medication, currentQuestion.category)}`}
                        >
                          {getMedicationIcon(
                            currentQuestion.medication,
                            currentQuestion.category,
                            currentQuestion.questionCategory,
                          )}
                        </div>
                        <span className="flex-1 break-words">{option}</span>
                      </div>
                      {showAnswer && option === currentQuestion.correctAnswer && (
                        <CheckCircle className="h-5 w-5 text-green-500 ml-auto animate-bounce flex-shrink-0" />
                      )}
                      {showAnswer && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                        <XCircle className="h-5 w-5 text-red-500 ml-auto animate-pulse flex-shrink-0" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {currentQuestion.type === "flashcard" && (
              <div className="text-center space-y-4">
                {!showAnswer ? (
                  <Button onClick={() => setShowAnswer(true)} size="lg" className="flex items-center gap-2">
                    {getMedicationIcon(currentQuestion.medication, currentQuestion.category)}
                    Show Answer
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="text-blue-600">
                          {getMedicationIcon(currentQuestion.medication, currentQuestion.category)}
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                        {currentQuestion.correctAnswer}
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={() => handleAnswer(currentQuestion.correctAnswer)}
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />I knew it
                      </Button>
                      <Button onClick={() => handleAnswer("")} variant="outline" className="flex items-center gap-2">
                        <XCircle className="h-4 w-4" />I didn't know
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentQuestion.type === "fill-blank" && (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full p-4 border-2 rounded-lg text-center text-lg font-medium"
                    disabled={showAnswer}
                    onKeyPress={(e) => e.key === "Enter" && !showAnswer && handleAnswer(selectedAnswer)}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className={`${getMedicationColor(currentQuestion.medication, currentQuestion.category)}`}>
                      {getMedicationIcon(currentQuestion.medication, currentQuestion.category)}
                    </div>
                  </div>
                </div>
                {!showAnswer && (
                  <Button onClick={() => handleAnswer(selectedAnswer)} className="w-full flex items-center gap-2">
                    {getMedicationIcon(currentQuestion.medication, currentQuestion.category)}
                    Submit Answer
                  </Button>
                )}
              </div>
            )}

            {showAnswer && (
              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900 dark:text-blue-100">Explanation:</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{currentQuestion.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {showAnswer && (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {selectedAnswer === currentQuestion.correctAnswer ? (
                <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Correct! +5 XP
                  {MedicationIcons.antibiotic("w-3 h-3 text-green-600")}
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Incorrect +1 XP
                  {MedicationIcons.pill("w-3 h-3 text-red-200")}
                </Badge>
              )}
            </div>
            <Button onClick={nextQuestion} className="flex items-center gap-2">
              {questionIndex < questions.length - 1 ? "Next Question" : "Finish Game"}
              {getMedicationIcon(currentQuestion.medication, currentQuestion.category, "form")}
            </Button>
          </div>
        )}

        {/* Session Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {sessionStats.correct}
                  {MedicationIcons.antibiotic("w-3 h-3 text-green-400")}
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-500" />
                  {sessionStats.incorrect}
                  {MedicationIcons.pill("w-3 h-3 text-red-400")}
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Streak: {gameStats.streak}
                  {MedicationIcons.syringe("w-3 h-3 text-orange-400")}
                </span>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  Accuracy:{" "}
                  {sessionStats.correct + sessionStats.incorrect > 0
                    ? Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100)
                    : 0}
                  %
                </div>
                {MedicationIcons.capsule("w-4 h-4 text-blue-500")}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderStats = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Game Complete!
          {MedicationIcons.antibiotic("w-6 h-6 text-yellow-500")}
        </h2>
        <Button onClick={resetGame}>
          <Home className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
      </div>

      {/* Session Results */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Session Results
            {MedicationIcons.syrup("w-5 h-5 text-blue-500")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-1">
                {sessionStats.correct}
                {MedicationIcons.antibiotic("w-6 h-6 text-green-400")}
              </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 flex items-center justify-center gap-1">
                {sessionStats.incorrect}
                {MedicationIcons.pill("w-6 h-6 text-red-400")}
              </div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 flex items-center justify-center gap-1">
                {Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100)}%
                {MedicationIcons.capsule("w-6 h-6 text-blue-400")}
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 flex items-center justify-center gap-1">
                {Math.round((Date.now() - sessionStats.startTime) / 1000)}s
                {MedicationIcons.syringe("w-6 h-6 text-purple-400")}
              </div>
              <div className="text-sm text-gray-600">Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Overall Statistics
            {MedicationIcons.vial("w-5 h-5 text-purple-500")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                {gameStats.level}
                {MedicationIcons.pediatric("w-5 h-5 text-blue-400")}
              </div>
              <div className="text-sm text-gray-600">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                {gameStats.experience}
                {MedicationIcons.antibiotic("w-5 h-5 text-green-400")}
              </div>
              <div className="text-sm text-gray-600">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-1">
                {gameStats.correctAnswers}
                {MedicationIcons.tablet("w-5 h-5 text-purple-400")}
              </div>
              <div className="text-sm text-gray-600">Total Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                {gameStats.bestStreak}
                {MedicationIcons.drops("w-5 h-5 text-orange-400")}
              </div>
              <div className="text-sm text-gray-600">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 flex items-center justify-center gap-1">
                {gameStats.gamesPlayed}
                {MedicationIcons.syrup("w-5 h-5 text-indigo-400")}
              </div>
              <div className="text-sm text-gray-600">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600 flex items-center justify-center gap-1">
                {Math.round(gameStats.averageScore)}%{MedicationIcons.injection("w-5 h-5 text-pink-400")}
              </div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements ({gameStats.achievements.length}/{achievements.length})
            {MedicationIcons.capsule("w-5 h-5 text-yellow-500")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const isUnlocked = gameStats.achievements.includes(achievement.id)
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    isUnlocked
                      ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md"
                      : "border-gray-200 bg-gray-50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${isUnlocked ? "animate-pulse" : "grayscale"} flex items-center gap-1`}>
                      {achievement.icon}
                      {isUnlocked && MedicationIcons.antibiotic("w-4 h-4 text-yellow-500")}
                    </div>
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {achievement.name}
                        {isUnlocked && MedicationIcons.pill("w-3 h-3 text-green-500")}
                      </div>
                      <div className="text-sm text-gray-600">{achievement.description}</div>
                      <div className="text-xs text-blue-600 flex items-center gap-1">
                        +{achievement.reward} XP
                        {MedicationIcons.drops("w-3 h-3 text-blue-400")}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Play Again */}
      <div className="flex gap-4 justify-center">
        <Button onClick={() => startGame("quiz")} size="lg" className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Play Quiz Again
          {MedicationIcons.syringe("w-4 h-4")}
        </Button>
        <Button onClick={() => startGame("flashcards")} variant="outline" size="lg" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Study Flashcards
          {MedicationIcons.tablet("w-4 h-4")}
        </Button>
      </div>
    </div>
  )

  const renderFinalAchievement = () => {
    if (!finalAchievementData) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <div className="text-yellow-400 text-2xl">
                {Object.values(MedicationIcons)[Math.floor(Math.random() * Object.values(MedicationIcons).length)](
                  "w-8 h-8",
                )}
              </div>
            </div>
          ))}
        </div>

        <Card className="relative z-10 max-w-2xl w-full mx-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 border-4 border-yellow-300 shadow-2xl animate-scale-in">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <Trophy className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 animate-bounce">
                  {MedicationIcons.antibiotic("w-8 h-8 text-yellow-600")}
                </div>
              </div>
            </div>

            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              🎉 Quiz Complete! 🎉
            </CardTitle>

            <div className="text-lg text-gray-700 mb-4">{finalAchievementData.motivationalMessage}</div>

            <Badge
              variant="secondary"
              className={`text-lg px-4 py-2 ${
                finalAchievementData.score >= 90
                  ? "bg-green-100 text-green-800"
                  : finalAchievementData.score >= 80
                    ? "bg-blue-100 text-blue-800"
                    : finalAchievementData.score >= 70
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {finalAchievementData.performanceRating} Level
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score Breakdown */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Performance Breakdown
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-1">
                    {finalAchievementData.score}%{MedicationIcons.antibiotic("w-6 h-6 text-green-400")}
                  </div>
                  <div className="text-sm text-gray-600">Base Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                    +{finalAchievementData.totalXP}
                    {MedicationIcons.pill("w-5 h-5 text-blue-400")}
                  </div>
                  <div className="text-sm text-gray-600">Total XP Earned</div>
                </div>
              </div>

              {/* Bonus breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Timer className="h-4 w-4 text-orange-500" />
                    Time Bonus:
                  </span>
                  <span className="font-semibold">+{finalAchievementData.timeBonus} XP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-red-500" />
                    Streak Bonus:
                  </span>
                  <span className="font-semibold">+{finalAchievementData.streakBonus} XP</span>
                </div>
              </div>
            </div>

            {/* Badges and Achievements */}
            {finalAchievementData.badges.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-yellow-200">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Badges Earned
                </h3>
                <div className="flex flex-wrap gap-2">
                  {finalAchievementData.badges.map((badge, index) => (
                    <Badge
                      key={index}
                      className="bg-yellow-500 text-white animate-bounce flex items-center gap-1"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      {MedicationIcons.capsule("w-3 h-3")}
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Special Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {finalAchievementData.perfectGame && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center animate-pulse">
                  <div className="text-green-600 mb-2">{MedicationIcons.antibiotic("w-8 h-8 mx-auto")}</div>
                  <div className="font-bold text-green-800">Perfect Game!</div>
                  <div className="text-xs text-green-600">100% Accuracy</div>
                </div>
              )}

              {finalAchievementData.newRecord && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center animate-pulse">
                  <div className="text-blue-600 mb-2">{MedicationIcons.syringe("w-8 h-8 mx-auto")}</div>
                  <div className="font-bold text-blue-800">New Record!</div>
                  <div className="text-xs text-blue-600">Personal Best</div>
                </div>
              )}

              {finalAchievementData.newLevel && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-center animate-bounce">
                  <div className="text-purple-600 mb-2">{MedicationIcons.capsule("w-8 h-8 mx-auto")}</div>
                  <div className="font-bold text-purple-800">Level Up!</div>
                  <div className="text-xs text-purple-600">New Level Reached</div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">{gameStats.experience % 100}/100 XP to next level</span>
              </div>
              <Progress value={gameStats.experience % 100} className="h-3" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center pt-4">
              <Button
                onClick={() => {
                  setShowFinalAchievement(false)
                  startGame("quiz")
                }}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Play Again
                {MedicationIcons.pill("w-4 h-4")}
              </Button>

              <Button
                onClick={() => {
                  setShowFinalAchievement(false)
                  resetGame()
                }}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Main Menu
                {MedicationIcons.syrup("w-4 h-4")}
              </Button>
            </div>

            {/* Sound Toggle */}
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center gap-2 text-gray-600"
              >
                {soundEnabled ? "🔊" : "🔇"} Sound {soundEnabled ? "On" : "Off"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Celebration Animation */}
      {showCelebration && recentAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          {/* Floating medication icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`absolute animate-bounce text-4xl opacity-30`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <div className="text-blue-400">
                  {Object.values(MedicationIcons)[Math.floor(Math.random() * Object.values(MedicationIcons).length)](
                    "w-8 h-8",
                  )}
                </div>
              </div>
            ))}
          </div>

          <Card className="p-6 text-center animate-bounce relative z-10 border-4 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-2xl">
            <div className="text-6xl mb-4 animate-pulse">🎉</div>
            <div className="flex justify-center mb-4">
              <div className="text-yellow-500 animate-spin">{MedicationIcons.antibiotic("w-12 h-12")}</div>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-yellow-800">Achievement Unlocked!</h3>
            <div className="flex items-center justify-center gap-2 mb-2">
              {recentAchievement.icon}
              <span className="font-semibold">{recentAchievement.name}</span>
              {MedicationIcons.capsule("w-4 h-4 text-yellow-600")}
            </div>
            <p className="text-gray-600 mb-4">{recentAchievement.description}</p>
            <Badge className="bg-yellow-500 animate-pulse flex items-center gap-1">
              +{recentAchievement.reward} XP
              {MedicationIcons.pill("w-3 h-3 text-yellow-200")}
            </Badge>
          </Card>
        </div>
      )}

      {/* Final Achievement Screen */}
      {showFinalAchievement && renderFinalAchievement()}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            Medication Learning Game
            <Zap className="h-8 w-8 text-yellow-500" />
            {MedicationIcons.antibiotic("w-8 h-8 text-green-500")}
            <Button variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)} className="ml-4">
              {soundEnabled ? "🔊" : "🔇"}
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {gameMode === "menu" && renderMenu()}
      {(gameMode === "quiz" || gameMode === "flashcards") && renderQuestion()}
      {gameMode === "stats" && renderStats()}
    </div>
  )
}
