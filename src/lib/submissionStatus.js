const VALID_STATUSES = ['draft', 'submitted', 'late', 'graded', 'returned', 'missing']

export function normalizeStatus(value, fallback = 'draft') {
  const status = String(value || '').toLowerCase()
  return VALID_STATUSES.includes(status) ? status : fallback
}

export function isSubmissionLate(submission, dueAt) {
  if (!submission || !dueAt) return false
  const submittedAt = submission.submitted_at || submission.submittedAt
  if (!submittedAt) return false

  const submittedTime = new Date(submittedAt).getTime()
  const dueTime = new Date(dueAt).getTime()
  return Number.isFinite(submittedTime) && Number.isFinite(dueTime) && submittedTime > dueTime
}

export function getSubmissionStatus(submission, dueAt = null) {
  if (!submission) {
    if (dueAt && new Date(dueAt).getTime() < Date.now()) return 'missing'
    return 'draft'
  }

  const explicit = normalizeStatus(submission.status, '')
  if (explicit) return explicit

  if (submission.graded_at || submission.score != null) return 'graded'
  if (submission.submitted_at || submission.submittedAt) {
    return isSubmissionLate(submission, dueAt) ? 'late' : 'submitted'
  }

  if (submission.content || submission.attachment_url || submission.attachmentUrl) return 'draft'
  if (dueAt && new Date(dueAt).getTime() < Date.now()) return 'missing'
  return 'draft'
}

export function enrichSubmission(submission, assignment = null) {
  if (!submission) return null
  return {
    ...submission,
    status: getSubmissionStatus(submission, assignment?.due_at || assignment?.dueAt || null),
  }
}

export function canUnsubmitSubmission(submission, assignment = null, settings = {}) {
  if (!submission || !assignment) return false
  const status = getSubmissionStatus(submission, assignment.due_at || assignment.dueAt || null)
  if (status === 'graded' && !settings.allowUnsubmitAfterGrade) return false

  const dueAt = assignment.due_at || assignment.dueAt
  if (!dueAt) return true

  const dueTime = new Date(dueAt).getTime()
  const now = Date.now()
  if (!Number.isFinite(dueTime)) return true
  if (now <= dueTime) return true

  return Boolean(settings.allowLateEdits || assignment.allow_late_edits || assignment.allowLateEdits)
}

export function getSubmissionStatusMeta(status) {
  const normalized = normalizeStatus(status, 'draft')
  const meta = {
    draft: { label: 'Draft', tone: 'slate' },
    submitted: { label: '✓ Submitted', tone: 'emerald' },
    late: { label: 'Late', tone: 'amber' },
    graded: { label: 'Graded', tone: 'blue' },
    returned: { label: 'Returned', tone: 'violet' },
    missing: { label: 'Missing', tone: 'rose' },
  }

  return meta[normalized] || meta.draft
}

export function getSubmissionStatusTone(status) {
  return getSubmissionStatusMeta(status).tone
}

export function getSubmissionStatusLabel(status) {
  return getSubmissionStatusMeta(status).label
}

export function listSubmissionStatuses() {
  return [...VALID_STATUSES]
}

