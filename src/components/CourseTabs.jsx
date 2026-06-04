import React from 'react'

const tabs = [
  { id: 'stream', label: 'Stream' },
  { id: 'classwork', label: 'Classwork' },
  { id: 'people', label: 'People' },
  { id: 'grades', label: 'Grades' },
]

export default function CourseTabs({ activeTab, onChange, isTeacher }) {
  const visibleTabs = isTeacher ? tabs : tabs.filter((tab) => tab.id !== 'grades')

  return (
    <div className="overflow-x-auto rounded-2xl border border-token bg-surface p-1 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex min-w-max gap-1">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`h-11 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-soft text-primary-token shadow-sm ring-1 ring-primary/10'
                : 'text-muted hover:bg-surface-alt hover:text-main'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
