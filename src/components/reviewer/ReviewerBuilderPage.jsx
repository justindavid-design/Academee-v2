import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  BadgeCheck,
  BookOpenCheck,
  ChevronDown,
  Copy,
  Eye,
  GripVertical,
  Layers,
  ListChecks,
  Plus,
  RotateCcw,
  Save,
  Send,
  Sparkles,
  Trash2,
  Trophy,
  Zap,
} from 'lucide-react'
import { createReviewerDraft, createReviewerItem, getReviewerType, reviewerTypes } from './reviewerTypes'
import FileUploadDropzone from '../common/FileUploadDropzone'
import { uploadFiles } from '../../lib/fileUtils'
import StudyProgressTracker from './StudyProgressTracker'
import MatchingGame from './MatchingGame'
import NotesEditor from './NotesEditor'
import TextToSpeechButton from '../accessibility/TextToSpeechButton'
import SpeechInputButton from '../accessibility/SpeechInputButton'
import AIWorkflowPanel from '../ai/AIWorkflowPanel'
import ReviewerPreview from '../ai/ReviewerPreview'
import { generateReviewer } from '../../ai/generateReviewer'

function storageKey(courseId, typeId) {
  return courseId ? `academee_course_${courseId}_reviewer_${typeId}` : `academee_reviewer_studio_${typeId}`
}

function Field({ label, children, actions = null }) {
  return (
    <label className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</span>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </label>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100"
    >
      {label}
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-cyan-500' : 'bg-slate-200'}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? 'left-6' : 'left-1'}`} />
      </span>
    </button>
  )
}

