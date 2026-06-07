import React, { useEffect, useMemo, useState } from 'react'
import {
  AnalyticsOutlined,
  DeleteOutline,
  FactCheckOutlined,
  FileUploadOutlined,
  PsychologyAltOutlined,
  SecurityOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'
import TeacherAnalytics from '../analytics/TeacherAnalytics'
import { buildTeacherAnalytics } from '../../lib/quizAnalytics'
import AIWorkflowPanel from '../ai/AIWorkflowPanel'
import FlashcardDeck from '../ai/FlashcardDeck'
import { generateQuiz as buildAiQuiz } from '../../ai/generateQuiz'
import { generateFlashcards } from '../../ai/generateFlashcards'
import { generateRecommendations } from '../../ai/generateRecommendations'

const questionTypes = [
  'Multiple Choice',
  'Identification',
  'True or False',
  'Matching Type',
  'Essay',
  'Coding Questions',
]

const bloomLevels = ['Recall', 'Application', 'Analysis']

const acceptedFormats = ['PDF', 'DOCX', 'PPTX', 'TXT', 'Images (OCR)']

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

function normalizeQuestionType(type, fallback = 'Multiple Choice') {
  const normalized = normalizeText(type)
  const typeMap = {
    'multiple choice': 'Multiple Choice',
    'multiple-choice': 'Multiple Choice',
    mcq: 'Multiple Choice',
    'true or false': 'True or False',
    'true-false': 'True or False',
    'true false': 'True or False',
    identification: 'Identification',
    'fill in the blank': 'Identification',
    'fill-in-the-blank': 'Identification',
    hots: 'Essay',
    essay: 'Essay',
    'coding': 'Coding Questions',
    'coding questions': 'Coding Questions',
    'coding-question': 'Coding Questions',
    'matching type': 'Matching Type',
    'matching-type': 'Matching Type',
  }

  return typeMap[normalized] || fallback
}

function normalizeDifficulty(difficulty) {
  const normalized = normalizeText(difficulty)
  if (['easy', 'medium', 'hard'].includes(normalized)) {
    return normalized.charAt(0).toUpperCase() + normalized.slice(1)
  }
  return 'Medium'
}

function getChoiceText(choice) {
  if (typeof choice === 'string') return choice
  if (!choice || typeof choice !== 'object') return ''
  return choice.text || choice.label || choice.value || choice.choice || ''
}

function getChoiceFeedback(choice) {
  if (!choice || typeof choice !== 'object') return ''
  return choice.feedback || choice.explanation || ''
}

function isTruthyFlag(value) {
  return value === true || value === 1 || value === '1' || value === 'true' || value === 'yes'
}

function createOption(text = '', correct = false, feedback = '') {
  return { text, correct, feedback }
}

function buildFallbackOptions(type) {
  if (type === 'True or False') {
    return [
      createOption('True', true, 'Correct. This is the best answer.'),
      createOption('False', false, 'This answer is not correct. Review the lesson concept and try again.'),
    ]
  }

  return [
    createOption('', true, 'Correct. This matches the key concept.'),
    createOption('', false, 'This answer is not correct. Review the lesson concept and try again.'),
    createOption('', false, 'This answer is not correct. Review the lesson concept and try again.'),
    createOption('', false, 'This answer is not correct. Review the lesson concept and try again.'),
  ]
}

function normalizeQuestionMatches(matches) {
  if (!Array.isArray(matches) || !matches.length) {
    return [
      { left: '', right: '' },
      { left: '', right: '' },
    ]
  }

  return matches.map((pair) => ({
    left: pair?.left || '',
    right: pair?.right || '',
  }))
}

function normalizeQuestionOptions(question, type) {
  const sourceOptions = Array.isArray(question?.options) && question.options.length
    ? question.options
    : Array.isArray(question?.choices) && question.choices.length
      ? question.choices
      : []

  if (type === 'Matching Type' || type === 'Essay' || type === 'Identification' || type === 'Coding Questions') {
    return []
  }

  const correctAnswerText = normalizeText(question?.correctAnswer || question?.answer || '')

  const options = sourceOptions
    .map((option, index) => {
      const text = getChoiceText(option)
      const optionCorrect = typeof option === 'object' && option !== null
        ? isTruthyFlag(option.correct)
        : Boolean(correctAnswerText) && normalizeText(text) === correctAnswerText
      const feedback = getChoiceFeedback(option) || (optionCorrect
        ? 'Correct. This matches the key concept.'
        : 'This answer is not correct. Review the lesson concept and try again.')

      return createOption(text, optionCorrect, feedback)
    })
    .filter((option) => option.text || option.correct || option.feedback)

  const fallback = buildFallbackOptions(type)
  const normalizedOptions = options.length ? options : fallback

  if (!normalizedOptions.some((option) => option.correct)) {
    normalizedOptions[0] = { ...normalizedOptions[0], correct: true, feedback: normalizedOptions[0].feedback || 'Correct. This matches the key concept.' }
  }

  if (type === 'True or False') {
    return normalizedOptions.slice(0, 2).map((option, index) => ({
      ...option,
      text: option.text || (index === 0 ? 'True' : 'False'),
      feedback: option.feedback || (index === 0
        ? 'Correct. This matches the key concept.'
        : 'This answer is not correct. Review the lesson concept and try again.'),
    }))
  }

  return normalizedOptions.map((option) => ({
    ...option,
    feedback: option.feedback || (option.correct
      ? 'Correct. This matches the key concept.'
      : 'This answer is not correct. Review the lesson concept and try again.'),
  }))
}

function normalizeQuizMakerQuestion(question = {}, index = 0) {
  const type = normalizeQuestionType(question.type)
  const prompt = question.prompt || question.text || question.question || ''
  const options = normalizeQuestionOptions(question, type)
  const correctOption = options.find((option) => option.correct)
  const correctText = correctOption?.text || question.correctAnswer || question.answer || ''
  const answer = question.answer || correctText
  const explanation = question.explanation || question.rubric || ''
  const rubric = question.rubric || question.explanation || ''
  const conceptTags = Array.isArray(question.conceptTags)
    ? question.conceptTags.filter(Boolean)
    : question.conceptTags
      ? [question.conceptTags].filter(Boolean)
      : []

  return {
    id: question.id || `quiz-question-${index + 1}`,
    type,
    bloom: question.bloom || 'Recall',
    difficulty: normalizeDifficulty(question.difficulty),
    prompt,
    text: question.text || prompt,
    question: question.question || prompt,
    alt_text: question.alt_text || '',
    options,
    choices: options.map((option) => option.text).filter(Boolean),
    answer,
    correctAnswer: question.correctAnswer || correctText,
    explanation,
    trivia: question.trivia || '',
    learningTip: question.learningTip || question.hint || '',
    hint: question.hint || '',
    rubric,
    conceptTags,
    codeLanguage: question.codeLanguage || 'javascript',
    testCases: question.testCases || '',
    matches: normalizeQuestionMatches(question.matches),
  }
}

function normalizeQuizMakerQuestions(questions) {
  return Array.isArray(questions) ? questions.map((question, index) => normalizeQuizMakerQuestion(question, index)) : []
}

function normalizeQuizMakerDraft(draft) {
  const current = draft && typeof draft === 'object' ? draft : {}
  const questions = normalizeQuizMakerQuestions(current.questions)

  return {
    ...defaultDraft,
    ...current,
    timer: Number(current.timer) || defaultDraft.timer,
    attempts: Number(current.attempts) || defaultDraft.attempts,
    count: Number(current.count) || defaultDraft.count,
    questions: questions.length ? questions : [normalizeQuizMakerQuestion(emptyQuestion())],
  }
}

function getCorrectOptionIndex(question) {
  if (!Array.isArray(question?.options) || !question.options.length) return -1
  const correctIndex = question.options.findIndex((option) => option.correct)
  if (correctIndex >= 0) return correctIndex

  const target = normalizeText(question.correctAnswer || question.answer || '')
  if (!target) return -1
  return question.options.findIndex((option) => normalizeText(option.text) === target)
}

function emptyQuestion(type = 'Multiple Choice') {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    type,
    bloom: 'Recall',
    difficulty: 'Medium',
    prompt: '',
    alt_text: '',
    options: [
      { text: '', correct: true, feedback: 'Correct. This matches the key concept.' },
      { text: '', correct: false, feedback: 'This choice reflects a common misconception. Review the related lesson section.' },
      { text: '', correct: false, feedback: 'This is close, but it misses an important condition in the question.' },
      { text: '', correct: false, feedback: 'This option does not follow from the concept being assessed.' },
    ],
    answer: '',
    explanation: '',
    hint: '',
    rubric: '',
    codeLanguage: 'javascript',
    testCases: '',
    matches: [
      { left: '', right: '' },
      { left: '', right: '' },
    ],
  }
}

