import React, { useState } from 'react'
import { X, ArrowLeft, DownloadCloud } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SubmissionContent from './SubmissionContent'
import { toast } from '../../lib/ToastProvider'
import { apiFetch } from '../../lib/apiClient'

export default function FullScreenSubmissionView({ submission, assignment, onClose, onGradeSaved }) {
  const [gradingScore, setGradingScore] = useState(submission?.score || '')
  const [gradingFeedback, setGradingFeedback] = useState(submission?.feedback || '')
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const saveGrade = async () => {
    if (!gradingScore && gradingScore !== 0) {
      toast.warning('Missing score', 'Please enter a score before saving')
      return
    }

    try {
      setSaving(true)
      const res = await apiFetch(`/api/submissions/${submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: parseFloat(gradingScore),
          feedback: gradingFeedback,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save grade')
      }

      const updatedSubmission = await res.json()
      toast.success('Grade saved', 'The submission has been graded successfully')
      setIsEditing(false)
      
      if (onGradeSaved) {
        onGradeSaved(updatedSubmission)
      }
    } catch (err) {
      toast.error('Failed to save', 'Could not save the grade. Please try again')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Invalid date'
    }
  }

  const isLate = submission?.submitted_at && assignment?.due_at ? new Date(submission.submitted_at) > new Date(assignment.due_at) : false

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen py-8"
        >
          <div className="mx-auto max-w-5xl px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors font-semibold text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Submissions
              </button>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Main Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Student Info Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-black">{submission?.student_name || 'Anonymous Student'}</h1>
                    <p className="mt-2 text-blue-100 text-lg">{assignment?.title}</p>
                    <div className="mt-4 flex items-center gap-4 flex-wrap">
                      <div>
                        <p className="text-sm text-blue-100">Submitted</p>
                        <p className="font-semibold">{formatDate(submission?.submitted_at) || 'Not submitted'}</p>
                      </div>
                      {assignment?.due_at && (
                        <div>
                          <p className="text-sm text-blue-100">Due</p>
                          <p className="font-semibold">{formatDate(assignment.due_at)}</p>
                        </div>
                      )}
                      {isLate && <span className="inline-block px-3 py-1 bg-red-500 rounded-lg text-sm font-bold">⚠ Late</span>}
                    </div>
                  </div>
                  {submission?.score !== null && submission?.score !== undefined && (
                    <div className="text-right">
                      <p className="text-blue-100 text-sm">Score</p>
                      <p className="text-5xl font-black">{submission.score}</p>
                      <p className="text-blue-100 text-sm mt-1">Points</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-8 space-y-8">
                {/* Submission Content */}
                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-4">Submission</h2>
                  <SubmissionContent submission={submission} dueAt={assignment?.due_at} />
                </div>

                {/* Grading Section */}
                <div className="border-t pt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-900">Grade & Feedback</h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
                      >
                        {submission?.score !== null ? '✎ Edit Grade' : '+ Add Grade'}
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                      <div>
                        <label className="block text-sm font-black text-slate-700 mb-2">Score / Points</label>
                        <input
                          type="number"
                          value={gradingScore}
                          onChange={(e) => setGradingScore(e.target.value)}
                          placeholder="Enter score"
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-lg font-semibold focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black text-slate-700 mb-2">Feedback</label>
                        <textarea
                          value={gradingFeedback}
                          onChange={(e) => setGradingFeedback(e.target.value)}
                          placeholder="Add detailed feedback for student..."
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-base font-medium focus:border-blue-500 focus:outline-none"
                          rows="5"
                        />
                      </div>
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveGrade}
                          disabled={saving}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {saving ? 'Saving...' : 'Save Grade'}
                        </button>
                      </div>
                    </div>
                  ) : submission?.score !== null ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-sm font-black text-green-700 mb-2">Score Given</p>
                        <p className="text-4xl font-black text-green-600">{submission.score}</p>
                      </div>
                      {submission?.feedback && (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <p className="text-sm font-black text-blue-700 mb-2">Teacher Feedback</p>
                          <p className="text-base text-blue-900 whitespace-pre-wrap">{submission.feedback}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 text-center">
                      <p className="text-amber-700 font-semibold">No grade assigned yet</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
