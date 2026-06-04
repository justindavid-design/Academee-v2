import React from 'react'
import { RotateCcw } from 'lucide-react'
import { useAccessibilitySettings } from '../../accessibility/useAccessibilitySettings'

function SettingToggle({ title, description, checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="flex items-center justify-between gap-4 rounded-2xl border border-token bg-surface px-4 py-4 text-left transition hover:bg-surface-alt focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-main">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-muted">{description}</span>
      </span>
      <span className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${checked ? 'bg-primary-token' : 'bg-surface-quiet'}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? 'left-6' : 'left-1'}`} />
      </span>
    </button>
  )
}

export default function AccessibilitySettingsPanel({ className = '', title = 'Accessibility', description = 'Subtle assistive controls for reading, navigation, and assessment.' }) {
  const {
    highContrast,
    largeText,
    reducedMotion,
    readableFont,
    textToSpeech,
    speechNavigation,
    speechToText,
    speechRate,
    updatePreferences,
    resetPreferences,
  } = useAccessibilitySettings()

  const speechEnabled = textToSpeech || speechNavigation || speechToText

  return (
    <section className={`rounded-[1.5rem] border border-token bg-surface p-5 shadow-[var(--shadow-card)] md:p-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-main">{title}</h3>
          <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-muted">{description}</p>
        </div>
        <button
          type="button"
          onClick={resetPreferences}
          className="inline-flex items-center gap-2 rounded-2xl border border-token bg-surface px-4 py-2.5 text-sm font-semibold text-main transition hover:bg-surface-alt"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        <SettingToggle
          title="Text-to-Speech"
          description="Read announcements, quizzes, reviewer content, and feedback aloud."
          checked={textToSpeech}
          onChange={() => updatePreferences({ textToSpeech: !textToSpeech })}
        />
        <SettingToggle
          title="Speech Navigation"
          description="Announce focused buttons, tabs, and cards during keyboard navigation."
          checked={speechNavigation}
          onChange={() => updatePreferences({ speechNavigation: !speechNavigation })}
        />
        <SettingToggle
          title="Speech-to-Text"
          description="Use voice dictation in supported text fields."
          checked={speechToText}
          onChange={() => updatePreferences({ speechToText: !speechToText })}
        />
        <SettingToggle
          title="Reduced Motion"
          description="Minimize movement and animated transitions."
          checked={reducedMotion}
          onChange={() => updatePreferences({ reducedMotion: !reducedMotion })}
        />
        <SettingToggle
          title="High Contrast"
          description="Increase contrast for clearer surfaces and borders."
          checked={highContrast}
          onChange={() => updatePreferences({ highContrast: !highContrast })}
        />
        <SettingToggle
          title="Larger Text"
          description="Increase base text size slightly across the LMS."
          checked={largeText}
          onChange={() => updatePreferences({ largeText: !largeText })}
        />
        <SettingToggle
          title="Readable Font"
          description="Use a simpler font stack for denser reading flows."
          checked={readableFont}
          onChange={() => updatePreferences({ readableFont: !readableFont })}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-token bg-surface-quiet p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-main">Speech rate</p>
            <p className="mt-1 text-xs text-muted">Applies to text-to-speech and focus announcements.</p>
          </div>
          <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-main">
            {Number(speechRate).toFixed(2)}x
          </span>
        </div>
        <input
          type="range"
          min="0.75"
          max="1.75"
          step="0.05"
          value={speechRate}
          onChange={(event) => updatePreferences({ speechRate: Number(event.target.value) })}
          className="mt-4 h-2 w-full cursor-pointer accent-[color:var(--primary)]"
          aria-label="Speech rate"
        />
      </div>

      <div className="mt-4 text-xs text-muted">
        {speechEnabled ? 'Assistive speech features are enabled.' : 'Speech features are off, but the controls remain ready.'}
      </div>
    </section>
  )
}