const defaultDraft = {
  title: 'Adaptive Assessment Draft',
  description: '',
  topic: '',
  count: 5,
  timer: 30,
  attempts: 2,
  randomizeQuestions: true,
  randomizeOptions: true,
  questionBank: 'General',
  adaptiveFeedback: true,
  hintsOnly: true,
  followUps: true,
  studyRecommendations: true,
  confidenceScoring: true,
  browserLockdown: false,
  tabSwitchDetection: true,
  plagiarismDetection: true,
  speechSupport: true,
  largeTypography: true,
  colorblindSafe: true,
  questions: [emptyQuestion()],
}

function Panel({ children, className = '' }) {
  return <section className={`rounded-[24px] border border-token bg-surface p-5 shadow-card ${className}`}>{children}</section>
}

function Pill({ children, tone = 'green' }) {
  const styles = {
    green: 'border-token landing-accent-green text-main',
    dark: 'border-token bg-surface text-main',
    light: 'border-token bg-surface text-main',
  }
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${styles[tone]}`}>{children}</span>
}

function scanText(text) {
  const normalized = text.toLowerCase()
  const words = normalized.match(/[a-z][a-z-]{3,}/g) || []
  const counts = words.reduce((acc, word) => {
    if (['that', 'this', 'with', 'from', 'have', 'will', 'your', 'about', 'into', 'their', 'there'].includes(word)) return acc
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {})
  const concepts = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word)

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const duplicateLines = lines.length - new Set(lines).size
  const unsupportedFlags = ['answer key only', 'unsupported content', 'inappropriate'].filter((term) => normalized.includes(term))

  return {
    wordCount: words.length,
    concepts,
    definitions: lines.filter((line) => /\bis\b|\bare\b|means|defined as/i.test(line)).slice(0, 4),
    formulas: lines.filter((line) => /[=+\-*/^]|formula|equation/i.test(line)).slice(0, 4),
    duplicateLines,
    unsupportedFlags,
  }
}

function generatedQuestionsFromTopic(topic, count, scanSummary) {
  const sourceConcepts = scanSummary?.concepts?.length ? scanSummary.concepts : topic.split(/\s+/).filter(Boolean)
  const concepts = sourceConcepts.length ? sourceConcepts : ['core concept', 'definition', 'process']

  return Array.from({ length: Number(count) || 5 }).map((_, index) => {
    const concept = concepts[index % concepts.length]
    const bloom = bloomLevels[index % bloomLevels.length]
    const q = emptyQuestion(index % 5 === 1 ? 'Identification' : index % 5 === 2 ? 'True or False' : index % 5 === 3 ? 'Essay' : 'Multiple Choice')
    q.bloom = bloom
    q.difficulty = index % 3 === 0 ? 'Easy' : index % 3 === 1 ? 'Medium' : 'Hard'
    q.prompt =
      bloom === 'Recall'
        ? `Which statement best defines ${concept}?`
        : bloom === 'Application'
          ? `A student needs to use ${concept} in a new learning task. What should they do first?`
          : `Which explanation best shows how ${concept} affects the overall topic?`
    q.alt_text = `Question about ${concept} at the ${bloom} level.`
    q.answer = `A clear answer about ${concept}.`
    q.explanation = `The correct response should connect ${concept} to the main idea and avoid surface-level guessing.`
    q.hint = `Review the material section where ${concept} is introduced, then identify the rule or condition being used.`
    q.options = [
      { text: `${concept} is the central idea used to solve the task.`, correct: true, feedback: `Correct. This connects ${concept} to the learning goal.` },
      { text: `${concept} is only a minor detail and can be ignored.`, correct: false, feedback: `This is a misconception. ${concept} is being assessed because it affects the answer. Revisit the key concept summary.` },
      { text: `${concept} always works the same way in every situation.`, correct: false, feedback: `This overgeneralizes the idea. Check when the rule applies and when it changes.` },
      { text: `${concept} is unrelated to the topic.`, correct: false, feedback: `This misses the relationship between the concept and the topic. Review the source material connections.` },
    ]
    return q
  })
}

export default function QuizMaker() {
  const [draft, setDraft] = useState(() => {
    try {
      return normalizeQuizMakerDraft(JSON.parse(localStorage.getItem('academee_quiz_maker_draft') || 'null'))
    } catch (_e) {
      return normalizeQuizMakerDraft(defaultDraft)
    }
  })
  const [activeTab, setActiveTab] = useState('builder')
  const [scanSummary, setScanSummary] = useState(null)
  const [scanStatus, setScanStatus] = useState('No files scanned yet.')

  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem('academee_quiz_maker_draft', JSON.stringify(draft))
    }, 350)
    return () => clearTimeout(id)
  }, [draft])

  const update = (patch) => setDraft((current) => ({ ...current, ...patch }))

  const updateQuestion = (id, patch) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, index) => {
        if (question.id !== id) return normalizeQuizMakerQuestion(question, index)
        return normalizeQuizMakerQuestion({ ...question, ...patch, id }, index)
      }),
    }))
  }

  const addQuestion = (type = 'Multiple Choice') => {
    setDraft((current) => ({
      ...current,
      questions: [...current.questions, normalizeQuizMakerQuestion(emptyQuestion(type), current.questions.length)],
    }))
  }

  const removeQuestion = (id) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.length > 1
        ? current.questions.filter((question) => question.id !== id)
        : current.questions,
    }))
  }

  const handleFiles = async (files) => {
    const list = Array.from(files || [])
    if (!list.length) return

    const textParts = []
    for (const file of list) {
      if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
        textParts.push(await file.text())
      } else {
        textParts.push(`${file.name}\nFormat detected. Full extraction requires the backend OCR/document parser.`)
      }
    }

    const summary = scanText(textParts.join('\n'))
    setScanSummary({ ...summary, files: list.map((file) => file.name) })
    setScanStatus(`${list.length} file(s) scanned. ${summary.concepts.length} key concepts detected.`)
  }

  const generateQuiz = () => {
    const source = {
      title: draft.title,
      description: draft.description || draft.topic,
      notes: draft.topic,
      content: scanSummary ? [scanSummary.concepts.join(' '), scanSummary.definitions.join('\n'), scanSummary.formulas.join('\n')].filter(Boolean).join('\n') : draft.topic,
      files: scanSummary?.files?.map((name) => ({ name })) || [],
    }
    const questions = normalizeQuizMakerQuestions(buildAiQuiz({ source, count: draft.count }))
    update({
      questions,
      description: draft.description || 'AI-generated adaptive quiz draft. Review before publishing.',
    })
    setActiveTab('preview')
  }

  const quizQuestions = useMemo(() => normalizeQuizMakerQuestions(draft.questions), [draft.questions])

  const analytics = useMemo(() => {
    const counts = quizQuestions.reduce((acc, question) => {
      acc[question.type] = (acc[question.type] || 0) + 1
      return acc
    }, {})
    return {
      total: quizQuestions.length,
      adaptiveItems: quizQuestions.filter((question) => question.options?.some((option) => option.feedback)).length,
      highDifficulty: quizQuestions.filter((question) => question.difficulty === 'Hard').length,
      typeSummary: Object.entries(counts).map(([type, count]) => `${type}: ${count}`).join(', '),
    }
  }, [quizQuestions])

  const teacherAnalytics = useMemo(() => {
    const normalizedQuestions = quizQuestions.map((question, index) => ({
      id: question.id || `draft-${index + 1}`,
      text: question.prompt || question.text || question.question || `Question ${index + 1}`,
      options: Array.isArray(question.options)
        ? question.options.map((option) => (typeof option === 'string' ? option : option.text || ''))
        : [],
      correct: Math.max(0, getCorrectOptionIndex(question)),
      conceptTags: (Array.isArray(question.conceptTags) && question.conceptTags.length
        ? question.conceptTags
        : [question.topic, question.bloom, question.difficulty].filter(Boolean)),
      difficulty: question.difficulty,
    }))

    return buildTeacherAnalytics(normalizedQuestions, [])
  }, [quizQuestions])

  const flashcards = useMemo(() => {
    const source = {
      title: draft.title,
      description: draft.description || draft.topic,
      notes: draft.topic,
      content: scanSummary
        ? [scanSummary.concepts.join(' '), scanSummary.definitions.join('\n')].filter(Boolean).join('\n')
        : draft.topic,
      files: scanSummary?.files?.map((name) => ({ name })) || [],
    }
    return generateFlashcards({ source, count: Math.max(6, Number(draft.count) || 6) })
  }, [draft.title, draft.description, draft.topic, draft.count, scanSummary])

  const aiRecommendations = useMemo(() => {
    return generateRecommendations({
      weakConcepts: teacherAnalytics.weakConcepts || teacherAnalytics.weaknesses || [],
      materials: [
        ...(scanSummary?.files || []).map((name) => ({ title: name })),
        { title: draft.title, name: draft.title },
      ],
      analytics: { averageScore: teacherAnalytics.averageScore || 0 },
    })
  }, [teacherAnalytics, scanSummary, draft.title])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel className="landing-accent-green">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Pill tone="dark">AI Quiz Maker</Pill>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-main">Build adaptive assessments faster</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-muted">
                Create quizzes manually, scan learning files, generate AI-assisted items, preview the student experience, and prepare adaptive quizzes for publishing.
              </p>
            </div>
            <button type="button" onClick={generateQuiz} className="rounded-2xl primary-btn px-5 py-3 text-sm font-black">
              Generate with AI
            </button>
          </div>
        </Panel>

        <Panel>
          <div className="grid grid-cols-2 gap-3">
            <Metric icon={<FactCheckOutlined />} label="Questions" value={analytics.total} />
            <Metric icon={<PsychologyAltOutlined />} label="Adaptive" value={analytics.adaptiveItems} />
            <Metric icon={<AnalyticsOutlined />} label="Hard Items" value={analytics.highDifficulty} />
            <Metric icon={<SecurityOutlined />} label="Attempts" value={draft.attempts} />
          </div>
        </Panel>
      </div>

      <AIWorkflowPanel
        title="Adaptive learning workflow"
        description="Turn lesson materials into quiz drafts, flashcards, and next-step study guidance."
        onGenerateQuiz={generateQuiz}
        onGenerateReviewer={() => setActiveTab('preview')}
        onGenerateFlashcards={() => setActiveTab('preview')}
        onGenerateRecommendations={() => setActiveTab('analytics')}
        recommendations={aiRecommendations.recommendations || []}
      />

      <div className="flex flex-wrap gap-2">
        {['builder', 'files', 'preview', 'analytics'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full border-2 border-token px-4 py-2 text-sm font-black capitalize ${activeTab === tab ? 'primary-btn' : 'bg-surface text-main'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'builder' ? (
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <Panel>
            <h2 className="text-xl font-black text-black">Quiz setup</h2>
            <div className="mt-4 grid gap-3">
              <Field label="Title"><input className="input-base" value={draft.title} onChange={(e) => update({ title: e.target.value })} /></Field>
              <Field label="Topic or prompt"><textarea className="input-base min-h-[90px]" value={draft.topic} onChange={(e) => update({ topic: e.target.value })} placeholder="Example: JavaScript loops, photosynthesis, Philippine history" /></Field>
              <Field label="Description"><textarea className="input-base min-h-[80px]" value={draft.description} onChange={(e) => update({ description: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Timer"><input className="input-base" type="number" min="1" value={draft.timer} onChange={(e) => update({ timer: e.target.value })} /></Field>
                <Field label="Attempts"><input className="input-base" type="number" min="1" value={draft.attempts} onChange={(e) => update({ attempts: e.target.value })} /></Field>
              </div>
              <Field label="Question count"><input className="input-base" type="number" min="1" value={draft.count} onChange={(e) => update({ count: e.target.value })} /></Field>
              <Field label="Question bank"><input className="input-base" value={draft.questionBank} onChange={(e) => update({ questionBank: e.target.value })} /></Field>
            </div>
          </Panel>

          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black text-black">Questions</h2>
              <select className="input-base max-w-xs" onChange={(e) => addQuestion(e.target.value)} value="">
                <option value="" disabled>Add question type</option>
                {questionTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div className="mt-5 space-y-4">
              {quizQuestions.map((question, index) => (
                <QuestionEditor
                  key={question.id}
                  index={index}
                  question={question}
                  onChange={(patch) => updateQuestion(question.id, patch)}
                  onRemove={() => removeQuestion(question.id)}
                />
              ))}
            </div>
          </Panel>
        </div>
      ) : null}

      {activeTab === 'files' ? (
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <Panel>
            <h2 className="text-xl font-black text-black">File scanning</h2>
            <p className="mt-2 text-sm font-semibold leading-7 text-black/60">
              Upload materials for concept extraction. Browser-side TXT extraction is active; PDF, DOCX, PPTX, image OCR, and URL parsing are ready for backend AI/OCR integration.
            </p>
            <label className="mt-5 grid cursor-pointer place-items-center rounded-[22px] border-2 border-dashed border-token landing-accent-green p-8 text-center">
              <FileUploadOutlined sx={{ fontSize: 42 }} className="text-emerald-600" />
              <span className="mt-3 text-sm font-black text-main">Drop or choose files</span>
              <input type="file" multiple className="sr-only" accept=".pdf,.docx,.pptx,.txt,image/*" onChange={(e) => handleFiles(e.target.files)} />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              {acceptedFormats.map((format) => <Pill key={format}>{format}</Pill>)}
            </div>
          </Panel>

          <Panel>
            <h2 className="text-xl font-black text-main">Scan results</h2>
            <p className="mt-2 rounded-2xl landing-accent-green p-3 text-sm font-bold text-main">{scanStatus}</p>
            {scanSummary ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <ResultBlock title="Key concepts" items={scanSummary.concepts} />
                <ResultBlock title="Definitions found" items={scanSummary.definitions} />
                <ResultBlock title="Formulas or logic" items={scanSummary.formulas} />
                <ResultBlock title="Integrity scan" items={[`${scanSummary.duplicateLines} duplicate lines`, scanSummary.unsupportedFlags.length ? scanSummary.unsupportedFlags.join(', ') : 'No unsupported content flags']} />
              </div>
            ) : null}
          </Panel>
        </div>
      ) : null}

      {activeTab === 'preview' ? (
        <Panel>
          <div className="mb-5 flex items-center gap-3">
            <VisibilityOutlined className="text-main" />
            <h2 className="text-xl font-black text-main">Real-time student preview</h2>
          </div>
          <div className="space-y-4">
            {quizQuestions.map((question, index) => (
              <div key={question.id} className="rounded-[22px] border border-token bg-surface p-4">
                <div className="flex flex-wrap gap-2">
                  <Pill>{question.type}</Pill>
                  <Pill tone="light">{question.bloom}</Pill>
                  <Pill tone="light">{question.difficulty}</Pill>
                </div>
                <h3 className="mt-4 text-lg font-black text-black">{index + 1}. {question.prompt || question.text || question.question || 'Untitled question'}</h3>
                {question.alt_text ? <p className="mt-2 text-xs font-semibold text-muted">Alt text: {question.alt_text}</p> : null}
                {question.type === 'Multiple Choice' || question.type === 'True or False' ? (
                  <div className="mt-4 grid gap-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="rounded-2xl border border-token bg-surface p-3">
                        <p className="text-sm font-bold text-main">{String.fromCharCode(65 + optionIndex)}. {getChoiceText(option) || 'Option text'}</p>
                        {!option.correct ? <p className="mt-1 text-xs font-semibold text-main">Adaptive feedback: {option.feedback}</p> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <textarea className="input-base mt-4 min-h-[100px]" placeholder="Student answer area" readOnly />
                )}
                <p className="mt-3 text-sm font-semibold text-muted">Hint: {question.hint || 'A targeted hint will appear here.'}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <FlashcardDeck
              title="AI flashcards"
              cards={flashcards.map((card) => ({
                id: card.id,
                front: card.front,
                back: card.back,
                conceptTags: card.conceptTags,
              }))}
            />
          </div>
        </Panel>
      ) : null}

      {activeTab === 'analytics' ? (
        <Panel>
          <h2 className="text-xl font-black text-black">Smart analytics dashboard</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <Metric icon={<AnalyticsOutlined />} label="Total questions" value={analytics.total} />
            <Metric icon={<PsychologyAltOutlined />} label="Adaptive items" value={analytics.adaptiveItems} />
            <Metric icon={<FactCheckOutlined />} label="Question mix" value={quizQuestions.length ? `${new Set(quizQuestions.map((q) => q.type)).size} types` : '0'} />
            <Metric icon={<SecurityOutlined />} label="Integrity" value={draft.tabSwitchDetection ? 'On' : 'Off'} />
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <SettingsGroup title="Adaptive feedback" draft={draft} update={update} keys={['adaptiveFeedback', 'hintsOnly', 'followUps', 'studyRecommendations', 'confidenceScoring']} />
            <SettingsGroup title="Security and integrity" draft={draft} update={update} keys={['browserLockdown', 'tabSwitchDetection', 'plagiarismDetection']} />
            <SettingsGroup title="Accessibility" draft={draft} update={update} keys={['speechSupport', 'largeTypography', 'colorblindSafe']} />
          </div>
          <div className="mt-5">
            <TeacherAnalytics analytics={teacherAnalytics} />
          </div>
          <p className="mt-5 rounded-2xl landing-accent-green p-4 text-sm font-semibold text-main">
            AI insight: Review items tagged as Hard and Analysis. These are most useful for detecting weak areas and generating follow-up remediation questions.
          </p>
          {aiRecommendations.summary ? (
            <p className="mt-4 rounded-2xl border border-token bg-surface p-4 text-sm font-semibold leading-6 text-main">
              {aiRecommendations.summary}
            </p>
          ) : null}
        </Panel>
      ) : null}

    </div>
  )
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-[18px] border border-token bg-surface p-4">
      <span className="text-emerald-600">{icon}</span>
      <p className="mt-3 text-2xl font-black text-main">{value}</p>
      <p className="text-xs font-bold text-subtle">{label}</p>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-subtle">{label}</span>
      {children}
    </label>
  )
}

function QuestionEditor({ question, index, onChange, onRemove }) {
  const promptValue = question.prompt || question.text || question.question || ''

  const setOption = (optionIndex, patch) => {
    const nextOptions = question.options.map((option, index) => (index === optionIndex ? { ...option, ...patch } : option))
    const currentOption = question.options[optionIndex] || {}
    const nextPatch = { options: nextOptions }

    if (currentOption.correct || patch.correct) {
      const selectedText = nextOptions.find((option) => option.correct)?.text || nextOptions[optionIndex]?.text || ''
      nextPatch.answer = selectedText
      nextPatch.correctAnswer = selectedText
    }

    onChange(nextPatch)
  }

  return (
    <div className="rounded-[22px] border border-token bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-black text-main">Question {index + 1}</h3>
        <button type="button" onClick={onRemove} className="rounded-full bg-white p-2 text-red-600">
          <DeleteOutline />
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Field label="Type"><select className="input-base" value={question.type} onChange={(e) => onChange({ type: e.target.value })}>{questionTypes.map((type) => <option key={type}>{type}</option>)}</select></Field>
        <Field label="Bloom level"><select className="input-base" value={question.bloom} onChange={(e) => onChange({ bloom: e.target.value })}>{bloomLevels.map((level) => <option key={level}>{level}</option>)}</select></Field>
        <Field label="Difficulty"><select className="input-base" value={question.difficulty} onChange={(e) => onChange({ difficulty: e.target.value })}>{['Easy', 'Medium', 'Hard'].map((level) => <option key={level}>{level}</option>)}</select></Field>
      </div>
      <div className="mt-3 grid gap-3">
        <Field label="Prompt"><textarea className="input-base min-h-[90px]" value={promptValue} onChange={(e) => onChange({ prompt: e.target.value, text: e.target.value, question: e.target.value })} /></Field>
        <Field label="Alt text for screen readers"><input className="input-base" value={question.alt_text} onChange={(e) => onChange({ alt_text: e.target.value })} /></Field>
      </div>

      {question.type === 'Multiple Choice' || question.type === 'True or False' ? (
        <div className="mt-4 grid gap-3">
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex} className="grid gap-2 rounded-2xl bg-white p-3">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={option.correct}
                  onChange={() => {
                    const selectedText = option.text || ''
                    onChange({
                      options: question.options.map((item, index) => ({
                        ...item,
                        correct: index === optionIndex,
                        feedback: index === optionIndex
                          ? item.feedback || 'Correct. This matches the key concept.'
                          : item.feedback || 'This answer is not correct. Review the lesson concept and try again.',
                      })),
                      answer: selectedText,
                      correctAnswer: selectedText,
                    })
                  }}
                />
                <input className="input-base" value={option.text} onChange={(e) => setOption(optionIndex, { text: e.target.value })} placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`} />
              </div>
              {!option.correct ? <textarea className="input-base min-h-[70px]" value={option.feedback} onChange={(e) => setOption(optionIndex, { feedback: e.target.value })} placeholder="Specific adaptive feedback for this wrong answer" /> : null}
            </div>
          ))}
        </div>
      ) : null}

      {question.type === 'Matching Type' ? (
        <div className="mt-4 grid gap-3">
          {question.matches.map((pair, pairIndex) => (
            <div key={pairIndex} className="grid gap-3 md:grid-cols-2">
              <input className="input-base" value={pair.left} onChange={(e) => onChange({ matches: question.matches.map((item, index) => index === pairIndex ? { ...item, left: e.target.value } : item) })} placeholder="Term" />
              <input className="input-base" value={pair.right} onChange={(e) => onChange({ matches: question.matches.map((item, index) => index === pairIndex ? { ...item, right: e.target.value } : item) })} placeholder="Match" />
            </div>
          ))}
          <button type="button" onClick={() => onChange({ matches: [...question.matches, { left: '', right: '' }] })} className="rounded-2xl border-2 border-dashed border-black bg-white px-4 py-2 text-sm font-black">Add pair</button>
        </div>
      ) : null}

      {question.type === 'Coding Questions' ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Language"><input className="input-base" value={question.codeLanguage} onChange={(e) => onChange({ codeLanguage: e.target.value })} /></Field>
          <Field label="Test cases"><textarea className="input-base min-h-[90px]" value={question.testCases} onChange={(e) => onChange({ testCases: e.target.value })} /></Field>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Field label="Answer key"><textarea className="input-base min-h-[80px]" value={question.answer || question.correctAnswer || ''} onChange={(e) => {
          const value = e.target.value
          const nextPatch = { answer: value, correctAnswer: value }
          if (question.type === 'Multiple Choice' || question.type === 'True or False') {
            const target = normalizeText(value)
            nextPatch.options = question.options.map((option, optionIndex) => ({
              ...option,
              correct: normalizeText(option.text) === target,
              feedback: normalizeText(option.text) === target
                ? option.feedback || 'Correct. This matches the key concept.'
                : option.feedback || 'This answer is not correct. Review the lesson concept and try again.',
            }))
            if (!nextPatch.options.some((option) => option.correct) && nextPatch.options.length) {
              nextPatch.options[0] = { ...nextPatch.options[0], correct: true }
            }
          }
          onChange(nextPatch)
        }} /></Field>
        <Field label="Hint"><textarea className="input-base min-h-[80px]" value={question.hint} onChange={(e) => onChange({ hint: e.target.value })} /></Field>
        <Field label="Explanation or rubric"><textarea className="input-base min-h-[80px]" value={question.explanation || question.rubric} onChange={(e) => onChange({ explanation: e.target.value, rubric: e.target.value })} /></Field>
      </div>
    </div>
  )
}

