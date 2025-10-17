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
  BookOpen,
  Timer,
  CheckCircle,
  XCircle,
  Play,
  Home,
  Medal,
  Flame,
  Crown,
  Shuffle,
  Target,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Filter,
  Star,
  StarOff,
  Settings,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { medicationData } from "@/data/medicationData"

// Create a single AudioContext instance
let audioContext: AudioContext | null = null

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

const playSound = (type: "correct" | "incorrect" | "achievement" | "levelup" | "complete" | "flip" | "swipe") => {
  const createTone = (frequency: number, duration: number, type: "sine" | "square" | "triangle" = "sine") => {
    try {
      const context = getAudioContext()
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(context.destination)

      oscillator.frequency.setValueAtTime(frequency, context.currentTime)
      oscillator.type = type

      gainNode.gain.setValueAtTime(0.3, context.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration)

      oscillator.start(context.currentTime)
      oscillator.stop(context.currentTime + duration)
    } catch (error) {
      console.log("Audio not supported")
    }
  }

  try {
    switch (type) {
      case "correct":
        createTone(523.25, 0.2)
        setTimeout(() => createTone(659.25, 0.2), 100)
        setTimeout(() => createTone(783.99, 0.3), 200)
        break
      case "incorrect":
        createTone(349.23, 0.3, "triangle")
        setTimeout(() => createTone(293.66, 0.4, "triangle"), 150)
        break
      case "flip":
        createTone(440, 0.1)
        break
      case "swipe":
        createTone(523.25, 0.1)
        break
      case "achievement":
        createTone(523.25, 0.2)
        setTimeout(() => createTone(659.25, 0.2), 100)
        setTimeout(() => createTone(783.99, 0.2), 200)
        setTimeout(() => createTone(1046.5, 0.4), 300)
        break
      case "levelup":
        const notes = [261.63, 329.63, 392.0, 523.25, 659.25]
        notes.forEach((note, index) => {
          setTimeout(() => createTone(note, 0.2), index * 100)
        })
        break
      case "complete":
        createTone(523.25, 0.3)
        setTimeout(() => createTone(659.25, 0.3), 200)
        setTimeout(() => createTone(783.99, 0.3), 400)
        setTimeout(() => createTone(1046.5, 0.6), 600)
        break
    }
  } catch (error) {
    console.log("Audio not supported in this browser")
  }
}

