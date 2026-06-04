import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, GripVertical, ImagePlus, Plus, Save, Trash2 } from 'lucide-react'
import { createQuizQuestion, getQuestionTypeLabel, quizDraftKey } from './quizTypes'

export default function QuestionEditor() {
  const { courseId, quizId, questionId } = useParams()
  const navigate = useNavigate()
  const key = quizDraftKey(courseId, quizId)
  const [draft, setDraft] = useState(null)
  const [question, setQuestion] = useState(null)
  const [dragged, setDragged] = useState(null)

  useEffect(() => {
    const stored = safeParse(localStorage.getItem(key))
    if (!stored) {
      const fallback = { quizInfo: { title: 'Untitled Quiz' }, questions: [createQuizQuestion()] }
      setDraft(fallback)
      setQuestion(fallback.questions[0])
      return
    }
    const found = stored.questions?.find((item) => String(item.id) === String(questionId)) || stored.questions?.[0]
    setDraft(stored)
    setQuestion(found)
  }, [key, questionId])

  function safeParse(value) {
    try { return value ? JSON.parse(value) : null } catch (_e) { return null }
  }

  function updateQuestion(patch) {
    setQuestion((current) => ({ ...current, ...patch }))
  }

  function updateChoice(index, patch) {
    updateQuestion({ choices: question.choices.map((choice, choiceIndex) => choiceIndex === index ? { ...choice, ...patch } : choice) })
  }

  function addChoice() {
    updateQuestion({ choices: [...(question.choices || []), { id: `${Date.now()}`, text: '', is_correct: false }] })
  }

  function removeChoice(index) {
    if ((question.choices || []).length <= 1) return
    updateQuestion({ choices: question.choices.filter((_, choiceIndex) => choiceIndex !== index) })
  }

  function setCorrect(index) {
    const multi = question.type === 'multi-select'
    updateQuestion({
      choices: question.choices.map((choice, choiceIndex) => ({
        ...choice,
        is_correct: multi ? (choiceIndex === index ? !choice.is_correct : choice.is_correct) : choiceIndex === index,
      })),
    })
  }

  function handleDragStart(index) {
    setDragged(index)
  }

  function handleDrop(index) {
    if (dragged === null || dragged === index) return
    const next = [...question.choices]
    const [item] = next.splice(dragged, 1)
    next.splice(index, 0, item)
    updateQuestion({ choices: next })
    setDragged(null)
  }

  function handleMedia(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updateQuestion({ media: { name: file.name, url: reader.result } })
    reader.readAsDataURL(file)
  }

  function saveAndReturn() {
    const nextDraft = {
      ...draft,
      questions: draft.questions.map((item) => String(item.id) === String(question.id) ? question : item),
    }
    localStorage.setItem(key, JSON.stringify(nextDraft))
    navigate(`/dashboard/course/${courseId}/quiz/create?type=${question.type}&draft=${quizId}`)
  }

  const isTextOnly = question?.type === 'fill-blank' || question?.type === 'open-ended'
  const title = useMemo(() => question ? getQuestionTypeLabel(question.type) : 'Question', [question])

  if (!question || !draft) {
    return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-50 text-slate-600">Loading question...</div>
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 text-slate-950">
      <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={saveAndReturn} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50" aria-label="Back to quiz builder">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Question editor</p>
            <h1 className="text-lg font-bold text-slate-950">{title}</h1>
          </div>
        </div>
        <button type="button" onClick={saveAndReturn} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
          <Save className="h-4 w-4" /> Save question
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-200 bg-white p-5 lg:sticky lg:top-0 lg:h-screen lg:w-[300px] lg:flex-shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Question settings</p>
              <h2 className="mt-2 text-xl font-bold text-slate-950">Behavior</h2>
            </div>
            <Field label="Points"><input type="number" min="1" value={question.points || 1} onChange={(e) => updateQuestion({ points: Math.max(1, parseInt(e.target.value) || 1) })} className="quiz-input" /></Field>
            <Field label="Timer"><input type="number" min="5" value={question.timer || 30} onChange={(e) => updateQuestion({ timer: Math.max(5, parseInt(e.target.value) || 30) })} className="quiz-input" /></Field>
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <Toggle label="Required question" checked={!!question.required} onChange={(value) => updateQuestion({ required: value })} />
              <Toggle label="Randomized answers" checked={!!question.randomizeAnswers} onChange={(value) => updateQuestion({ randomizeAnswers: value })} />
              <Toggle label="Partial credit" checked={!!question.partialCredit} onChange={(value) => updateQuestion({ partialCredit: value })} />
              <Toggle label="Answer validation" checked={!!question.answerValidation} onChange={(value) => updateQuestion({ answerValidation: value })} />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Field label="Question prompt">
                  <textarea value={question.text} onChange={(e) => updateQuestion({ text: e.target.value })} className="quiz-input min-h-[140px] resize-none text-base" placeholder="Write the question students will answer..." />
                </Field>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-950">Answer options</h2>
                    <p className="mt-1 text-sm text-slate-500">Select the correct answer and reorder options as needed.</p>
                  </div>
                  {!isTextOnly ? <button type="button" onClick={addChoice} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Plus className="h-4 w-4" /> Option</button> : null}
                </div>

                <div className="mt-4 space-y-3">
                  {(question.choices || []).map((choice, index) => (
                    <div key={choice.id} draggable onDragStart={() => handleDragStart(index)} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(index)} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <GripVertical className="h-5 w-5 flex-shrink-0 text-slate-400" />
                      <button type="button" onClick={() => setCorrect(index)} className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border ${choice.is_correct ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                        <Check className="h-4 w-4" />
                      </button>
                      <input value={choice.text} onChange={(e) => updateChoice(index, { text: e.target.value })} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100" placeholder={isTextOnly ? 'Expected answer or grading reference' : `Answer option ${index + 1}`} />
                      {!isTextOnly ? <button type="button" onClick={() => removeChoice(index)} className="rounded-xl p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button> : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Field label="Explanation / feedback">
                  <textarea value={question.explanation || ''} onChange={(e) => updateQuestion({ explanation: e.target.value })} className="quiz-input min-h-[110px] resize-none" placeholder="Explain the correct answer or add teacher feedback notes." />
                </Field>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm">
                <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl bg-slate-50 p-6 text-center hover:bg-slate-100">
                  <ImagePlus className="h-8 w-8 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-800">Upload image or media attachment</span>
                  <span className="text-xs text-slate-500">Media is saved into the local draft preview.</span>
                  <input type="file" accept="image/*" onChange={handleMedia} className="sr-only" />
                </label>
                {question.media?.url ? <img src={question.media.url} alt={question.media.name || 'Question media'} className="mt-4 max-h-64 rounded-2xl border border-slate-200 object-contain" /> : null}
              </div>
            </section>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-bold text-slate-950">Preview</h2>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{title} • {question.points || 1} pt • {question.timer || 30} sec</p>
                  <p className="mt-3 font-semibold text-slate-950">{question.text || 'Your question preview will appear here.'}</p>
                  <div className="mt-4 space-y-2">
                    {(question.choices || []).map((choice) => (
                      <div key={choice.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">{choice.text || 'Answer option'}</div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return <label className="grid gap-2"><span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>{children}</label>
}

function Toggle({ label, checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-white">
      {label}
      <span className={`relative h-5 w-9 rounded-full transition ${checked ? 'bg-emerald-700' : 'bg-slate-300'}`}>
        <span className={`absolute top-1 h-3 w-3 rounded-full bg-white transition ${checked ? 'left-5' : 'left-1'}`} />
      </span>
    </button>
  )
}
