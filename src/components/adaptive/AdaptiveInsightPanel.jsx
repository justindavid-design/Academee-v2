import React, { useEffect, useMemo, useState } from 'react'
import { BookOpenCheck, Brain, Lightbulb, MessageCircle, Send, Sparkles, Target } from 'lucide-react'
import { apiFetch } from '../../lib/apiClient'
import MasteryChart from '../analytics/MasteryChart'
import { generateRecommendations } from '../../ai/generateRecommendations'

function InsightCard({ title, detail, icon: Icon = Lightbulb }) {
  return (
    <div className="rounded-2xl border border-token bg-surface p-4">
      <div className="flex gap-3">
        <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-surface-alt text-primary-token">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-black text-main">{title}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-muted">{detail}</p>
        </div>
      </div>
    </div>
  )
}

export default function AdaptiveInsightPanel({ courseId, role = 'student', compact = false }) {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [asking, setAsking] = useState(false)

  useEffect(() => {
    let active = true
    async function loadInsights() {
      if (!courseId) return
      setLoading(true)
      try {
        const res = await apiFetch(`/api/adaptive/${courseId}/insights`)
        const data = await res.json()
        if (active) setInsights(data)
      } catch (err) {
        console.error('Adaptive insights failed:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadInsights()
    return () => {
      active = false
    }
  }, [courseId])

  const masteryItems = useMemo(
    () => (insights?.mastery?.concepts || []).map((item) => ({ label: item.concept, value: item.mastery })),
    [insights]
  )

  const aiSummary = useMemo(
    () =>
      generateRecommendations({
        mastery: insights?.mastery?.concepts || [],
        weakConcepts: insights?.remediation || [],
        materials: insights?.materials || [],
        analytics: { averageScore: insights?.mastery?.averageMastery || 0 },
      }),
    [insights]
  )

  const askTutor = async () => {
    if (!question.trim() || !courseId) return
    setAsking(true)
    try {
      const res = await apiFetch(`/api/adaptive/${courseId}/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      setAnswer(await res.json())
    } catch (err) {
      setAnswer({ answer: err.message || 'Tutor response failed.', sources: [] })
    } finally {
      setAsking(false)
    }
  }

  if (!courseId) return null

  return (
    <section className={`rounded-2xl border border-token bg-surface p-5 shadow-sm ${compact ? '' : 'space-y-5'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-token">Adaptive learning</p>
          <h2 className="mt-1 text-xl font-black text-main">{role === 'teacher' ? 'Class intelligence' : 'Your learning guide'}</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-muted">
            {loading ? 'Reading course signals...' : 'Supportive recommendations based on course activity and mastery.'}
          </p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-surface-alt text-primary-token">
          <Brain className="h-5 w-5" />
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <InsightCard icon={Target} title={`${insights?.mastery?.averageMastery || 0}% mastery`} detail="Current concept profile across course activity." />
        <InsightCard icon={Sparkles} title={insights?.difficulty?.level || 'Adaptive'} detail={insights?.difficulty?.rationale || 'Difficulty adapts with support first.'} />
        <InsightCard icon={BookOpenCheck} title={insights?.recommendations?.[0]?.title || 'Keep learning'} detail={insights?.recommendations?.[0]?.reason || 'No urgent learning gap detected yet.'} />
      </div>

      <div className="rounded-2xl border border-token bg-surface-alt p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-token">AI study guidance</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-main">{aiSummary.summary}</p>
        {aiSummary.insights?.length ? (
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
            {aiSummary.insights.slice(0, 2).map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-token bg-surface-alt p-4">
          <p className="mb-3 text-sm font-black text-main">Concept mastery</p>
          <MasteryChart items={masteryItems} label="Accessible mastery heatmap" />
        </div>
        <div className="rounded-2xl border border-token bg-surface-alt p-4">
          <p className="mb-3 text-sm font-black text-main">Remediation plan</p>
          <div className="space-y-2">
            {(insights?.remediation || []).slice(0, 3).map((item) => (
              <div key={item.concept} className="rounded-xl bg-surface p-3">
                <p className="text-sm font-black text-main">{item.title}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-muted">{item.strategy}</p>
              </div>
            ))}
            {!insights?.remediation?.length ? <p className="text-sm text-muted">No remediation needed yet.</p> : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-token bg-surface-alt p-4">
        <div className="mb-3 flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary-token" />
          <p className="text-sm font-black text-main">Course AI tutor</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') askTutor()
            }}
            className="min-h-[44px] flex-1 rounded-xl border border-token bg-surface px-4 text-sm font-semibold text-main outline-none focus:ring-4 focus:ring-emerald-500/10"
            placeholder="Ask about posted course materials..."
            aria-label="Ask the course AI tutor"
          />
          <button type="button" onClick={askTutor} disabled={asking || !question.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-token px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">
            <Send className="h-4 w-4" />
            {asking ? 'Asking' : 'Ask'}
          </button>
        </div>
        {answer ? (
          <div className="mt-3 rounded-xl bg-surface p-4">
            <p className="text-sm font-semibold leading-6 text-main">{answer.answer}</p>
            {answer.sources?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {answer.sources.map((source) => (
                  <span key={`${source.type}-${source.id}`} className="rounded-full bg-surface-alt px-3 py-1 text-xs font-black text-muted">
                    {source.type}: {source.title}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
