import { getApiAuthHeaders } from './apiClient'

export const SUPPORTED_FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'zip']
export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'image/png',
  'image/jpeg',
]

export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024

export function formatFileSize(bytes = 0) {
  if (!bytes) return '0 KB'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, index)
  return `${value >= 10 ? Math.round(value) : Math.round(value * 10) / 10} ${units[index]}`
}

export function getFileExtension(fileName = '') {
  return String(fileName).split('.').pop()?.toLowerCase() || ''
}

export function isSupportedFile(file) {
  const extension = getFileExtension(file?.name || file?.filename || '')
  return SUPPORTED_FILE_EXTENSIONS.includes(extension) && (!file?.type || SUPPORTED_FILE_TYPES.includes(file.type))
}

export function validateFiles(files, maxSize = MAX_UPLOAD_SIZE) {
  const validFiles = []
  const errors = []

  Array.from(files || []).forEach((file) => {
    if (!isSupportedFile(file)) {
      errors.push(`${file.name} is not a supported file type.`)
      return
    }

    if (file.size > maxSize) {
      errors.push(`${file.name} is larger than ${formatFileSize(maxSize)}.`)
      return
    }

    validFiles.push(file)
  })

  return { validFiles, errors }
}

export function normalizeAttachment(file = {}) {
  const name = file.name || file.originalname || file.filename || 'Untitled file'
  const url = file.url || file.href || file.path || ''

  return {
    name,
    url,
    type: file.type || file.mimetype || '',
    size: Number(file.size || 0),
    uploadedAt: file.uploadedAt || file.uploaded_at || new Date().toISOString(),
  }
}

export function parseAttachments(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.map(normalizeAttachment).filter((file) => file.name)

  if (typeof value === 'object') {
    return (value.files || value.attachments || []).map(normalizeAttachment).filter((file) => file.name)
  }

  if (typeof value !== 'string') return []

  try {
    const parsed = JSON.parse(value)
    return parseAttachments(parsed)
  } catch (_e) {
    if (value.startsWith('/uploads/')) {
      return [normalizeAttachment({ name: value.split('/').pop(), url: value })]
    }
  }

  return []
}

export function parseContentWithAttachments(value) {
  if (!value) return { text: '', files: [] }

  if (typeof value === 'object') {
    return {
      ...value,
      text: value.text || value.note || value.body || '',
      files: parseAttachments(value),
    }
  }

  try {
    const parsed = JSON.parse(value)
    return parseContentWithAttachments(parsed)
  } catch (_e) {
    return { text: String(value), files: parseAttachments(value) }
  }
}

export function serializeContentWithAttachments(text, files = [], extra = {}) {
  const normalizedFiles = parseAttachments(files)
  if (!normalizedFiles.length && !Object.keys(extra).length) return text || ''

  return JSON.stringify({
    ...extra,
    text: text || '',
    note: text || '',
    files: normalizedFiles,
    attachments: normalizedFiles,
    submittedAt: extra.submittedAt || new Date().toISOString(),
  })
}

export async function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  const authHeaders = await getApiAuthHeaders()
  const headers = { ...authHeaders }
  // Do NOT set Content-Type header with FormData - let browser set it with boundary
  // Remove 'Content-Type': 'application/json' which breaks multipart/form-data
  delete headers['Content-Type']

  try {
    const response = await fetch('http://localhost:8787/api/upload', {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      let errorMsg = `Upload failed with status ${response.status}`
      
      if (contentType?.includes('application/json')) {
        try {
          const data = await response.json()
          errorMsg = data?.error || errorMsg
        } catch (e) {
          errorMsg = await response.text() || errorMsg
        }
      } else {
        errorMsg = await response.text() || errorMsg
      }
      
      throw new Error(errorMsg || `Could not upload ${file.name}`)
    }

    const data = await response.json()
    return normalizeAttachment(data)
  } catch (error) {
    // Better error message for debugging
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      throw new Error(
        `Network error uploading file. Make sure the API server is running on port 8787. ` +
        `Error: ${message}`
      )
    }
    throw new Error(`Could not upload ${file.name}: ${message}`)
  }
}

export async function uploadFiles(files = [], onProgress = () => {}) {
  const selected = Array.from(files || [])
  const uploaded = []

  for (let index = 0; index < selected.length; index += 1) {
    const file = selected[index]
    onProgress(file, 10)
    const metadata = await uploadFile(file)
    uploaded.push(metadata)
    onProgress(file, 100)
  }

  return uploaded
}