function ResultBlock({ title, items }) {
  return (
    <div className="rounded-[20px] border border-token bg-surface p-4">
      <h3 className="font-black text-main">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm font-semibold text-subtle">
        {(items || []).length ? items.map((item, index) => <li key={index}>{item}</li>) : <li>No items detected yet.</li>}
      </ul>
    </div>
  )
}

function SettingsGroup({ title, draft, update, keys }) {
  const labels = {
    adaptiveFeedback: 'Adaptive feedback',
    hintsOnly: 'Hints before answers',
    followUps: 'Follow-up questions',
    studyRecommendations: 'Study recommendations',
    confidenceScoring: 'AI confidence scoring',
    browserLockdown: 'Browser lockdown',
    tabSwitchDetection: 'Tab-switch detection',
    plagiarismDetection: 'Plagiarism detection',
    speechSupport: 'Speech support',
    largeTypography: 'Large typography',
    colorblindSafe: 'Colorblind-friendly UI',
  }

  return (
    <div className="rounded-[20px] border border-token bg-surface p-4">
      <h3 className="font-black text-main">{title}</h3>
      <div className="mt-3 space-y-2">
        {keys.map((key) => (
          <label key={key} className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-3 py-2 text-sm font-bold text-subtle">
            {labels[key]}
            <input type="checkbox" checked={Boolean(draft[key])} onChange={(e) => update({ [key]: e.target.checked })} />
          </label>
        ))}
      </div>
    </div>
  )
}
