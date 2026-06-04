import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '../common/Modal'
import { FormInput, FormTextarea, FormGroup } from '../common/FormComponents'
import FileUpload from '../common/FileUpload'
import { moduleSchema } from '../../schemas/formSchemas'

export default function ModuleModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData = null,
  title = 'Create Module',
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
    resolver: zodResolver(moduleSchema),
    mode: 'onChange',  // Validate on every change to clear errors in real-time
    defaultValues: {
      title: '',
      description: '',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (initialData && isOpen) {
      setValue('title', initialData.title || '')
      setValue('description', initialData.description || '')
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
      submitText={initialData ? 'Update Module' : 'Create Module'}
      submitLoading={isLoading}
    >
      <div className="space-y-6">
        <FormGroup>
          <FormInput
            id="module-title"
            label="Module Title"
            required
            placeholder="e.g., Introduction to React"
            {...register('title')}
            error={errors.title?.message}
          />

          <FormTextarea
            id="module-description"
            label="Description"
            placeholder="Briefly describe what students will learn in this module..."
            rows={4}
            {...register('description')}
            error={errors.description?.message}
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
          label="Upload module resources"
          description="Attach readings, slides, handouts, or activity files"
        />
      </div>
    </Modal>
  )
}
