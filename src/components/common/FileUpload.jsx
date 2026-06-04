import React from 'react'
import FileUploadDropzone from './FileUploadDropzone'

export default function FileUpload({ onChange, files = [], error = null, multiple = true, maxSize, ...props }) {
  return (
    <FileUploadDropzone
      {...props}
      files={files}
      multiple={multiple}
      maxSize={maxSize}
      error={error}
      onChange={(nextFiles) => onChange?.(nextFiles, [])}
    />
  )
}