export default function ReviewerBuilderPage() {
  const navigate = useNavigate()
  const { courseId } = useParams()
  const [searchParams] = useSearchParams()
  const typeId = searchParams.get('type') || 'flashcards'
  const type = getReviewerType(typeId)
  const key = storageKey(courseId, typeId)

  const [draft, setDraft] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null') || createReviewerDraft(typeId)
    } catch (_e) {
      return createReviewerDraft(typeId)
    }
  })
  const [selectedItem, setSelectedItem] = useState(0)
  const [autosaveStatus, setAutosaveStatus] = useState('Ready')
  const [mode, setMode] = useState('builder')
  const [flipped, setFlipped] = useState(false)
  const [playerIndex, setPlayerIndex] = useState(0)
  const [answers, setAnswers] = useState({})

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(draft))
      localStorage.setItem(`${key}_updated_at`, new Date().toISOString())
      setAutosaveStatus('Saved')
      setTimeout(() => setAutosaveStatus('Autosave on'), 1200)
    }, 450)
    setAutosaveStatus('Saving...')
    return () => clearTimeout(timer)
  }, [draft, key])

  const stats = useMemo(() => {
    const filled = draft.items.filter((item) => item.prompt?.trim() && item.answer?.trim()).length
    const progress = draft.items.length ? Math.round((filled / draft.items.length) * 100) : 0
    return { filled, progress, total: draft.items.length }
  }, [draft.items])

  const updateDraft = (patch) => setDraft((current) => ({ ...current, ...patch }))
  const updateItem = (index, patch) => {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }))
  }
  const addItem = () => {
    setDraft((current) => ({ ...current, items: [...current.items, createReviewerItem(typeId)] }))
    setSelectedItem(draft.items.length)
  }
  const duplicateItem = (index) => {
    const copyItem = { ...draft.items[index], id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, title: `${draft.items[index].title} copy` }
    setDraft((current) => ({ ...current, items: [...current.items.slice(0, index + 1), copyItem, ...current.items.slice(index + 1)] }))
    setSelectedItem(index + 1)
  }
  const removeItem = (index) => {
    if (draft.items.length === 1) return
    setDraft((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))
    setSelectedItem(Math.max(0, index - 1))
  }
  const moveItem = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= draft.items.length) return
    const items = [...draft.items]
    const [item] = items.splice(index, 1)
    items.splice(target, 0, item)
    updateDraft({ items })
    setSelectedItem(target)
  }
  const generateAiReviewer = () => {
    const source = {
      title: draft.title,
      description: draft.description,
      notes: draft.items
        .map((item) => [item.title, item.prompt, item.answer, item.hint].filter(Boolean).join(' '))
        .join('\n'),
    }
    const generated = generateReviewer({ source, count: Math.max(4, draft.items.length) })
    const nextItems = generated.items.map((item, index) => {
      if (typeId === 'matching') {
        return {
          ...createReviewerItem('matching'),
          id: item.id,
          title: item.title,
          prompt: item.prompt,
          answer: item.answer,
          hint: item.hint,
          tags: item.tags,
          pairs: [
            { left: item.prompt, right: item.answer },
            { left: item.title, right: item.hint || item.answer },
          ],
        }
      }

      if (typeId === 'study-notes') {
        return {
          ...createReviewerItem('study-notes'),
          id: item.id,
          title: item.title,
          prompt: item.prompt,
          answer: item.answer,
          hint: item.hint,
          tags: item.tags,
        }
      }

      if (typeId === 'true-false') {
        return {
          ...createReviewerItem('true-false'),
          id: item.id,
          title: item.title,
          prompt: item.prompt,
          answer: index % 2 === 0 ? 'True' : 'False',
          hint: item.hint,
          tags: item.tags,
        }
      }

      if (typeId === 'identification') {
        return {
          ...createReviewerItem('identification'),
          id: item.id,
          title: item.title,
          prompt: item.prompt,
          answer: item.answer,
          hint: item.hint,
          tags: item.tags,
        }
      }

      return {
        ...createReviewerItem('flashcards'),
        id: item.id,
        title: item.title,
        prompt: item.prompt,
        answer: item.answer,
        hint: item.hint,
        tags: item.tags,
      }
    })

    updateDraft({
      ...generated,
      type: typeId,
      status: draft.status || 'draft',
      items: nextItems,
    })
    setSelectedItem(0)
    setMode('builder')
  }
  const publishReviewer = async () => {
    const itemsWithUploads = []
    for (const item of draft.items) {
      const rawFiles = (item.files || []).filter((file) => typeof File !== 'undefined' && file instanceof File)
      const existingFiles = (item.files || []).filter((file) => !(typeof File !== 'undefined' && file instanceof File))
      const uploaded = rawFiles.length ? await uploadFiles(rawFiles) : []
      itemsWithUploads.push({ ...item, files: [...existingFiles, ...uploaded], attachments: [...existingFiles, ...uploaded] })
    }
    updateDraft({ status: 'published', items: itemsWithUploads })
    setMode('player')
    setPlayerIndex(0)
  }

  const activeItem = draft.items[selectedItem] || draft.items[0]
  const currentPlayItem = draft.items[playerIndex] || draft.items[0]

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#f8fbff] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-white/80 bg-white/82 px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <input
                value={draft.title}
                onChange={(event) => updateDraft({ title: event.target.value })}
                className="w-full bg-transparent text-xl font-black tracking-tight text-slate-950 outline-none sm:text-2xl"
                aria-label="Reviewer title"
              />
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-black text-slate-500">
                <span className={`rounded-full bg-gradient-to-r ${type.gradient} px-2.5 py-1 text-white`}>{type.title}</span>
                <span>{autosaveStatus}</span>
                <span>{draft.status === 'published' ? 'Published' : 'Draft'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setMode(mode === 'builder' ? 'player' : 'builder')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50">
              <Eye className="h-4 w-4" />
              {mode === 'builder' ? 'Preview' : 'Builder'}
            </button>
            <button type="button" onClick={() => localStorage.setItem(key, JSON.stringify(draft))} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-black text-cyan-800 transition hover:bg-cyan-100">
              <Save className="h-4 w-4" />
              Save Draft
            </button>
            <button type="button" onClick={publishReviewer} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-[0_16px_36px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5">
              <Send className="h-4 w-4" />
              Publish Reviewer
            </button>
          </div>
        </div>
      </header>

      {mode === 'builder' ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-5xl space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-[32px] border border-white bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-6"
              >
                <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                  <div>
                    <span className={`inline-flex rounded-full bg-gradient-to-r ${type.gradient} px-3 py-1 text-xs font-black text-white shadow-lg`}>Reviewer setup</span>
                    <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Build a study set students will actually revisit.</h1>
                    <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600">
                      Keep it short, visual, and rewarding. Add a few strong items, preview the learning loop, then publish when it feels smooth.
                    </p>
                    <Field label="Description">
                      <textarea
                        value={draft.description}
                        onChange={(event) => updateDraft({ description: event.target.value })}
                        className="mt-4 min-h-[92px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                      />
                    </Field>
                  </div>
                  <div className="rounded-[28px] bg-slate-950 p-5 text-white">
                    <div className="flex items-center gap-3">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12">
                        <Trophy className="h-6 w-6 text-yellow-300" />
                      </span>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-white/50">Progress</p>
                        <p className="text-3xl font-black">{stats.progress}%</p>
                      </div>
                    </div>
                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/12">
                      <div className={`h-full rounded-full bg-gradient-to-r ${type.gradient}`} style={{ width: `${stats.progress}%` }} />
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-black">
                      <span className="rounded-2xl bg-white/10 px-2 py-3">{stats.total}<br />items</span>
                      <span className="rounded-2xl bg-white/10 px-2 py-3">{draft.xp}<br />XP</span>
                      <span className="rounded-2xl bg-white/10 px-2 py-3">{draft.streakGoal}<br />streak</span>
                    </div>
                  </div>
                </div>
              </motion.section>

              <AIWorkflowPanel
                title="AI reviewer generator"
                description="Turn lesson notes into editable study cards, then refine before publishing."
                onGenerateQuiz={generateAiReviewer}
                onGenerateReviewer={generateAiReviewer}
                onGenerateFlashcards={generateAiReviewer}
                onGenerateRecommendations={() => setMode('player')}
                recommendations={[
                  { concept: 'Accessibility', message: 'Keep prompts short and concise for screen reader flow.' },
                  { concept: 'Review depth', message: 'Use the first two cards for core concepts and the rest for retrieval practice.' },
                ]}
              />

              <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-black text-slate-950">Reviewer content</h2>
                    <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5">
                      <Plus className="h-4 w-4" />
                      Add item
                    </button>
                  </div>

                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {draft.items.map((item, index) => (
                        <motion.article
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -12 }}
                          className={`rounded-[26px] border bg-white p-4 shadow-sm transition ${selectedItem === index ? 'border-cyan-300 ring-4 ring-cyan-100' : 'border-slate-200'}`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <button type="button" onClick={() => setSelectedItem(index)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                              <GripVertical className="h-5 w-5 flex-shrink-0 text-slate-300" />
                              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl bg-slate-100 text-sm font-black text-slate-600">{index + 1}</span>
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-black text-slate-950">{item.title || `${type.title} item`}</span>
                                <span className="block truncate text-xs font-bold text-slate-500">{item.prompt}</span>
                              </span>
                            </button>
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => moveItem(index, -1)} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Move up"><ChevronDown className="h-4 w-4 rotate-180" /></button>
                              <button type="button" onClick={() => moveItem(index, 1)} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Move down"><ChevronDown className="h-4 w-4" /></button>
                              <button type="button" onClick={() => duplicateItem(index)} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Duplicate"><Copy className="h-4 w-4" /></button>
                              <button type="button" onClick={() => removeItem(index)} className="grid h-9 w-9 place-items-center rounded-xl text-red-500 hover:bg-red-50" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <EditorPanel typeId={typeId} item={activeItem} onChange={(patch) => updateItem(selectedItem, patch)} />
              </section>
            </div>
          </main>

          <aside className="w-full overflow-y-auto border-t border-slate-200 bg-white/78 p-4 backdrop-blur-xl lg:w-80 lg:border-l lg:border-t-0">
            <h2 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Settings</h2>
            <div className="mt-4 grid gap-3">
              <Field label="Timer minutes">
                <input type="number" min="1" value={draft.timer} onChange={(event) => updateDraft({ timer: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-cyan-100" />
              </Field>
              <Field label="XP reward">
                <input type="number" min="0" value={draft.xp} onChange={(event) => updateDraft({ xp: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-cyan-100" />
              </Field>
              <Field label="Streak goal">
                <input type="number" min="1" value={draft.streakGoal} onChange={(event) => updateDraft({ streakGoal: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-cyan-100" />
              </Field>
              <Toggle label="Randomize items" checked={draft.randomize} onChange={(value) => updateDraft({ randomize: value })} />
              <Toggle label="Show hints" checked={draft.showHints} onChange={(value) => updateDraft({ showHints: value })} />
              <Toggle label="Allow repeat reviews" checked={draft.allowRepeat} onChange={(value) => updateDraft({ allowRepeat: value })} />
            </div>
            <div className="mt-5">
              <ReviewerPreview items={draft.items.slice(0, 3)} />
            </div>
            <div className="mt-5 rounded-[24px] bg-slate-950 p-4 text-white">
              <p className="text-sm font-black">Navigator</p>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {draft.items.map((item, index) => (
                  <button key={item.id} type="button" onClick={() => setSelectedItem(index)} className={`h-10 rounded-xl text-xs font-black ${selectedItem === index ? 'bg-cyan-400 text-slate-950' : 'bg-white/10 text-white'}`}>
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <ReviewerPlayer
          draft={draft}
          type={type}
          currentItem={currentPlayItem}
          currentIndex={playerIndex}
          setCurrentIndex={setPlayerIndex}
          flipped={flipped}
          setFlipped={setFlipped}
          answers={answers}
          setAnswers={setAnswers}
        />
      )}
    </div>
  )
}

function EditorPanel({ typeId, item, onChange }) {
  if (!item) return null
  const isNotes = typeId === 'study-notes'
  const isMatching = typeId === 'matching'
  const usesOptions = ['practice-quiz', 'mock-test', 'interactive-set'].includes(typeId)

  return (
    <aside className="sticky top-24 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-black text-slate-950">Item editor</h3>
          <p className="text-xs font-bold text-slate-500">Fast, focused, student-friendly</p>
        </div>
        <div className="ml-auto">
          <TextToSpeechButton
            compact
            label="Read item"
            text={[
              item.title,
              item.prompt,
              item.answer,
              item.hint ? `Hint: ${item.hint}` : '',
            ]}
          />
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        <Field
          label="Item title"
          actions={(
            <SpeechInputButton
              value={item.title || ''}
              onChange={(value) => onChange({ title: value })}
              label="Dictate title"
              placeholder="Dictate title"
            />
          )}
        >
          <input value={item.title} onChange={(event) => onChange({ title: event.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100" />
        </Field>
        <Field
          label={isNotes ? 'Note heading' : typeId === 'flashcards' ? 'Front' : 'Prompt'}
          actions={(
            <SpeechInputButton
              value={item.prompt || ''}
              onChange={(value) => onChange({ prompt: value })}
              label="Dictate prompt"
              placeholder="Dictate prompt"
            />
          )}
        >
          <textarea value={item.prompt} onChange={(event) => onChange({ prompt: event.target.value })} className="min-h-[96px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100" />
        </Field>
        <Field
          label={isNotes ? 'Summary content' : typeId === 'flashcards' ? 'Back' : 'Answer'}
          actions={(
            <SpeechInputButton
              value={item.answer || ''}
              onChange={(value) => onChange({ answer: value })}
              label="Dictate answer"
              placeholder="Dictate answer"
            />
          )}
        >
          <textarea value={item.answer} onChange={(event) => onChange({ answer: event.target.value })} className="min-h-[110px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100" />
        </Field>
        <Field
          label="Hint or feedback"
          actions={(
            <SpeechInputButton
              value={item.hint || ''}
              onChange={(value) => onChange({ hint: value })}
              label="Dictate hint"
              placeholder="Dictate hint"
            />
          )}
        >
          <textarea value={item.hint} onChange={(event) => onChange({ hint: event.target.value })} className="min-h-[74px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100" />
        </Field>
        <Field label="Tags">
          <input value={item.tags} onChange={(event) => onChange({ tags: event.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100" />
        </Field>

        <Field label="Resources">
          <FileUploadDropzone
            files={item.files || []}
            onChange={(files) => onChange({ files })}
            label="Attach reviewer resources"
            description="Add images, PDFs, handouts, slides, or ZIP files"
          />
        </Field>

        {usesOptions ? (
          <Field label="Answer cards">
            <div className="grid gap-2">
              {(item.options || []).map((option, index) => (
                <input key={index} value={option} onChange={(event) => onChange({ options: item.options.map((value, optionIndex) => optionIndex === index ? event.target.value : value) })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100" />
              ))}
            </div>
          </Field>
        ) : null}

        {isNotes ? (
          <NotesEditor item={item} onChange={onChange} />
        ) : null}

        {isMatching ? (
          <Field label="Matching pairs">
            <div className="grid gap-2">
              {(item.pairs || []).map((pair, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-2">
                  <input value={pair.left} onChange={(event) => onChange({ pairs: item.pairs.map((value, pairIndex) => pairIndex === index ? { ...value, left: event.target.value } : value) })} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold outline-none focus:ring-4 focus:ring-cyan-100" />
                  <input value={pair.right} onChange={(event) => onChange({ pairs: item.pairs.map((value, pairIndex) => pairIndex === index ? { ...value, right: event.target.value } : value) })} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold outline-none focus:ring-4 focus:ring-cyan-100" />
                </div>
              ))}
              <button type="button" onClick={() => onChange({ pairs: [...(item.pairs || []), { left: 'New term', right: 'New definition' }] })} className="rounded-2xl border border-dashed border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-800">
                Add pair
              </button>
            </div>
          </Field>
        ) : null}
      </div>
    </aside>
  )
}

function ReviewerPlayer({ draft, type, currentItem, currentIndex, setCurrentIndex, flipped, setFlipped, answers, setAnswers }) {
  const isLast = currentIndex >= draft.items.length - 1
  const answer = answers[currentItem?.id] || ''
  const progress = draft.items.length ? Math.round(((currentIndex + 1) / draft.items.length) * 100) : 0

  const next = () => {
    setFlipped(false)
    setCurrentIndex(isLast ? 0 : currentIndex + 1)
  }

  return (
    <main className="flex min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
        <section className="grid place-items-center rounded-[36px] border border-white bg-white p-5 shadow-[0_26px_80px_rgba(15,23,42,0.10)] sm:p-8">
          <div className="w-full max-w-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <span className={`rounded-full bg-gradient-to-r ${type.gradient} px-4 py-2 text-xs font-black text-white`}>{type.title} mode</span>
              <span className="text-sm font-black text-slate-500">{currentIndex + 1} / {draft.items.length}</span>
            </div>

            <motion.button
              type="button"
              onClick={() => setFlipped(!flipped)}
              className="min-h-[340px] w-full rounded-[34px] bg-slate-950 p-7 text-left text-white shadow-[0_26px_80px_rgba(15,23,42,0.24)] outline-none focus-visible:ring-4 focus-visible:ring-cyan-200"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.45 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={flipped ? '[transform:rotateY(180deg)]' : ''}>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/50">{flipped ? 'Answer' : 'Prompt'}</p>
                <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-5xl">{flipped ? currentItem?.answer : currentItem?.prompt}</h2>
                <p className="mt-6 text-sm font-bold leading-7 text-white/65">{flipped ? currentItem?.hint : 'Tap or press Enter to flip. Swipe-ready layout for mobile study sessions.'}</p>
              </div>
            </motion.button>

            {type.id !== 'flashcards' && type.id !== 'study-notes' ? (
              <div className="mt-5 grid gap-3">
                {type.id === 'matching' ? (
                  <MatchingGame pairs={currentItem?.pairs || []} />
                ) : currentItem?.options?.length ? (
                  currentItem.options.map((option, index) => (
                    <button key={index} type="button" onClick={() => setAnswers({ ...answers, [currentItem.id]: option })} className={`rounded-2xl border p-4 text-left text-sm font-black transition ${answer === option ? 'border-cyan-400 bg-cyan-50 text-cyan-900 ring-4 ring-cyan-100' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                      {option}
                    </button>
                  ))
                ) : (
                  <input value={answer} onChange={(event) => setAnswers({ ...answers, [currentItem.id]: event.target.value })} placeholder="Type your answer..." className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-cyan-100" />
                )}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={() => setFlipped(false)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700">
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-500/20">
                {isLast ? 'Restart' : 'Next item'}
                <Zap className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <StudyProgressTracker progress={progress} xp={draft.xp} streak={draft.streakGoal} items={draft.items.length} gradient={type.gradient} />
          <div className="rounded-[30px] border border-slate-200 bg-white p-5">
            <h3 className="flex items-center gap-2 text-lg font-black text-slate-950"><BookOpenCheck className="h-5 w-5 text-cyan-600" /> Review path</h3>
            <div className="mt-4 grid gap-2">
              {draft.items.map((item, index) => (
                <button key={item.id} type="button" onClick={() => setCurrentIndex(index)} className={`rounded-2xl px-3 py-3 text-left text-sm font-black transition ${index === currentIndex ? 'bg-cyan-50 text-cyan-900 ring-2 ring-cyan-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                  {index + 1}. {item.title || 'Study item'}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 text-center">
      <Icon className="mx-auto h-5 w-5 text-cyan-600" />
      <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
    </div>
  )
}

export function ReviewerStudio() {
  const [searchParams, setSearchParams] = useSearchParams()
  const typeId = searchParams.get('type')

  if (!typeId) {
    return (
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="overflow-hidden rounded-[34px] border border-white bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <span className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">Reviewer Studio</span>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">Create study sets that feel alive.</h1>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-8 text-slate-600">
                Replace static quizzes with flashcards, mock tests, notes, matching games, and repeatable review sets.
              </p>
            </div>
            <div className="rounded-[30px] bg-gradient-to-br from-cyan-400 to-pink-400 p-5 text-white shadow-[0_24px_60px_rgba(6,182,212,0.25)]">
              <Layers className="h-9 w-9" />
              <p className="mt-8 text-5xl font-black">8</p>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-white/75">reviewer modes</p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {reviewerTypes.map((type) => (
            <motion.button
              key={type.id}
              type="button"
              onClick={() => setSearchParams({ type: type.id })}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="min-h-[210px] overflow-hidden rounded-[28px] border border-white bg-white p-5 text-left shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
            >
              <div className={`h-2 rounded-full bg-gradient-to-r ${type.gradient}`} />
              <h2 className="mt-6 text-2xl font-black text-slate-950">{type.title}</h2>
              <p className="mt-2 text-sm font-bold text-slate-500">{type.description}</p>
              <p className="mt-5 text-sm font-semibold leading-6 text-slate-600">{type.longDescription}</p>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  return <ReviewerBuilderPage />
}
