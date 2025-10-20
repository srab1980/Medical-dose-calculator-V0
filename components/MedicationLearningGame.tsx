"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
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
  Info,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { medicationData } from "@/data/medicationData"

// Create a single AudioContext instance
let audioContext: AudioContext | null = null

const getAudioContext = () => {
  if (typeof window === "undefined") return null
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

const playSound = (type: "correct" | "incorrect" | "achievement" | "levelup" | "complete" | "flip" | "swipe") => {
  if (typeof window === "undefined") return

  const createTone = (frequency: number, duration: number, type: "sine" | "square" | "triangle" = "sine") => {
    try {
      const context = getAudioContext()
      if (!context) return

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

const getMedicationType = (medicationName: string, category: string): string => {
  const name = medicationName.toLowerCase()

  if (name.includes("nystatin") || name.includes("mycostatin")) {
    return "Antifungal"
  }

  if (
    name.includes("augmentin") ||
    name.includes("zinnat") ||
    name.includes("klacid") ||
    name.includes("clarithromycin") ||
    name.includes("zithromax") ||
    name.includes("azithromycin") ||
    name.includes("suprax") ||
    name.includes("cefixime") ||
    name.includes("amoxicillin") ||
    name.includes("metronidazole") ||
    name.includes("septrin") ||
    name.includes("cefuroxime") ||
    name.includes("nitrofurantoin") ||
    name.includes("trimethoprim") ||
    name.includes("sulfamethoxazole") ||
    category === "antibiotics"
  ) {
    return "Antibiotic"
  }

  if (
    name.includes("panadol") ||
    name.includes("adol") ||
    name.includes("acetaminophen") ||
    name.includes("paracetamol") ||
    name.includes("brufen") ||
    name.includes("ibuprofen")
  ) {
    return "Analgesic"
  }

  if (
    name.includes("aerius") ||
    name.includes("zyrtec") ||
    name.includes("desloratadine") ||
    name.includes("cetirizine")
  ) {
    return "Antihistamine"
  }

  if (
    name.includes("depakine") ||
    name.includes("tegretol") ||
    name.includes("trileptal") ||
    name.includes("valproic") ||
    name.includes("carbamazepine") ||
    name.includes("oxcarbazepine")
  ) {
    return "Anticonvulsant"
  }

  if (name.includes("zovirax") || name.includes("acyclovir")) {
    return "Antiviral"
  }

  return category === "antibiotics" ? "Antibiotic" : "Other Medication"
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
  const [mounted, setMounted] = useState(false)
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

  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false)
  const lastAnswerTime = useRef(0)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const savedStats = localStorage.getItem("medicationGameStats")
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats)
        setGameStats({
          ...parsed,
          questionsAsked: parsed.questionsAsked || [],
          sessionQuestionsAsked: [],
          flashcardProgress: parsed.flashcardProgress || {},
        })
      } catch (error) {
        console.error("Failed to parse saved stats:", error)
      }
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return

    try {
      localStorage.setItem("medicationGameStats", JSON.stringify(gameStats))
    } catch (error) {
      console.error("Failed to save stats:", error)
    }
  }, [gameStats, mounted])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0 && isTimerActive) {
      handleTimeUp()
    }
    return () => clearInterval(interval)
  }, [isTimerActive, timeLeft])

  useEffect(() => {
    if (autoAdvance && isCardFlipped && gameMode === "flashcards" && !showAnswer) {
      const timer = setTimeout(() => {
        setIsCardFlipped(false)
      }, autoAdvanceDelay)
      return () => clearTimeout(timer)
    }
  }, [autoAdvance, isCardFlipped, gameMode, showAnswer, autoAdvanceDelay])

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

        let questionType =
          gameMode === "flashcards"
            ? "flashcard"
            : availableTypes.filter((t) => t !== "flashcard")[
                Math.floor(Math.random() * availableTypes.filter((t) => t !== "flashcard").length)
              ] || "multiple-choice"

        if (questionType === "dosage-calc" && !med.reference.match(/mg\/kg/)) {
          questionType = "multiple-choice"
        }

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
        question: `What is the medication type for ${med.name}?`,
        correctAnswer: getMedicationType(med.name, med.category),
        category: "form",
        generateOptions: () => {
          const correctType = getMedicationType(med.name, med.category)
          const options = [correctType]
          const otherOptions = [
            "Antibiotic",
            "Analgesic",
            "Antihistamine",
            "Anticonvulsant",
            "Antiviral",
            "Antifungal",
            "Other Medication",
          ]
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
        answer: getMedicationType(med.name, med.category),
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

    let dose = 10
    let dosePattern = null

    dosePattern = med.reference.match(/(\d+(?:\.\d+)?)\s*mg\/kg\/day/)
    if (dosePattern) {
      dose = Number.parseFloat(dosePattern[1])
    } else {
      dosePattern = med.reference.match(/(\d+(?:\.\d+)?)\s*mg\/kg/)
      if (dosePattern) {
        dose = Number.parseFloat(dosePattern[1])
      }
    }

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

  const checkAchievements = (
    stats: GameStats,
  ): {
    stats: GameStats
    newAchievement: Achievement | null
  } => {
    let updatedStats = { ...stats }
    let foundAchievement: Achievement | null = null

    for (const achievement of achievements) {
      if (!updatedStats.achievements.includes(achievement.id) && achievement.condition(updatedStats)) {
        updatedStats = {
          ...updatedStats,
          achievements: [...updatedStats.achievements, achievement.id],
          experience: updatedStats.experience + achievement.reward,
        }
        foundAchievement = achievement
        break
      }
    }

    return { stats: updatedStats, newAchievement: foundAchievement }
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
    setIsProcessingAnswer(false)
    lastAnswerTime.current = 0

    setGameStats((prev) => ({
      ...prev,
      sessionQuestionsAsked: [],
    }))

    if (mode === "quiz") {
      setTimeLeft(30)
      setIsTimerActive(true)
    }
  }

  const handleAnswer = useCallback(
    (answer: boolean) => {
      if (!currentQuestion) return

      const now = Date.now()
      if (isProcessingAnswer || now - lastAnswerTime.current < 500) {
        return
      }

      lastAnswerTime.current = now
      setIsProcessingAnswer(true)

      const answerValue = Boolean(answer)

      if (soundEnabled) {
        playSound(answerValue ? "correct" : "incorrect")
      }

      setSessionStats((prev) => ({
        ...prev,
        correct: prev.correct + (answerValue ? 1 : 0),
        incorrect: prev.incorrect + (answerValue ? 0 : 1),
      }))

      setGameStats((prev) => {
        const oldLevel = prev.level

        const currentProgress = prev.flashcardProgress[currentQuestion.medication] || {
          correct: 0,
          incorrect: 0,
          lastReviewed: new Date().toISOString(),
          bookmarked: false,
        }

        const updatedFlashcardProgress = {
          ...prev.flashcardProgress,
          [currentQuestion.medication]: {
            ...currentProgress,
            correct: currentProgress.correct + (answerValue ? 1 : 0),
            incorrect: currentProgress.incorrect + (answerValue ? 0 : 1),
            lastReviewed: new Date().toISOString(),
          },
        }

        const baseStats = {
          ...prev,
          flashcardProgress: updatedFlashcardProgress,
          totalQuestions: prev.totalQuestions + 1,
          correctAnswers: prev.correctAnswers + (answerValue ? 1 : 0),
          streak: answerValue ? prev.streak + 1 : 0,
          bestStreak: answerValue ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak,
          experience: prev.experience + (answerValue ? 5 : 1),
          lastPlayed: new Date().toISOString(),
          questionsAsked: [...new Set([...prev.questionsAsked, currentQuestion.id])],
          sessionQuestionsAsked: [...prev.sessionQuestionsAsked, currentQuestion.id],
        }

        const { stats: finalStats, newAchievement } = checkAchievements(baseStats)

        finalStats.level = calculateLevel(finalStats.experience)

        if (soundEnabled && finalStats.level > oldLevel) {
          setTimeout(() => playSound("levelup"), 500)
        }

        if (newAchievement) {
          setTimeout(() => {
            setRecentAchievement(newAchievement)
            setShowCelebration(true)
            setTimeout(() => setShowCelebration(false), 3000)
          }, 0)
        }

        return finalStats
      })

      setCardAnimation(answerValue ? "slide-right" : "slide-left")

      setTimeout(() => {
        const nextIdx = questionIndex + 1
        if (nextIdx < questions.length) {
          setQuestionIndex(nextIdx)
          setCurrentQuestion(questions[nextIdx])
          setIsCardFlipped(false)
          setShowAnswer(false)
          setCardAnimation("slide-in")
          setTimeout(() => {
            setCardAnimation("none")
            setIsProcessingAnswer(false)
          }, 300)
        } else {
          setIsProcessingAnswer(false)
          endGame()
        }
      }, 300)
    },
    [currentQuestion, isProcessingAnswer, soundEnabled, questionIndex, questions],
  )

  useEffect(() => {
    if (!mounted) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameMode === "flashcards" && currentQuestion && !isProcessingAnswer) {
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
  }, [mounted, gameMode, currentQuestion, isCardFlipped, soundEnabled, isProcessingAnswer, handleAnswer])

  const handleTimeUp = () => {
    if (!showAnswer) {
      handleAnswer(false)
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

      const { stats: updatedStats, newAchievement } = checkAchievements(newStats)

      if (newAchievement) {
        setTimeout(() => {
          setRecentAchievement(newAchievement)
          setShowCelebration(true)
          setTimeout(() => setShowCelebration(false), 3000)
        }, 0)
      }

      if (soundEnabled && updatedStats.level > oldLevel) {
        setTimeout(() => playSound("levelup"), 500)
      }

      return updatedStats
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
    setIsProcessingAnswer(false)
    lastAnswerTime.current = 0
  }

  const clearQuestionHistory = () => {
    setGameStats((prev) => ({
      ...prev,
      questionsAsked: [],
      sessionQuestionsAsked: [],
    }))
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              Medication Learning Game
              <Zap className="h-8 w-8 text-yellow-500" />
            </CardTitle>
          </CardHeader>
        </Card>
        <div className="text-center py-12">Loading...</div>
      </div>
    )
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
              <p className="text-gray-600 mb-4">Timed questions with variety and rotation</p>

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
      <div className="max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-2 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2">
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
          <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 animate-fade-in">
            <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
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

              <div className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t">
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
            className="relative w-full h-[400px] sm:h-96 cursor-pointer"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("button")) {
                return
              }
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
                <CardContent className="h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-blue-50 to-blue-100 relative">
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
                  <div
                    className={`mb-4 ${getMedicationColor(currentQuestion.medication, currentQuestion.category, undefined)}`}
                  >
                    {getMedicationIcon(
                      currentQuestion.medication,
                      currentQuestion.category,
                      currentQuestion.questionCategory,
                    )}
                  </div>
                  <h2 className="text-xl sm:text-3xl font-bold text-blue-900 mb-4 text-center">
                    {currentQuestion.medication}
                  </h2>
                  <p className="text-base sm:text-xl text-gray-700 text-center mb-8">{currentQuestion.question}</p>

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
                <CardContent className="h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-green-50 to-green-100">
                  <div className="text-6xl sm:text-8xl mb-6">✅</div>
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

        {isCardFlipped && !isProcessingAnswer && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 animate-fade-in">
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                handleAnswer(false)
              }}
              variant="outline"
              size="lg"
              className="flex items-center justify-center gap-2 px-6 py-6 sm:px-8 sm:py-6 border-2 border-red-400 hover:bg-red-50 min-h-[60px]"
            >
              <ArrowLeft className="h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">Need to Study</div>
                <div className="text-xs text-gray-500">Left Arrow</div>
              </div>
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                handleAnswer(true)
              }}
              size="lg"
              className="flex items-center justify-center gap-2 px-6 py-6 sm:px-8 sm:py-6 bg-green-600 hover:bg-green-700 min-h-[60px]"
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
            {questionIndex < questions.length - 1 ? "Next" : "Finish"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-1">
                  {sessionStats.correct}
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Known</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600 flex items-center justify-center gap-1">
                  {sessionStats.incorrect}
                  <XCircle className="h-6 w-6" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">To Study</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 flex items-center justify-center gap-1">
                  {gameStats.streak}
                  <Flame className="h-6 w-6" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null

    const handleAnswerSelect = (answer: string) => {
      if (showAnswer || isProcessingAnswer) return
      setSelectedAnswer(answer)
    }

    const submitAnswer = () => {
      if (!selectedAnswer || showAnswer || isProcessingAnswer) return

      const isCorrect = selectedAnswer === currentQuestion.correctAnswer
      setShowAnswer(true)
      setIsProcessingAnswer(true)

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

        const updatedFlashcardProgress = {
          ...prev.flashcardProgress,
          [currentQuestion.medication]: {
            ...(prev.flashcardProgress[currentQuestion.medication] || {
              correct: 0,
              incorrect: 0,
              lastReviewed: new Date().toISOString(),
              bookmarked: false,
            }),
            correct: (prev.flashcardProgress[currentQuestion.medication]?.correct || 0) + (isCorrect ? 1 : 0),
            incorrect: (prev.flashcardProgress[currentQuestion.medication]?.incorrect || 0) + (isCorrect ? 0 : 1),
            lastReviewed: new Date().toISOString(),
          },
        }

        const baseStats = {
          ...prev,
          flashcardProgress: updatedFlashcardProgress,
          totalQuestions: prev.totalQuestions + 1,
          correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
          streak: isCorrect ? prev.streak + 1 : 0,
          bestStreak: isCorrect ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak,
          experience: prev.experience + (isCorrect ? 5 : 1),
          lastPlayed: new Date().toISOString(),
          questionsAsked: [...new Set([...prev.questionsAsked, currentQuestion.id])],
          sessionQuestionsAsked: [...prev.sessionQuestionsAsked, currentQuestion.id],
        }

        const { stats: finalStats, newAchievement } = checkAchievements(baseStats)
        finalStats.level = calculateLevel(finalStats.experience)

        if (soundEnabled && finalStats.level > oldLevel) {
          setTimeout(() => playSound("levelup"), 500)
        }

        if (newAchievement) {
          setTimeout(() => {
            setRecentAchievement(newAchievement)
            setShowCelebration(true)
            setTimeout(() => setShowCelebration(false), 3000)
          }, 0)
        }

        return finalStats
      })

      setTimeout(() => {
        setIsProcessingAnswer(false)
      }, 1500)
    }

    return (
      <div className="max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-2 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={resetGame} size="sm">
              <Home className="h-4 w-4 mr-2" />
              Menu
            </Button>
            <Badge variant="outline" className="flex items-center gap-1">
              Question {questionIndex + 1} of {questions.length}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              {difficulty === "easy" && "🟢"}
              {difficulty === "medium" && "🟡"}
              {difficulty === "hard" && "🔴"}
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-orange-500" />
              <span
                className={`font-bold text-lg ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-gray-700 dark:text-gray-300"}`}
              >
                {timeLeft}s
              </span>
            </div>
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

        <Progress value={((questionIndex + 1) / questions.length) * 100} className="h-2" />

        <Card className="border-2 sm:border-4 border-blue-300 shadow-2xl">
          <CardContent className="p-4 sm:p-8">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-start gap-3 sm:gap-4">
                <div
                  className={`text-4xl sm:text-6xl ${getMedicationColor(currentQuestion.medication, currentQuestion.category)}`}
                >
                  {getMedicationIcon(
                    currentQuestion.medication,
                    currentQuestion.category,
                    currentQuestion.questionCategory,
                  )}
                </div>
                <div className="flex-1 w-full">
                  <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                    {getMedicationType(currentQuestion.medication, currentQuestion.category)}
                  </h3>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {currentQuestion.question}
                  </h2>

                  {currentQuestion.type === "fill-blank" ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-300 shadow-md">
                        <label className="block text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          Type your answer below:
                        </label>
                        <Input
                          type="text"
                          value={selectedAnswer}
                          onChange={(e) => setSelectedAnswer(e.target.value)}
                          placeholder="Type your answer here..."
                          disabled={showAnswer}
                          className="text-lg p-4 border-2 border-blue-400 focus:border-blue-600 bg-white dark:bg-gray-800 shadow-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !showAnswer && selectedAnswer) {
                              submitAnswer()
                            }
                          }}
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          Press Enter or click Submit when ready
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {currentQuestion.options?.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={showAnswer}
                          className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all min-h-[52px] ${
                            selectedAnswer === option
                              ? showAnswer
                                ? option === currentQuestion.correctAnswer
                                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                  : "border-red-500 bg-red-50 dark:bg-red-900/20"
                                : "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : showAnswer && option === currentQuestion.correctAnswer
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          } ${showAnswer ? "cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm sm:text-base">{option}</span>
                            {showAnswer && option === currentQuestion.correctAnswer && (
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            )}
                            {showAnswer && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {showAnswer && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 animate-fade-in">
                      <h4 className="font-semibold text-sm sm:text-base text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Explanation:
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">{currentQuestion.explanation}</p>
                    </div>
                  )}
                </div>
              </div>

              {!showAnswer && (
                <Button
                  onClick={submitAnswer}
                  disabled={!selectedAnswer || showAnswer}
                  size="lg"
                  className="w-full py-4 sm:py-3 text-base sm:text-lg"
                >
                  Submit Answer
                </Button>
              )}

              {showAnswer && (
                <Button onClick={nextQuestion} size="lg" className="w-full">
                  {questionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-1">
                  {sessionStats.correct}
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600 flex items-center justify-center gap-1">
                  {sessionStats.incorrect}
                  <XCircle className="h-6 w-6" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Incorrect</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 flex items-center justify-center gap-1">
                  {gameStats.streak}
                  <Flame className="h-6 w-6" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {showCelebration && recentAchievement && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-2xl border-4 border-yellow-400 animate-scale-in pointer-events-auto max-w-sm">
              <div className="text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Achievement Unlocked!</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {recentAchievement.icon}
                  <span className="font-semibold">{recentAchievement.name}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{recentAchievement.description}</p>
                <Badge variant="secondary">+{recentAchievement.reward} XP</Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderStats = () => {
    if (!finalAchievementData) return null

    const {
      score,
      timeBonus,
      streakBonus,
      totalXP,
      newLevel,
      perfectGame,
      newRecord,
      motivationalMessage,
      performanceRating,
      badges,
    } = finalAchievementData

    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">{perfectGame ? "🏆" : score >= 80 ? "🌟" : score >= 60 ? "👏" : "💪"}</div>
            <h2 className="text-4xl font-bold mb-2">Quiz Complete!</h2>
            <p className="text-xl opacity-90">{motivationalMessage}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Performance
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Score</span>
                    <span className="text-2xl font-bold text-blue-600">{score}%</span>
                  </div>
                  <Progress value={score} className="h-3" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Correct</div>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Incorrect</div>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{performanceRating}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Performance Rating</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Experience Gained
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-sm">Base Score</span>
                  <span className="font-bold text-blue-600">+{score} XP</span>
                </div>
                {timeBonus > 0 && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      Time Bonus
                    </span>
                    <span className="font-bold text-green-600">+{timeBonus} XP</span>
                  </div>
                )}
                {streakBonus > 0 && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm flex items-center gap-1">
                      <Flame className="h-4 w-4" />
                      Streak Bonus
                    </span>
                    <span className="font-bold text-orange-600">+{streakBonus} XP</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total XP Gained</span>
                    <span className="text-2xl font-bold text-purple-600">+{totalXP} XP</span>
                  </div>
                </div>
                {newLevel && (
                  <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-center animate-bounce">
                    <Crown className="h-6 w-6 mx-auto mb-1" />
                    <div className="font-bold">Level Up!</div>
                    <div className="text-sm">Now Level {gameStats.level}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {badges.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Medal className="h-5 w-5 text-yellow-500" />
                Badges Earned
              </h3>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-4 py-2">
                    {badge}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => startGame("quiz")} size="lg" className="flex-1">
            <Play className="h-4 w-4 mr-2" />
            Play Again
          </Button>
          <Button onClick={resetGame} variant="outline" size="lg" className="flex-1 bg-transparent">
            <Home className="h-4 w-4 mr-2" />
            Main Menu
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span>Medication Learning Game</span>
            <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
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
