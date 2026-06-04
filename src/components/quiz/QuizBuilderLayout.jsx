import React from 'react'
import { Clock, Copy, Eye, GripVertical, MoreVertical, PenLine, Plus, Trash2 } from 'lucide-react'
import { getQuestionTypeLabel } from './quizTypes'

export function QuizSettingsSidebar({ quizInfo, setQuizInfo, modules = [] }) {
  const update = (patch) => setQuizInfo({ ...quizInfo, ...patch })

  return (
    <aside className="w-full border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-[320px] lg:flex-shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="space-y-5 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Quiz settings</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">Assessment setup</h2>
        </div>

        <Field label="Quiz Title">
          <input value={quizInfo.title} onChange={(e) => update({ title: e.target.value })} className="quiz-input" placeholder="Untitled Quiz" />
        </Field>
        <Field label="Description">
          <textarea value={quizInfo.description} onChange={(e) => update({ description: e.target.value })} className="quiz-input min-h-[82px] resize-none" placeholder="Brief quiz description" />
        </Field>
        <Field label="Instructions">
          <textarea value={quizInfo.instructions || ''} onChange={(e) => update({ instructions: e.target.value })} className="quiz-input min-h-[82px] resize-none" placeholder="What should students know before starting?" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Time Limit">
            <input type="number" min="1" value={quizInfo.time_limit || ''} onChange={(e) => update({ time_limit: e.target.value })} className="quiz-input" placeholder="30" />
          </Field>
          <Field label="Passing Score">
            <input type="number" min="0" max="100" value={quizInfo.passing_score || 70} onChange={(e) => update({ passing_score: e.target.value })} className="quiz-input" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Attempts">
            <input type="number" min="1" value={quizInfo.attempts_allowed || 1} onChange={(e) => update({ attempts_allowed: e.target.value })} className="quiz-input" />
          </Field>
          <Field label="Status">
            <select value={quizInfo.status || 'draft'} onChange={(e) => update({ status: e.target.value })} className="quiz-input">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
        </div>

        <Field label="Due Date">
          <input type="datetime-local" value={quizInfo.due_at || ''} onChange={(e) => update({ due_at: e.target.value })} className="quiz-input" />
        </Field>

        <Field label="Assign to Module/Topic">
          <select value={quizInfo.module_id || ''} onChange={(e) => update({ module_id: e.target.value })} className="quiz-input">
            <option value="">No module</option>
            {modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
          </select>
        </Field>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <Toggle label="Shuffle Questions" checked={!!quizInfo.shuffleQuestions} onChange={(value) => update({ shuffleQuestions: value })} />
          <Toggle label="Shuffle Answers" checked={!!quizInfo.shuffleAnswers} onChange={(value) => update({ shuffleAnswers: value })} />
          <Toggle label="Show Correct Answers" checked={quizInfo.showCorrectAnswers !== false} onChange={(value) => update({ showCorrectAnswers: value })} />
          <Toggle label="Auto Grading" checked={quizInfo.autoGrading !== false} onChange={(value) => update({ autoGrading: value })} />
        </div>
      </div>
    </aside>
  )
}

function Field({ label, children }) {
  return <label className="grid gap-2 text-sm"><span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>{children}</label>
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

export function QuestionCard({ question, index, onEdit, onDuplicate, onDelete, onDragStart, onDragOver, onDrop }) {
  const correctCount = question.choices?.filter((choice) => choice.is_correct).length || 0
  return (
    <article draggable onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <button type="button" className="mt-1 text-slate-400 hover:text-slate-600" aria-label="Drag question"><GripVertical className="h-5 w-5" /></button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
              <span>Question {index + 1}</span>
              <span>{getQuestionTypeLabel(question.type)}</span>
              <span>{question.points || 1} pt</span>
              <span>{question.timer || 30} sec</span>
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-950">{question.text || 'Untitled question'}</h3>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {(question.choices || []).slice(0, 4).map((choice) => (
                <div key={choice.id} className={`rounded-xl border px-3 py-2 text-sm ${choice.is_correct ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                  {choice.text || 'Answer option'}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDuplicate()
            }}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Duplicate question"
          ><Copy className="h-4 w-4" /></button>
          <button type="button" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Preview question"><Eye className="h-4 w-4" /></button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete()
            }}
            className="rounded-xl p-2 text-red-500 hover:bg-red-50"
            aria-label="Delete question"
          ><Trash2 className="h-4 w-4" /></button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onEdit()
            }}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          ><PenLine className="h-4 w-4" /> Edit</button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><Clock className="h-3.5 w-3.5" /> {question.timer || 30} sec</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1">{correctCount} correct</span>
      </div>
    </article>
  )
}

export function QuizPreviewPanel({ questions = [], totalPoints = 0 }) {
  return (
    <aside className="hidden w-[260px] flex-shrink-0 border-l border-slate-200 bg-white p-5 xl:block">
      <h2 className="text-sm font-bold text-slate-950">Quiz summary</h2>
      <div className="mt-4 grid gap-3">
        <Summary label="Questions" value={questions.length} />
        <Summary label="Total points" value={totalPoints} />
        <Summary label="Avg points" value={questions.length ? (totalPoints / questions.length).toFixed(1) : '0'} />
      </div>
      <div className="mt-6 space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Navigator</p>
        {questions.map((question, index) => (
          <div key={question.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <span className="font-semibold">Q{index + 1}</span> {question.text || 'Untitled'}
          </div>
        ))}
      </div>
    </aside>
  )
}

function Summary({ label, value }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p><p className="mt-1 text-2xl font-bold text-slate-950">{value}</p></div>
}
