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
} from "lucide-react"
import { medicationData } from "@/data/medicationData"

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
}

interface Question {
  id: string
  type: "multiple-choice" | "flashcard" | "matching" | "fill-blank"
  medication: string
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
  difficulty: "easy" | "medium" | "hard"
  category: "antibiotics" | "other"
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

  // Load saved stats on component mount
  useEffect(() => {
    const savedStats = localStorage.getItem("medicationGameStats")
    if (savedStats) {
      setGameStats(JSON.parse(savedStats))
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

  // Generate questions based on medication data
  const generateQuestions = useCallback(
    (count = 10): Question[] => {
      const allMedications = [
        ...medicationData.antibiotics.map((med) => ({ ...med, category: "antibiotics" as const })),
        ...medicationData.other.map((med) => ({ ...med, category: "other" as const })),
      ]

      const filteredMeds =
        category === "all" ? allMedications : allMedications.filter((med) => med.category === category)

      const questions: Question[] = []

      for (let i = 0; i < count && i < filteredMeds.length; i++) {
        const med = filteredMeds[Math.floor(Math.random() * filteredMeds.length)]

        // Generate different types of questions
        const questionTypes = ["multiple-choice", "flashcard", "fill-blank"] as const
        const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)]

        let question: Question

        switch (questionType) {
          case "multiple-choice":
            question = generateMultipleChoiceQuestion(med, allMedications)
            break
          case "flashcard":
            question = generateFlashcardQuestion(med)
            break
          case "fill-blank":
            question = generateFillBlankQuestion(med)
            break
          default:
            question = generateMultipleChoiceQuestion(med, allMedications)
        }

        questions.push(question)
      }

      return questions
    },
    [category],
  )

  const generateMultipleChoiceQuestion = (med: any, allMeds: any[]): Question => {
    const questionTypes = [
      {
        question: `What is the dosing reference for ${med.name}?`,
        correctAnswer: med.reference,
        generateOptions: () => {
          const options = [med.reference]
          while (options.length < 4) {
            const randomMed = allMeds[Math.floor(Math.random() * allMeds.length)]
            if (!options.includes(randomMed.reference)) {
              options.push(randomMed.reference)
            }
          }
          return options.sort(() => Math.random() - 0.5)
        },
      },
      {
        question: `Which medication has the dosing: "${med.reference}"?`,
        correctAnswer: med.name,
        generateOptions: () => {
          const options = [med.name]
          while (options.length < 4) {
            const randomMed = allMeds[Math.floor(Math.random() * allMeds.length)]
            if (!options.includes(randomMed.name)) {
              options.push(randomMed.name)
            }
          }
          return options.sort(() => Math.random() - 0.5)
        },
      },
    ]

    const selectedType = questionTypes[Math.floor(Math.random() * questionTypes.length)]

    return {
      id: `mc-${Date.now()}-${Math.random()}`,
      type: "multiple-choice",
      medication: med.name,
      question: selectedType.question,
      options: selectedType.generateOptions(),
      correctAnswer: selectedType.correctAnswer,
      explanation: `${med.name}: ${med.reference}`,
      difficulty: difficulty,
      category: med.category,
    }
  }

  const generateFlashcardQuestion = (med: any): Question => {
    return {
      id: `fc-${Date.now()}-${Math.random()}`,
      type: "flashcard",
      medication: med.name,
      question: `What is the dosing reference for ${med.name}?`,
      correctAnswer: med.reference,
      explanation: `Remember: ${med.name} is dosed at ${med.reference}`,
      difficulty: difficulty,
      category: med.category,
    }
  }

  const generateFillBlankQuestion = (med: any): Question => {
    const reference = med.reference
    const words = reference.split(" ")
    const blankIndex = Math.floor(Math.random() * words.length)
    const blankWord = words[blankIndex]
    const questionText = words.map((word, index) => (index === blankIndex ? "______" : word)).join(" ")

    return {
      id: `fb-${Date.now()}-${Math.random()}`,
      type: "fill-blank",
      medication: med.name,
      question: `Fill in the blank for ${med.name}: ${questionText}`,
      correctAnswer: blankWord,
      explanation: `Complete reference: ${med.reference}`,
      difficulty: difficulty,
      category: med.category,
    }
  }

  // Achievement definitions
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

    // Update session stats
    setSessionStats((prev) => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }))

    // Update game stats
    setGameStats((prev) => {
      const newStats = {
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        streak: isCorrect ? prev.streak + 1 : 0,
        bestStreak: isCorrect ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak,
        experience: prev.experience + (isCorrect ? 5 : 1),
        lastPlayed: new Date().toISOString(),
      }

      newStats.level = calculateLevel(newStats.experience)
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

    setGameStats((prev) => {
      const newStats = {
        ...prev,
        totalPlayTime: prev.totalPlayTime + sessionTime,
        gamesPlayed: prev.gamesPlayed + 1,
        averageScore: (prev.averageScore * (prev.gamesPlayed - 1) + accuracy) / prev.gamesPlayed,
      }

      checkAchievements(newStats)
      return newStats
    })

    setGameMode("stats")
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
        </CardContent>
      </Card>

      {/* Game Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-500">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quiz Mode</h3>
              <p className="text-gray-600 mb-4">Timed multiple choice questions with instant feedback</p>

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

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-500">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-8 w-8 text-green-600" />
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
            <div className="text-2xl font-bold text-blue-600">{gameStats.correctAnswers}</div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{gameStats.gamesPlayed}</div>
            <div className="text-sm text-gray-600">Games Played</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{Math.round(gameStats.averageScore)}%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{gameStats.achievements.length}</div>
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
        <Card className="border-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="outline" className="mb-2">
                  {currentQuestion.category}
                </Badge>
                <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
              </div>
              <Badge
                variant={
                  currentQuestion.difficulty === "easy"
                    ? "secondary"
                    : currentQuestion.difficulty === "medium"
                      ? "default"
                      : "destructive"
                }
              >
                {currentQuestion.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {currentQuestion.type === "multiple-choice" && (
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
                    className="w-full text-left justify-start h-auto p-4"
                    onClick={() => !showAnswer && handleAnswer(option)}
                    disabled={showAnswer}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                      {showAnswer && option === currentQuestion.correctAnswer && (
                        <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                      )}
                      {showAnswer && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                        <XCircle className="h-5 w-5 text-red-500 ml-auto" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {currentQuestion.type === "flashcard" && (
              <div className="text-center space-y-4">
                {!showAnswer ? (
                  <Button onClick={() => setShowAnswer(true)} size="lg">
                    Show Answer
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-lg font-semibold">{currentQuestion.correctAnswer}</p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={() => handleAnswer(currentQuestion.correctAnswer)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />I knew it
                      </Button>
                      <Button onClick={() => handleAnswer("")} variant="outline">
                        <XCircle className="h-4 w-4 mr-2" />I didn't know
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentQuestion.type === "fill-blank" && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full p-3 border rounded-lg"
                  disabled={showAnswer}
                  onKeyPress={(e) => e.key === "Enter" && !showAnswer && handleAnswer(selectedAnswer)}
                />
                {!showAnswer && (
                  <Button onClick={() => handleAnswer(selectedAnswer)} className="w-full">
                    Submit Answer
                  </Button>
                )}
              </div>
            )}

            {showAnswer && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-semibold">Explanation:</span>
                </div>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {showAnswer && (
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              {selectedAnswer === currentQuestion.correctAnswer ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Correct! +5 XP
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-4 w-4 mr-1" />
                  Incorrect +1 XP
                </Badge>
              )}
            </div>
            <Button onClick={nextQuestion}>
              {questionIndex < questions.length - 1 ? "Next Question" : "Finish Game"}
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
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-500" />
                  {sessionStats.incorrect}
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Streak: {gameStats.streak}
                </span>
              </div>
              <div className="text-right">
                <div>
                  Accuracy:{" "}
                  {sessionStats.correct + sessionStats.incorrect > 0
                    ? Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100)
                    : 0}
                  %
                </div>
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
        <h2 className="text-2xl font-bold">Game Complete!</h2>
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{sessionStats.correct}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{sessionStats.incorrect}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round((Date.now() - sessionStats.startTime) / 1000)}s
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{gameStats.level}</div>
              <div className="text-sm text-gray-600">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{gameStats.experience}</div>
              <div className="text-sm text-gray-600">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{gameStats.correctAnswers}</div>
              <div className="text-sm text-gray-600">Total Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{gameStats.bestStreak}</div>
              <div className="text-sm text-gray-600">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{gameStats.gamesPlayed}</div>
              <div className="text-sm text-gray-600">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{Math.round(gameStats.averageScore)}%</div>
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const isUnlocked = gameStats.achievements.includes(achievement.id)
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 ${
                    isUnlocked ? "border-yellow-300 bg-yellow-50" : "border-gray-200 bg-gray-50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={isUnlocked ? "" : "grayscale"}>{achievement.icon}</div>
                    <div>
                      <div className="font-semibold">{achievement.name}</div>
                      <div className="text-sm text-gray-600">{achievement.description}</div>
                      <div className="text-xs text-blue-600">+{achievement.reward} XP</div>
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
        <Button onClick={() => startGame("quiz")} size="lg">
          <Play className="h-4 w-4 mr-2" />
          Play Quiz Again
        </Button>
        <Button onClick={() => startGame("flashcards")} variant="outline" size="lg">
          <BookOpen className="h-4 w-4 mr-2" />
          Study Flashcards
        </Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Celebration Animation */}
      {showCelebration && recentAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="p-6 text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold mb-2">Achievement Unlocked!</h3>
            <div className="flex items-center justify-center gap-2 mb-2">
              {recentAchievement.icon}
              <span className="font-semibold">{recentAchievement.name}</span>
            </div>
            <p className="text-gray-600 mb-4">{recentAchievement.description}</p>
            <Badge className="bg-yellow-500">+{recentAchievement.reward} XP</Badge>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            Medication Learning Game
            <Zap className="h-8 w-8 text-yellow-500" />
          </CardTitle>
        </CardHeader>
      </Card>

      {gameMode === "menu" && renderMenu()}
      {(gameMode === "quiz" || gameMode === "flashcards") && renderQuestion()}
      {gameMode === "stats" && renderStats()}
    </div>
  )
}
