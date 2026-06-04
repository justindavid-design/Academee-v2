import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, Plus, Save, Send } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../lib/AuthProvider'
import { apiFetch } from '../../lib/apiClient'
import { safeJson, getApiErrorMessage } from '../courses/utils'
import { createQuizDraft, createQuizQuestion, normalizeQuizType, quizDraftKey } from './quizTypes'
import { QuestionCard, QuizPreviewPanel, QuizSettingsSidebar } from './QuizBuilderLayout'

function toApiType(type) {
  if (type === 'multi-select') return 'checkbox'
  if (type === 'fill-blank' || type === 'open-ended') return 'short-answer'
  return type
}

export default function QuizBuilderPage() {
  const { courseId, quizId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id
  const [searchParams] = useSearchParams()
  const initialType = normalizeQuizType(searchParams.get('type') || 'multiple-choice')
  const [draftId] = useState(() => searchParams.get('draft') || quizId || `draft-${Date.now()}`)
  const key = quizDraftKey(courseId, draftId)

  const [quizInfo, setQuizInfo] = useState(() => createQuizDraft(initialType))
  const [questions, setQuestions] = useState([])
  const [modules, setModules] = useState([])
  const [draggedQuestion, setDraggedQuestion] = useState(null)
  const [pageLoading, setPageLoading] = useState(!!quizId)
  const [isSaving, setIsSaving] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState('Ready')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')

  useEffect(() => {
    const cached = safeParse(localStorage.getItem(key))
    if (cached) {
      setQuizInfo(cached.quizInfo)
      setQuestions(cached.questions || [])
      setPageLoading(false)
      return
    }

    if (quizId) {
      loadQuiz()
    } else {
      const draft = createQuizDraft(initialType)
      setQuizInfo(draft)
      setQuestions(draft.questions)
      setPageLoading(false)
    }
  }, [key, quizId])

  useEffect(() => {
    if (!courseId || !userId) return
    apiFetch(`/api/courses/${courseId}/modules?user_id=${encodeURIComponent(userId)}`)
      .then(async (res) => (res.ok ? safeJson(res) : []))
      .then((data) => setModules(Array.isArray(data) ? data : []))
      .catch(() => setModules([]))
  }, [courseId, userId])

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify({ quizInfo, questions }))
      setAutoSaveStatus('Saved locally')
    }, 350)
    setAutoSaveStatus('Saving locally...')
    return () => clearTimeout(timer)
  }, [quizInfo, questions, key])

  async function loadQuiz() {
    setPageLoading(true)
    try {
      const res = await apiFetch(`/api/quizzes/${quizId}`)
      const data = await safeJson(res)
      if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to load quiz'))

      const nextInfo = {
        ...createQuizDraft(initialType),
        title: data.title || 'Untitled Quiz',
        description: data.description || '',
        time_limit: data.time_limit ? String(data.time_limit) : 30,
        due_at: data.due_at ? new Date(data.due_at).toISOString().slice(0, 16) : '',
        attempts_allowed: data.attempts_allowed || 1,
        passing_score: data.passing_score || 70,
        status: data.status || 'draft',
      }
      const nextQuestions = Array.isArray(data.questions) && data.questions.length
        ? data.questions.map((q) => ({
            ...createQuizQuestion(q.type),
            id: q.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            type: normalizeQuizType(q.type),
            question: q.question || q.text || '',
            text: q.text || q.question || '',
            points: q.points || 1,
            timer: q.timer || 30,
            explanation: q.explanation || '',
            trivia: q.trivia || '',
            learningTip: q.learningTip || '',
            difficulty: q.difficulty || 'Medium',
            conceptTags: Array.isArray(q.conceptTags) ? q.conceptTags : [],
            correctAnswer: q.correctAnswer || '',
            choices: Array.isArray(q.choices)
              ? q.choices.map((choice, index) => ({
                  id: choice.id || `choice-${index + 1}`,
                  text: String(choice.text || choice || '').trim(),
                  is_correct: Boolean(choice.is_correct),
                }))
              : Array.isArray(q.options)
                ? q.options.map((option, index) => ({
                    id: `choice-${index + 1}`,
                    text: String(option || '').trim(),
                    is_correct: index === Number(q.correct),
                  }))
                : createQuizQuestion(q.type).choices,
          }))
        : [createQuizQuestion(initialType)]
      setQuizInfo(nextInfo)
      setQuestions(nextQuestions)
    } catch (err) {
      showMessage(err.message, 'error')
    } finally {
      setPageLoading(false)
    }
  }

  function safeParse(value) {
    try { return value ? JSON.parse(value) : null } catch (_e) { return null }
  }

  function showMessage(text, type = 'info') {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 3500)
  }

  function persist(nextQuestions = questions, nextInfo = quizInfo) {
    localStorage.setItem(key, JSON.stringify({ quizInfo: nextInfo, questions: nextQuestions }))
  }

  function openQuestionEditor(questionId, nextQuestions = questions, nextInfo = quizInfo) {
    persist(nextQuestions, nextInfo)
    navigate(`/courses/${courseId}/quizzes/${draftId}/questions/${questionId}/edit`)
  }

  function addQuestion(type = initialType) {
    const question = createQuizQuestion(type)
    const next = [...questions, question]
    setQuestions(next)
    persist(next)
    openQuestionEditor(question.id, next, quizInfo)
  }

  function duplicateQuestion(index) {
    const copy = { ...questions[index], id: `${Date.now()}-${Math.random().toString(16).slice(2)}` }
    const next = [...questions.slice(0, index + 1), copy, ...questions.slice(index + 1)]
    setQuestions(next)
    persist(next)
  }

  function deleteQuestion(index) {
    if (questions.length === 1) {
      showMessage('A quiz needs at least one question.', 'error')
      return
    }
    const next = questions.filter((_, itemIndex) => itemIndex !== index)
    setQuestions(next)
    persist(next)
  }

  function handleDragStart(event, index) {
    setDraggedQuestion(index)
    event.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(event, index) {
    event.preventDefault()
    if (draggedQuestion === null || draggedQuestion === index) return
    const next = [...questions]
    const [dragged] = next.splice(draggedQuestion, 1)
    next.splice(index, 0, dragged)
    setQuestions(next)
    persist(next)
    setDraggedQuestion(null)
  }

  function buildPayload(status) {
    return {
      user_id: userId,
      title: quizInfo.title.trim(),
      description: quizInfo.description.trim(),
      time_limit: quizInfo.time_limit ? parseInt(quizInfo.time_limit) : null,
      due_at: quizInfo.due_at ? new Date(quizInfo.due_at).toISOString() : null,
      attempts_allowed: parseInt(quizInfo.attempts_allowed || 1),
      passing_score: parseInt(quizInfo.passing_score || 70),
      status,
      questions: questions.map((q, idx) => ({
        id: q.id,
        question: q.question || q.text,
        text: q.text,
        type: toApiType(q.type),
        points: parseInt(q.points || 1),
        order: idx,
        caseSensitive: q.answerValidation || false,
        choices: (q.choices || []).map((choice, choiceIndex) => ({
          id: choice.id || `choice-${choiceIndex + 1}`,
          text: String(choice.text || choice || '').trim(),
          is_correct: Boolean(choice.is_correct),
        })),
        options: Array.isArray(q.options) ? q.options : q.choices,
        correct: Number.isInteger(q.correct) ? q.correct : 0,
        correctAnswer: q.correctAnswer || q.options?.[q.correct] || '',
        difficulty: q.difficulty || 'Medium',
        conceptTags: Array.isArray(q.conceptTags) ? q.conceptTags : [],
        explanation: q.explanation || '',
        trivia: q.trivia || '',
        learningTip: q.learningTip || '',
      })),
    }
  }

  function validateQuiz() {
    if (!quizInfo.title.trim()) return 'Quiz title is required.'
    if (!questions.length) return 'Add at least one question.'
    const invalid = questions.find((q) => {
      if (!q.text?.trim()) return true
      if (q.type === 'open-ended') return false
      return !(q.choices || []).some((choice) => choice.is_correct && String(choice.text || '').trim())
    })
    return invalid ? 'Every question needs text and a correct answer.' : ''
  }

  async function saveQuiz(status = 'draft') {
    const error = validateQuiz()
    if (error) {
      showMessage(error, 'error')
      return
    }

    setIsSaving(true)
    try {
      const method = quizId ? 'PUT' : 'POST'
      const url = quizId ? `/api/quizzes/${quizId}` : `/api/courses/${courseId}/quizzes`
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(status)),
      })
      const data = await safeJson(res)
      if (!res.ok) throw new Error(getApiErrorMessage(data, `Failed to ${status === 'published' ? 'publish' : 'save'} quiz`))
      showMessage(status === 'published' ? 'Quiz published successfully.' : 'Quiz saved as draft.', 'success')
      if (status === 'published') setTimeout(() => navigate(`/courses/${courseId}?tab=classwork`), 900)
    } catch (err) {
      showMessage(err.message, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const totalPoints = useMemo(() => questions.reduce((sum, q) => sum + (parseInt(q.points) || 0), 0), [questions])

  if (pageLoading) {
    return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-50 text-slate-600">Loading quiz...</div>
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 text-slate-950">
      <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={() => navigate(`/courses/${courseId}?tab=classwork`)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50" aria-label="Back to course">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-slate-950 sm:text-lg">{quizInfo.title || 'Untitled Quiz'}</h1>
            <p className="text-xs font-medium text-slate-500">{questions.length} question{questions.length === 1 ? '' : 's'} • {totalPoints} point{totalPoints === 1 ? '' : 's'} • {autoSaveStatus}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-flex">Preview quiz</button>
          <button type="button" onClick={() => saveQuiz('draft')} disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><Save className="h-4 w-4" /> Draft</button>
          <button type="button" onClick={() => saveQuiz('published')} disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"><Send className="h-4 w-4" /> Publish</button>
        </div>
      </header>

      <AnimatePresence>
        {message ? (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className={`fixed right-5 top-20 z-[60] inline-flex max-w-md items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg ${messageType === 'error' ? 'border-red-200 bg-red-50 text-red-700' : messageType === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700'}`}>
            {messageType === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {message}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <QuizSettingsSidebar quizInfo={quizInfo} setQuizInfo={setQuizInfo} modules={modules} />
        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-4xl space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Questions</h2>
                <p className="mt-1 text-sm text-slate-500">Manage question order, scoring, timing, and quick previews.</p>
              </div>
              <button type="button" onClick={() => addQuestion()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                <Plus className="h-4 w-4" /> Create question
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  onEdit={() => openQuestionEditor(question.id)}
                  onDuplicate={() => duplicateQuestion(index)}
                  onDelete={() => deleteQuestion(index)}
                  onDragStart={(event) => handleDragStart(event, index)}
                  onDragOver={handleDragOver}
                  onDrop={(event) => handleDrop(event, index)}
                />
              ))}
            </div>

            <button type="button" onClick={() => addQuestion()} className="w-full rounded-2xl border border-dashed border-slate-300 bg-white py-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-800">
              Add question
            </button>
          </div>
        </main>
        <QuizPreviewPanel questions={questions} totalPoints={totalPoints} />
      </div>
    </div>
  )
}
