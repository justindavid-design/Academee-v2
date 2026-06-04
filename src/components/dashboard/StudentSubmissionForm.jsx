import React, { useEffect, useState } from 'react'
import { Send, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import UploadDropzone from '../common/UploadDropzone'
import { apiFetch } from '../../lib/apiClient'
import { toast } from '../../lib/ToastProvider'
import { StudentCard, StudentPill, StudentProgressBar } from '../student/StudentSurface'
import TextToSpeechButton from '../accessibility/TextToSpeechButton'
import SpeechInputButton from '../accessibility/SpeechInputButton'
import { enrichSubmission } from '../../lib/submissionStatus'
import { emitLmsEvent } from '../../lib/lmsEvents'

export default function StudentSubmissionForm({
  assignment,
  existingSubmission = null,
  onSubmissionSuccess = null,
  courseId = null,
}) {
  const [files, setFiles] = useState([])
  const [fileError, setFileError] = useState(null)
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (existingSubmission?.content) {
      try {
        const content = typeof existingSubmission.content === 'string'
          ? JSON.parse(existingSubmission.content)
          : existingSubmission.content

        if (content?.note) setNotes(content.note)
        if (content?.files && Array.isArray(content.files)) setFiles(content.files)
      } catch (err) {
        console.error('Error parsing existing submission:', err)
      }
    }
  }, [existingSubmission])

  const handleFilesSelected = (selectedFiles, error) => {
    setFileError(error || null)
    setFiles(selectedFiles)
  }

  const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))

    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100)
        setUploadProgress((prev) => ({ ...prev, [file.name]: percent }))
      }
    })

    return new Promise((resolve, reject) => {
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(new Error(xhr.statusText || 'Upload failed'))
        }
      })
      xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
      xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))
      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (files.length === 0 && !notes.trim()) {
      toast.warning('Empty submission', 'Please add files or notes to your submission')
      return
    }

    if (fileError) {
      toast.error('File errors', 'Please fix file upload errors before submitting')
      return
    }

    try {
      setIsSubmitting(true)
      setUploading(true)

      const uploadedFiles = []
      const filesToUpload = files.filter((file) => file instanceof File)

      for (const file of filesToUpload) {
        try {
          const uploadedFile = await uploadFile(file)
          uploadedFiles.push({
            name: uploadedFile.name,
            filename: uploadedFile.filename,
            url: uploadedFile.url,
            type: uploadedFile.type,
            size: uploadedFile.size,
          })
        } catch (err) {
          toast.error('Upload failed', `Failed to upload ${file.name}: ${err.message}`)
          setIsSubmitting(false)
          setUploading(false)
          return
        }
      }

      const allFiles = [...uploadedFiles, ...files.filter((file) => !(file instanceof File))]

      const submissionData = {
        content: JSON.stringify({
          files: allFiles.map((file) => ({
            name: file.name,
            filename: file.filename,
            url: file.url,
            type: file.type,
            size: file.size,
          })),
          note: notes.trim(),
          submittedAt: new Date().toISOString(),
        }),
      }

      const res = await apiFetch(`/api/assignments/${assignment.id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      })

      if (!res.ok) throw new Error('Submission failed')

      const submission = await res.json()
      const normalizedSubmission = enrichSubmission(submission, assignment)
      setSubmitted(true)
      setFiles([])
      setNotes('')
      toast.success('Submitted', existingSubmission ? 'Your submission has been updated' : 'Your assignment has been submitted successfully')
      emitLmsEvent({
        type: 'submission-updated',
        action: 'submit',
        assignmentId: assignment.id,
        submission: normalizedSubmission,
        timestamp: Date.now(),
      })
      onSubmissionSuccess?.(normalizedSubmission)

      setTimeout(() => {
        setSubmitted(false)
      }, 3000)
    } catch (err) {
      console.error('Submission error:', err)
      toast.error('Submission failed', err.message || 'Could not submit your assignment')
    } finally {
      setIsSubmitting(false)
      setUploading(false)
      setUploadProgress({})
    }
  }

  const isLate = assignment.due_at && new Date() > new Date(assignment.due_at)
  const daysUntilDue = assignment.due_at ? Math.ceil((new Date(assignment.due_at) - new Date()) / (1000 * 60 * 60 * 24)) : null
  const progressValue = Object.values(uploadProgress).reduce((max, value) => Math.max(max, Number(value) || 0), 0)
  const assignmentReadAloud = [
    assignment.title,
    assignment.description || assignment.instructions || assignment.prompt || '',
    assignment.due_at ? `Due ${new Date(assignment.due_at).toLocaleDateString()}.` : '',
  ].filter(Boolean).join(' ')

  if (submitted) {
    return (
      <StudentCard className="border-emerald-100 bg-[#fbfdfb]">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-emerald-50 text-emerald-700">
            <CheckCircle size={30} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[#17251d]">{existingSubmission ? 'Submission Updated' : 'Submitted Successfully'}</h3>
          <p className="mt-1 text-sm text-[#66776d]">
            Your assignment has been {existingSubmission ? 'updated and ' : ''}submitted.
          </p>
        </div>
      </StudentCard>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <StudentCard>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7f8b82]">Submission</p>
            <h2 className="mt-2 text-xl font-semibold text-[#17251d]">{existingSubmission ? 'Update your submission' : 'Submit assignment'}</h2>
            <p className="mt-1 text-sm text-[#66776d]">{assignment.title}</p>
          </div>
          <TextToSpeechButton compact label="Read assignment" text={assignmentReadAloud} />
        </div>
      </StudentCard>

      {isLate ? (
        <StudentCard accent="amber" className="bg-amber-50/40">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 text-amber-700" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Late submission</p>
              <p className="mt-1 text-sm text-amber-800/80">
                This assignment was due on {new Date(assignment.due_at).toLocaleDateString()}.
              </p>
            </div>
          </div>
        </StudentCard>
      ) : daysUntilDue !== null ? (
        <StudentCard accent="blue" className="bg-blue-50/40">
          <p className="text-sm font-medium text-blue-900">
            Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''} ({new Date(assignment.due_at).toLocaleDateString()})
          </p>
        </StudentCard>
      ) : null}

      <StudentCard>
        <div className="flex items-center justify-between gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#17251d] mb-2">Attach files</label>
            <p className="text-xs text-[#66776d]">PDF, Word, PowerPoint, images, and ZIP files are supported.</p>
          </div>
          <StudentPill tone="slate">{files.filter((file) => file instanceof File).length} local</StudentPill>
        </div>
        <div className="mt-4">
          <UploadDropzone
            selectedFiles={files.filter((file) => file instanceof File)}
            onFilesSelected={handleFilesSelected}
            error={fileError}
            maxFiles={5}
            maxSize={50 * 1024 * 1024}
          />
        </div>

        {progressValue > 0 ? (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs text-[#66776d]">
              <span>Upload progress</span>
              <span>{progressValue}%</span>
            </div>
            <StudentProgressBar value={progressValue} tone="emerald" />
          </div>
        ) : null}

        {files.filter((file) => !(file instanceof File)).length > 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7f8b82] mb-3">Already attached</p>
            <div className="space-y-2">
              {files.filter((file) => !(file instanceof File)).map((file, idx) => (
                <a
                  key={idx}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#17251d] transition hover:border-[#1f7a4d]/20 hover:bg-[#f7fbf8]"
                >
                  <span aria-hidden>📎</span>
                  <span className="truncate">{file.name || file.filename}</span>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </StudentCard>

      <StudentCard>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label htmlFor="submission-notes" className="block text-sm font-semibold text-[#17251d]">
            Add notes
          </label>
          <SpeechInputButton
            value={notes}
            onChange={setNotes}
            label="Dictate notes"
            placeholder="Tap to dictate your reflection"
            buttonClassName="shrink-0"
          />
        </div>
        <textarea
          id="submission-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes, comments, or additional information about your submission..."
          rows={4}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#17251d] outline-none transition placeholder:text-[#a0a9a1] focus:border-[#1f7a4d]/40 focus:ring-4 focus:ring-[#1f7a4d]/10"
        />
        <p className="mt-2 text-xs text-[#66776d]">{notes.length} characters</p>
      </StudentCard>

      <button
        type="submit"
        disabled={isSubmitting || uploading || (files.length === 0 && !notes.trim())}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
          isSubmitting || uploading || (files.length === 0 && !notes.trim())
            ? 'cursor-not-allowed bg-slate-200 text-slate-500'
            : 'bg-[#1f7a4d] text-white hover:bg-[#18613d]'
        }`}
      >
        {isSubmitting || uploading ? (
          <>
            <Loader size={18} className="animate-spin" />
            {uploading ? 'Uploading files...' : 'Submitting...'}
          </>
        ) : (
          <>
            <Send size={18} />
            {existingSubmission ? 'Update submission' : 'Submit work'}
          </>
        )}
      </button>
    </form>
  )
}

