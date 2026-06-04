import React, { useState, useEffect } from 'react'
import { ArrowLeft, Loader } from 'lucide-react'
import { apiFetch } from '../../lib/apiClient'
import { toast } from '../../lib/ToastProvider'
import StudentSubmissionForm from './StudentSubmissionForm'
import StudentSubmissionView from './StudentSubmissionView'

/**
 * EXAMPLE IMPLEMENTATION: AssignmentDetailView
 * Shows how to integrate StudentSubmissionForm and StudentSubmissionView
 * in an actual assignment detail page
 * 
 * This is a reference implementation - adapt to your actual assignment page structure
 */
export default function AssignmentDetailView({ assignmentId, courseId, onBack }) {
  const [assignment, setAssignment] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('details') // 'details', 'submit', 'view'

  useEffect(() => {
    loadAssignmentAndSubmission()
  }, [assignmentId])

  const loadAssignmentAndSubmission = async () => {
    try {
      setLoading(true)
      
      // Load assignment
      const assignRes = await apiFetch(`/api/assignments/${assignmentId}`)
      if (!assignRes.ok) throw new Error('Failed to load assignment')
      const assignData = await assignRes.json()
      setAssignment(assignData)

      // Load student's submission (if exists)
      try {
        const subRes = await apiFetch(`/api/assignments/${assignmentId}/submissions`)
        if (subRes.ok) {
          const submissions = await subRes.json()
          // Get the first submission for the current student (API returns student's own submission when not teacher)
          if (submissions && submissions.length > 0) {
            setSubmission(submissions[0])
            // Switch to view tab if submission exists
            setActiveTab('view')
          }
        }
      } catch (err) {
        // No submission yet
        console.log('No submission yet')
      }
    } catch (err) {
      console.error(err)
      setError(err.message)
      toast.error('Failed to load', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmissionSuccess = (newSubmission) => {
    setSubmission(newSubmission)
    setActiveTab('view')
    loadAssignmentAndSubmission() // Refresh data
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader size={32} className="animate-spin text-slate-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg bg-red-50 border border-red-200">
        <p className="text-red-700 font-semibold">Error loading assignment</p>
        <p className="text-red-600 text-sm mt-2">{error}</p>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="p-6 rounded-lg bg-slate-50 border border-slate-200">
        <p className="text-slate-700">Assignment not found</p>
      </div>
    )
  }

  const isLate = new Date() > new Date(assignment.due_at)
  const daysUntilDue = Math.ceil((new Date(assignment.due_at) - new Date()) / (1000 * 60 * 60 * 24))

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{assignment.title}</h1>
            <p className="text-slate-600 text-sm mt-1">
              Due: {new Date(assignment.due_at).toLocaleDateString()} 
              {isLate ? ' (Overdue)' : daysUntilDue <= 7 ? ` (${daysUntilDue} days)` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Assignment Description */}
      <div className="mb-8 p-6 rounded-2xl border border-slate-200 bg-white">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Details</h2>
        <p className="text-slate-700 whitespace-pre-wrap">
          {assignment.description || 'No description provided'}
        </p>
        
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Points</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{assignment.points || 0}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Due Date</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">
                {new Date(assignment.due_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'details'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Assignment Details
        </button>
        
        {!submission && (
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'submit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Submit Assignment
          </button>
        )}
        
        {submission && (
          <>
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'submit'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Update Submission
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'view'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              View Submission
            </button>
          </>
        )}
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* Additional assignment details can go here */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
              <p className="text-slate-700">
                This is your assignment. Review the details above and submit your work using the "Submit Assignment" tab.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'submit' && (
          <StudentSubmissionForm
            assignment={assignment}
            existingSubmission={submission}
            onSubmissionSuccess={handleSubmissionSuccess}
            courseId={courseId}
          />
        )}

        {activeTab === 'view' && submission && (
          <StudentSubmissionView
            submission={submission}
            assignment={assignment}
          />
        )}
      </div>
    </div>
  )
}

/**
 * USAGE in your routing:
 * 
 * import AssignmentDetailView from './components/dashboard/AssignmentDetailView'
 * 
 * <AssignmentDetailView
 *   assignmentId="assign_123"
 *   courseId="course_456"
 *   onBack={() => navigate('/assignments')}
 * />
 */

/**
 * INTEGRATION NOTES:
 * 
 * 1. This component loads both assignment details and student submission
 * 2. StudentSubmissionForm handles file upload and submission
 * 3. StudentSubmissionView displays the submitted work
 * 4. Tabs switch between details, submit, and view
 * 5. All file uploads are handled automatically
 * 
 * To integrate into your app:
 * 1. Copy this file or adapt it to your existing assignment detail page
 * 2. Replace your current submission form with StudentSubmissionForm
 * 3. Replace your current submission view with StudentSubmissionView
 * 4. Import the new components at the top
 * 5. Pass the required props
 * 
 * Required props for StudentSubmissionForm:
 * - assignment: object with id, title, due_at, etc.
 * - existingSubmission: null or submission object
 * - onSubmissionSuccess: function called after successful submission
 * - courseId: string (optional, for tracking)
 * 
 * Required props for StudentSubmissionView:
 * - submission: submission object
 * - assignment: assignment object with due_at
 */
