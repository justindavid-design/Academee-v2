import React from 'react'
import { useFocusSpeech } from '../../accessibility/useFocusSpeech'

export default function FocusReader() {
  const { announcement } = useFocusSpeech()

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {announcement}
    </div>
  )
}