// Comprehensive SVG Icon Library for Medications
const MedicationIcons = {
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

const getMedicationIcon = (medicationName: string, category: string, questionType?: string) => {
  const name = medicationName.toLowerCase()

  if (questionType === "dosage") return MedicationIcons.milligram()
  if (questionType === "volume") return MedicationIcons.milliliter()

  if (name.includes("baby") || name.includes("infant")) return MedicationIcons.infant()
  if (name.includes("paediatric") || name.includes("pediatric")) return MedicationIcons.pediatric()

  if (name.includes("drops")) return MedicationIcons.drops()
  if (name.includes("syrup")) return MedicationIcons.syrup()
  if (name.includes("elixir")) return MedicationIcons.elixir()
  if (name.includes("suspension")) return MedicationIcons.suspension()
  if (name.includes("injection") || name.includes("zovirax")) return MedicationIcons.injection()
  if (name.includes("tablet")) return MedicationIcons.tablet()
  if (name.includes("capsule")) return MedicationIcons.capsule()

  if (name.includes("panadol") || name.includes("adol") || name.includes("brufen")) return MedicationIcons.painkiller()
  if (name.includes("aerius") || name.includes("zyrtec")) return MedicationIcons.antihistamine()
  if (name.includes("depakine") || name.includes("tegretol") || name.includes("trileptal"))
    return MedicationIcons.anticonvulsant()
  if (name.includes("zovirax")) return MedicationIcons.antiviral()

  if (category === "antibiotics") return MedicationIcons.antibiotic()

  if (name.includes("mg/ml") || name.includes("mg/5ml")) return MedicationIcons.syrup()

  return MedicationIcons.pill()
}

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
  questionsAsked: string[]
  sessionQuestionsAsked: string[]
  flashcardProgress: {
    [key: string]: { correct: number; incorrect: number; lastReviewed: string; bookmarked: boolean }
  }
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
  const [gameMode, setGameMode] = useState<"menu" | "quiz" | "flashcards" | "stats">("menu")
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [showAnswer, setShowAnswer] = useState(false)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
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
    flashcardProgress: {},
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

  // Flashcard-specific state
  const [flashcardFilter, setFlashcardFilter] = useState<"all" | "needReview" | "bookmarked">("all")
  const [isShuffled, setIsShuffled] = useState(false)
  const [autoAdvance, setAutoAdvance] = useState(false)
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState(3000)
  const [showSettings, setShowSettings] = useState(false)
  const [cardAnimation, setCardAnimation] = useState<"none" | "slide-left" | "slide-right">("none")

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

  useEffect(() => {
    const savedStats = localStorage.getItem("medicationGameStats")
    if (savedStats) {
      const parsed = JSON.parse(savedStats) // FIXED: Was JSON.JSON.parse
      setGameStats({
        ...parsed,
        questionsAsked: parsed.questionsAsked || [],
        sessionQuestionsAsked: [],
        flashcardProgress: parsed.flashcardProgress || {},
      })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("medicationGameStats", JSON.stringify(gameStats))
  }, [gameStats])

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

  // Auto-advance effect for flashcards
  useEffect(() => {
    if (autoAdvance && isCardFlipped && gameMode === "flashcards" && !showAnswer) {
      const timer = setTimeout(() => {
        setIsCardFlipped(false)
      }, autoAdvanceDelay)
      return () => clearTimeout(timer)
    }
  }, [autoAdvance, isCardFlipped, gameMode, showAnswer, autoAdvanceDelay])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameMode === "flashcards" && currentQuestion) {
        switch (e.key) {
          case " ":
          case "Enter":
            e.preventDefault()
            if (!isCardFlipped) {
              setIsCardFlipped(true)
              if (soundEnabled) playSound("flip")
            }
            break
          case "ArrowRight":
            e.preventDefault()
            if (isCardFlipped) {
              handleAnswer(true)
            }
            break
          case "ArrowLeft":
            e.preventDefault()
            if (isCardFlipped) {
              handleAnswer(false)
            }
            break
          case "b":
            e.preventDefault()
            toggleBookmark()
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [gameMode, currentQuestion, isCardFlipped, soundEnabled])

  const generateQuestions = useCallback(
    (count = 10): Question[] => {
      const allMedications = [
        ...medicationData.antibiotics.map((med) => ({ ...med, category: "antibiotics" as const })),
        ...medicationData.other.map((med) => ({ ...med, category: "other" as const })),
      ]

      let filteredMeds = category === "all" ? allMedications : allMedications.filter((med) => med.category === category)

      if (gameMode === "flashcards" && flashcardFilter !== "all") {
        filteredMeds = filteredMeds.filter((med) => {
          const progress = gameStats.flashcardProgress[med.name]
          if (flashcardFilter === "needReview") {
            return !progress || progress.incorrect > progress.correct
          }
          if (flashcardFilter === "bookmarked") {
            return progress?.bookmarked
          }
          return true
        })
      }

      const shuffleArray = (array: any[]) => {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
      }

      filteredMeds = shuffleArray(filteredMeds)

      if (isShuffled) {
        filteredMeds = shuffleArray(filteredMeds)
      }

      const questions: Question[] = []
      const usedQuestionIds = new Set(gameStats.sessionQuestionsAsked)
      const questionTypes = ["multiple-choice", "flashcard", "fill-blank", "true-false", "dosage-calc"] as const
      const questionCategories = ["dosage", "indication", "frequency", "form", "age-group", "volume"] as const

      const medicationPool: any[] = []
      while (medicationPool.length < count) {
        const remaining = count - medicationPool.length
        if (remaining >= filteredMeds.length) {
          medicationPool.push(...shuffleArray(filteredMeds))
        } else {
          medicationPool.push(...shuffleArray(filteredMeds).slice(0, remaining))
        }
      }

      for (let i = 0; i < count && questions.length < count; i++) {
        const med = medicationPool[i]

        const availableTypes = questionTypes.filter((type) => {
          const questionId = `${med.name}-${type}`
          return !usedQuestionIds.has(questionId)
        })

        if (availableTypes.length === 0) {
          availableTypes.push(...questionTypes)
        }

        const questionType =
          gameMode === "flashcards" ? "flashcard" : availableTypes[Math.floor(Math.random() * availableTypes.length)]

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

        usedQuestionIds.add(question.id)
        questions.push(question)
      }

      return questions
    },
    [
      category,
      difficulty,
      gameStats.sessionQuestionsAsked,
      gameMode,
      flashcardFilter,
      isShuffled,
      gameStats.flashcardProgress,
    ],
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
      condition: (stats) => stats.totalPlayTime > 0,
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

  const toggleBookmark = () => {
    if (!currentQuestion) return

    setGameStats((prev) => {
      const progress = prev.flashcardProgress[currentQuestion.medication] || {
        correct: 0,
        incorrect: 0,
        lastReviewed: new Date().toISOString(),
        bookmarked: false,
      }

      return {
        ...prev,
        flashcardProgress: {
          ...prev.flashcardProgress,
          [currentQuestion.medication]: {
            ...progress,
            bookmarked: !progress.bookmarked,
          },
        },
      }
    })

    if (soundEnabled) playSound("flip")
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
    setIsCardFlipped(false)
    setCardAnimation("none")

    setGameStats((prev) => ({
      ...prev,
      sessionQuestionsAsked: [],
    }))

    if (mode === "quiz") {
      setTimeLeft(30)
      setIsTimerActive(true)
    }
  }

  const handleAnswer = (answer: string | boolean) => {
    if (!currentQuestion) return

    if (currentQuestion.type === "flashcard") {
      const isCorrect = answer === true
      if (soundEnabled) {
        playSound(isCorrect ? "correct" : "incorrect")
      }

      const nextIdx = questionIndex + 1

      setGameStats((prev) => {
        const progress = prev.flashcardProgress[currentQuestion.medication] || {
          correct: 0,
          incorrect: 0,
          lastReviewed: new Date().toISOString(),
          bookmarked: false,
        }

        return {
          ...prev,
          flashcardProgress: {
            ...prev.flashcardProgress,
            [currentQuestion.medication]: {
              ...progress,
              correct: progress.correct + (isCorrect ? 1 : 0),
              incorrect: progress.incorrect + (isCorrect ? 0 : 1),
              lastReviewed: new Date().toISOString(),
            },
          },
        }
      })

      setSessionStats((prev) => ({
        ...prev,
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      }))

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
        if (soundEnabled && newStats.level > oldLevel) {
          setTimeout(() => playSound("levelup"), 500)
        }
        checkAchievements(newStats)
        return newStats
      })

      setCardAnimation(isCorrect ? "slide-right" : "slide-left")

      setTimeout(() => {
        if (nextIdx < questions.length) {
          setQuestionIndex(nextIdx)
          setCurrentQuestion(questions[nextIdx])
          setIsCardFlipped(false)
          setShowAnswer(false)
          setCardAnimation("slide-in")
          setTimeout(() => setCardAnimation("none"), 300)
        } else {
          endGame()
        }
      }, 300)

      return
    }

    setSelectedAnswer(String(answer))
    setShowAnswer(true)
    setIsTimerActive(false)
    setIsCardFlipped(false)

    const isCorrect = String(answer).toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()

    if (soundEnabled) {
      playSound(isCorrect ? "correct" : "incorrect")
    }

    setSessionStats((prev) => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }))

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
      setIsCardFlipped(false)
      setTimeLeft(30)
      setIsTimerActive(gameMode === "quiz")
    } else {
      endGame()
    }
  }

  const previousQuestion = () => {
    if (questionIndex > 0) {
      const prevIndex = questionIndex - 1
      setQuestionIndex(prevIndex)
      setCurrentQuestion(questions[prevIndex])
      setIsCardFlipped(false)
      setShowAnswer(false)
      if (soundEnabled) playSound("swipe")
    }
  }

  const handleFlipCard = () => {
    setIsCardFlipped(!isCardFlipped)
  }

  const endGame = () => {
    setIsTimerActive(false)
    const sessionTime = Date.now() - sessionStats.startTime
    const accuracy = (sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100
    const timeInSeconds = Math.round(sessionTime / 1000)

    const baseScore = Math.round(accuracy)
    const timeBonus = Math.max(0, Math.round((300 - timeInSeconds) / 10))
    const streakBonus = gameStats.streak * 2
    const totalXP = sessionStats.correct * 5 + sessionStats.incorrect * 1 + timeBonus + streakBonus

    const perfectGame = accuracy === 100
    const newRecord = accuracy > gameStats.averageScore
    const fastCompletion = timeInSeconds < 120

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
      newLevel: false,
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

    if (soundEnabled) {
      playSound("complete")
    }

    setTimeout(() => {
      setGameMode("stats")
    }, 1000)
  }

  const resetGame = () => {
    setGameMode("menu")
    setCurrentQuestion(null)
    setQuestions([])
    setQuestionIndex(0)
    setSelectedAnswer("")
    setShowAnswer(false)
    setIsCardFlipped(false)
    setIsTimerActive(false)
    setTimeLeft(30)
    setCardAnimation("none")
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
              <h3 className="text-xl font-bold mb-2">Flashcard Mode ✨</h3>
              <p className="text-gray-600 mb-4">Enhanced study mode with progress tracking</p>

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

  const renderFlashcards = () => {
    if (!currentQuestion) return null

    const currentProgress = gameStats.flashcardProgress[currentQuestion.medication]
    const isBookmarked = currentProgress?.bookmarked || false

    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={resetGame} size="sm">
              <Home className="h-4 w-4 mr-2" />
              Menu
            </Button>
            <Badge variant="outline" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Card {questionIndex + 1} of {questions.length}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              {category === "all" && <Shuffle className="h-3 w-3" />}
              {category === "antibiotics" && MedicationIcons.antibiotic("w-3 h-3")}
              {category === "other" && MedicationIcons.painkiller("w-3 h-3")}
              {category === "all" ? "Mixed" : category === "antibiotics" ? "Antibiotics" : "Other Meds"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-1"
            >
              {soundEnabled ? "🔊" : "🔇"}
            </Button>
          </div>
        </div>

        {showSettings && (
          <Card className="border-2 border-blue-200 bg-blue-50 animate-fade-in">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Flashcard Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter Cards</label>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant={flashcardFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFlashcardFilter("all")
                        startGame("flashcards")
                      }}
                      className="w-full justify-start"
                    >
                      <Filter className="h-3 w-3 mr-2" />
                      All Cards
                    </Button>
                    <Button
                      variant={flashcardFilter === "needReview" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFlashcardFilter("needReview")
                        startGame("flashcards")
                      }}
                      className="w-full justify-start"
                    >
                      <Repeat className="h-3 w-3 mr-2" />
                      Need Review
                    </Button>
                    <Button
                      variant={flashcardFilter === "bookmarked" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFlashcardFilter("bookmarked")
                        startGame("flashcards")
                      }}
                      className="w-full justify-start"
                    >
                      <Star className="h-3 w-3 mr-2" />
                      Bookmarked
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Card Order</label>
                  <Button
                    variant={isShuffled ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setIsShuffled(!isShuffled)
                      startGame("flashcards")
                    }}
                    className="w-full"
                  >
                    <Shuffle className="h-3 w-3 mr-2" />
                    {isShuffled ? "Shuffled" : "Sequential"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Auto Advance</label>
                  <Button
                    variant={autoAdvance ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoAdvance(!autoAdvance)}
                    className="w-full"
                  >
                    <Timer className="h-3 w-3 mr-2" />
                    {autoAdvance ? "Enabled" : "Disabled"}
                  </Button>
                  {autoAdvance && (
                    <select
                      value={autoAdvanceDelay}
                      onChange={(e) => setAutoAdvanceDelay(Number(e.target.value))}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value={2000}>2 seconds</option>
                      <option value={3000}>3 seconds</option>
                      <option value={5000}>5 seconds</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-600 pt-2 border-t">
                <p className="font-semibold mb-1">Keyboard Shortcuts:</p>
                <div className="grid grid-cols-2 gap-2">
                  <span>• Space/Enter: Flip card</span>
                  <span>• Right Arrow: I knew this</span>
                  <span>• Left Arrow: Need to study</span>
                  <span>• B: Bookmark card</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Progress value={((questionIndex + 1) / questions.length) * 100} className="h-2" />

        <div
          className={`transition-all duration-300 ${
            cardAnimation === "slide-left"
              ? "animate-slide-out -translate-x-full opacity-0"
              : cardAnimation === "slide-right"
                ? "animate-slide-out translate-x-full opacity-0"
                : cardAnimation === "slide-in"
                  ? "animate-slide-in"
                  : ""
          }`}
        >
          <div
            className="relative w-full h-96 cursor-pointer"
            onClick={() => {
              if (soundEnabled) playSound("flip")
              setIsCardFlipped(!isCardFlipped)
            }}
            style={{ perspective: "1000px" }}
          >
            <div
              className="relative w-full h-full transition-transform duration-600"
              style={{
                transformStyle: "preserve-3d",
                transform: isCardFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <Card
                className="absolute w-full h-full border-4 border-blue-300 shadow-2xl backface-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleBookmark()
                    }}
                    className="absolute top-4 right-4"
                  >
                    {isBookmarked ? (
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="h-5 w-5 text-gray-400" />
                    )}
                  </Button>

                  <div className="text-8xl mb-6 animate-bounce">❓</div>
                  <div className={`mb-4 ${getMedicationColor(currentQuestion.medication, currentQuestion.category)}`}>
                    {getMedicationIcon(
                      currentQuestion.medication,
                      currentQuestion.category,
                      currentQuestion.questionCategory,
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-blue-900 mb-4 text-center">{currentQuestion.medication}</h2>
                  <p className="text-xl text-gray-700 text-center mb-8">{currentQuestion.question}</p>

                  {currentProgress && (
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {currentProgress.correct} correct
                      </span>
                      <span className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-500" />
                        {currentProgress.incorrect} incorrect
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-4 text-sm text-gray-500 animate-pulse flex items-center gap-2">
                    <RotateCw className="h-4 w-4" />
                    <span>Click or press Space to flip</span>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="absolute w-full h-full border-4 border-green-300 shadow-2xl backface-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-50 to-green-100">
                  <div className="text-8xl mb-6">✅</div>
                  <div className={`mb-4 ${getMedicationColor(currentQuestion.medication, currentQuestion.category)}`}>
                    {getMedicationIcon(currentQuestion.medication, currentQuestion.category)}
                  </div>
                  <div className="text-center max-w-md">
                    <h4 className="text-lg font-semibold text-green-900 mb-3">Answer:</h4>
                    <p className="text-2xl font-bold text-green-700 mb-4">{currentQuestion.correctAnswer}</p>
                    <p className="text-sm text-gray-600">{currentQuestion.explanation}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {isCardFlipped && !showAnswer && (
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleAnswer(false)
              }}
              variant="outline"
              size="lg"
              className="flex items-center justify-center gap-2 px-8 py-6 border-2 border-red-400 hover:bg-red-50"
            >
              <ArrowLeft className="h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">Need to Study</div>
                <div className="text-xs text-gray-500">Left Arrow</div>
              </div>
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleAnswer(true)
              }}
              size="lg"
              className="flex items-center justify-center gap-2 px-8 py-6 bg-green-600 hover:bg-green-700"
            >
              <div className="text-right">
                <div className="font-bold">I Knew This!</div>
                <div className="text-xs opacity-80">Right Arrow</div>
              </div>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={questionIndex === 0}
            className="flex items-center gap-2 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-gray-600">
            {questionIndex + 1} / {questions.length}
          </div>

          <Button
            variant="outline"
            onClick={() => {
              if (questionIndex < questions.length - 1) {
                const nextIdx = questionIndex + 1
                setQuestionIndex(nextIdx)
                setCurrentQuestion(questions[nextIdx])
                setIsCardFlipped(false)
                if (soundEnabled) playSound("swipe")
              } else {
                endGame()
              }
            }}
            className="flex items-center gap-2"
          >
            {questionIndex < questions.length - 1 ? "Skip" : "Finish"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-1">
                  {sessionStats.correct}
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="text-sm text-gray-600">Known</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600 flex items-center justify-center gap-1">
                  {sessionStats.incorrect}
                  <XCircle className="h-6 w-6" />
                </div>
                <div className="text-sm text-gray-600">To Study</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 flex items-center justify-center gap-1">
                  {gameStats.streak}
                  <Flame className="h-6 w-6" />
                </div>
                <div className="text-sm text-gray-600">Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null

    return <div className="text-center p-8">Quiz mode rendering...</div>
  }

  const renderStats = () => {
    return <div className="text-center p-8">Stats rendering...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            Medication Learning Game
            <Zap className="h-8 w-8 text-yellow-500" />
            {MedicationIcons.antibiotic("w-8 h-8 text-green-500")}
          </CardTitle>
        </CardHeader>
      </Card>

      {gameMode === "menu" && renderMenu()}
      {gameMode === "quiz" && renderQuestion()}
      {gameMode === "flashcards" && renderFlashcards()}
      {gameMode === "stats" && renderStats()}
    </div>
  )
}
