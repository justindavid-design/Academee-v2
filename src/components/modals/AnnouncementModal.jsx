import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '../common/Modal'
import { FormInput, FormTextarea, FormGroup } from '../common/FormComponents'
import FileUpload from '../common/FileUpload'
import { announcementSchema } from '../../schemas/formSchemas'

export default function AnnouncementModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData = null,
  title = 'Create Announcement',
}) {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [fileError, setFileError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(announcementSchema),
    mode: 'onChange',  // Validate on every change to clear errors in real-time
    defaultValues: {
      title: '',
      body: '',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (initialData && isOpen) {
      setValue('title', initialData.title || '')
      setValue('body', initialData.body || '')
      setUploadedFiles([])
      setFileError(null)
    } else if (!initialData && isOpen) {
      reset()
      setUploadedFiles([])
      setFileError(null)
    }
  }, [isOpen, initialData, setValue, reset])

  const handleFormSubmit = async (data) => {
    await onSubmit({
      ...data,
      files: uploadedFiles,
      id: initialData?.id, // Include ID if editing
    })
    reset()
    setUploadedFiles([])
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      onSubmit={handleSubmit(handleFormSubmit)}
      submitText={initialData ? 'Update Announcement' : 'Post Announcement'}
      submitLoading={isLoading}
    >
      <div className="space-y-6">
        <FormGroup>
          <FormInput
            id="announcement-title"
            label="Title"
            required
            placeholder="What's new?"
            {...register('title')}
            error={errors.title?.message}
          />

          <FormTextarea
            id="announcement-body"
            label="Announcement"
            required
            placeholder="Write your announcement here..."
            rows={6}
            {...register('body')}
            error={errors.body?.message}
          />
        </FormGroup>

        <FileUpload
          onChange={(files, errorsList) => {
            setFileError(errorsList?.[0] || null)
            if (!errorsList?.length) setUploadedFiles(files)
          }}
          error={fileError}
          files={uploadedFiles}
          multiple
          label="Attach announcement files"
          description="Share PDFs, images, slides, or ZIP files with the class"
        />
      </div>
    </Modal>
  )
}
