# Quick Reference - Form Components & React Hook Form

## TL;DR - Quick Start

### 1. Define Your Schema
```jsx
import { z } from 'zod'

const mySchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email')
})
```

### 2. Use in Component
```jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormInput, FormGroup } from './common/FormComponents'

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(mySchema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormGroup>
        <FormInput
          {...register('name')}
          label="Name"
          error={errors.name?.message}
        />
        <FormInput
          type="email"
          {...register('email')}
          label="Email"
          error={errors.email?.message}
        />
      </FormGroup>
      <button type="submit">Submit</button>
    </form>
  )
}
```

## Component Quick Reference

### FormInput
```jsx
<FormInput
  id="unique-id"           // ← IMPORTANT: Always include
  label="Field Label"      // Optional
  type="text"              // text, email, password, number, date
  placeholder="..."        // Optional
  required={true}          // Shows * on label
  disabled={false}         // Disable input
  error={errors.name?.message}
  {...register('fieldName')}
/>
```

### FormTextarea
```jsx
<FormTextarea
  id="unique-id"
  label="Comments"
  rows={4}                 // Default: 4
  placeholder="..."
  error={errors.comments?.message}
  {...register('comments')}
/>
```

### FormSelect
```jsx
<FormSelect
  id="unique-id"
  label="Status"
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]}
  error={errors.status?.message}
  {...register('status')}
/>
```

### FormCheckbox
```jsx
<FormCheckbox
  id="unique-id"
  label="I agree to terms"
  error={errors.agree?.message}
  {...register('agree')}
/>
```

### FormGroup
```jsx
<FormGroup>
  <FormInput {...} />
  <FormInput {...} />
</FormGroup>
```

### FormSection
```jsx
<FormSection title="Personal Info">
  <FormInput {...} />
  <FormInput {...} />
</FormSection>
```

## Zod Schema Patterns

### Required Text
```jsx
title: z.string().min(1, 'Title required')
```

### Min Length
```jsx
description: z.string().min(10, 'At least 10 characters')
```

### Email
```jsx
email: z.string().email('Invalid email')
```

### Optional
```jsx
notes: z.string().optional().or(z.literal(''))
```

### Number
```jsx
points: z.number().min(0, 'Cannot be negative').max(100)
```

### Enum/Select
```jsx
status: z.enum(['draft', 'published', 'archived'])
```

### Date
```jsx
due_date: z.string().refine(
  (val) => !val || !isNaN(new Date(val).getTime()),
  'Invalid date'
).optional()
```

## React Hook Form Patterns

### Basic Setup
```jsx
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})
```

### Reset Form
```jsx
const { reset } = useForm()

// Clear all fields
reset()

// Set specific values
reset({ name: 'John', email: 'john@example.com' })
```

### Populate from Data
```jsx
const { setValue } = useForm()

useEffect(() => {
  if (initialData) {
    setValue('name', initialData.name)
    setValue('email', initialData.email)
  }
}, [initialData, setValue])
```

### Access Form State
```jsx
const { watch, formState: { errors, isValid, isDirty } } = useForm()

// Watch specific field
const name = watch('name')

// Check if form is valid
if (isValid) { /* ... */ }
```

## Common Validation Patterns

### Validate on Change
```jsx
const { watch } = useForm()
const password = watch('password')

// Use in schema or in component logic
```

### Dependent Fields
```jsx
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})
```

### Custom Validation
```jsx
custom: z.string().refine(
  async (val) => {
    const exists = await checkIfExists(val)
    return !exists
  },
  'Already exists'
)
```

## Modal Forms

### Complete Modal Example
```jsx
export function MyModal({ isOpen, onClose, onSubmit, initialData }) {
  const { register, handleSubmit, errors, reset, setValue } = useForm({
    resolver: zodResolver(mySchema),
    defaultValues: { name: '', email: '' }
  })

  useEffect(() => {
    if (initialData && isOpen) {
      setValue('name', initialData.name || '')
      setValue('email', initialData.email || '')
    } else if (!initialData && isOpen) {
      reset()
    }
  }, [isOpen, initialData, setValue, reset])

  const handleFormSubmit = async (data) => {
    await onSubmit({ ...data, id: initialData?.id })
    reset()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit' : 'Create'}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitText={initialData ? 'Update' : 'Create'}
    >
      <FormGroup>
        <FormInput
          {...register('name')}
          label="Name"
          error={errors.name?.message}
        />
        <FormInput
          type="email"
          {...register('email')}
          label="Email"
          error={errors.email?.message}
        />
      </FormGroup>
    </Modal>
  )
}
```

## Error Handling

### Display Field Error
```jsx
<FormInput
  {...register('name')}
  error={errors.name?.message}  // Shows error if exists
/>
```

### Check if Field has Error
```jsx
const { formState: { errors } } = useForm()

if (errors.name) {
  // Field has error
}
```

### Manual Error Setting
```jsx
const { setError } = useForm()

setError('name', {
  type: 'manual',
  message: 'Custom error message'
})
```

## Accessibility Checklist

- ✅ All inputs have `id` attribute
- ✅ All labels have `htmlFor={id}`
- ✅ Error messages have `aria-describedby`
- ✅ Invalid inputs have `aria-invalid="true"`
- ✅ Form is keyboard navigable
- ✅ Required fields marked with asterisk
- ✅ Color not the only indicator of error

## Testing

### Unit Test Example
```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('form validates required field', async () => {
  render(<MyForm />)
  
  // Try to submit empty form
  await userEvent.click(screen.getByText('Submit'))
  
  // Check error appears
  expect(screen.getByText('Title required')).toBeInTheDocument()
})
```

## Performance Tips

- ✅ Use `watch()` sparingly (causes re-renders)
- ✅ Use `useFormState()` for validation state
- ✅ Use `useCallback()` for onChange handlers
- ✅ Use field-level validation before form submit
- ✅ Debounce async validation

## Common Mistakes

### ❌ Don't Forget ID
```jsx
// WRONG - no id attribute
<FormInput {...register('name')} />

// CORRECT
<FormInput id="name-field" {...register('name')} />
```

### ❌ Don't Mix Spread Operators
```jsx
// WRONG
<FormInput label="Name" {...register('name')} error={errors.name} />

// CORRECT
<FormInput
  {...register('name')}
  id="name-field"
  label="Name"
  error={errors.name?.message}
/>
```

### ❌ Don't Forget Reset
```jsx
// WRONG - form fields stay filled after submit
const handleSubmit = async (data) => {
  await api.submit(data)
  // No reset!
}

// CORRECT
const handleSubmit = async (data) => {
  await api.submit(data)
  reset()  // ← Clear form
}
```

### ❌ Don't Forget to Handle Edit Mode
```jsx
// WRONG - only works for create
useEffect(() => {
  reset()
}, [isOpen])

// CORRECT - works for both create and edit
useEffect(() => {
  if (initialData && isOpen) {
    setValue('name', initialData.name || '')
  } else if (!initialData && isOpen) {
    reset()
  }
}, [isOpen, initialData, setValue, reset])
```

## Resources

- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [ARIA Docs](https://www.w3.org/WAI/ARIA/)
- [FormComponents.jsx Source](../src/components/common/FormComponents.jsx)
- [Form Validation Fix Guide](./FORM_VALIDATION_FIX.md)

---

**Tip**: Copy the modal example above and customize it for your needs!
