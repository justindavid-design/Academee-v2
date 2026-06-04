import React from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Highlighter, Paperclip } from 'lucide-react'

export default function NotesEditor({ item, onChange }) {
  const sections = Array.isArray(item.sections) && item.sections.length
    ? item.sections
    : [
        { title: item.prompt || 'Key idea', body: item.answer || 'Write a concise explanation.', open: true },
      ]

  const updateSection = (index, patch) => {
    onChange({ sections: sections.map((section, sectionIndex) => sectionIndex === index ? { ...section, ...patch } : section) })
  }

  const addSection = () => {
    onChange({ sections: [...sections, { title: 'New section', body: 'Add examples, highlights, or reminders.', open: true }] })
  }

  return (
    <div className="rounded-[24px] border border-violet-100 bg-violet-50/60 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-black text-violet-950">Notes blocks</p>
          <p className="text-xs font-bold text-violet-700">Notion-style collapsible study notes.</p>
        </div>
        <button type="button" onClick={addSection} className="rounded-2xl bg-white px-3 py-2 text-xs font-black text-violet-700 shadow-sm">
          Add block
        </button>
      </div>
      <div className="grid gap-2">
        {sections.map((section, index) => (
          <motion.div key={index} layout className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => updateSection(index, { open: !section.open })} className="grid h-8 w-8 place-items-center rounded-xl bg-violet-50 text-violet-700">
                <ChevronDown className={`h-4 w-4 transition ${section.open ? '' : '-rotate-90'}`} />
              </button>
              <input
                value={section.title}
                onChange={(event) => updateSection(index, { title: event.target.value })}
                className="min-w-0 flex-1 bg-transparent text-sm font-black text-slate-950 outline-none"
              />
            </div>
            {section.open ? (
              <textarea
                value={section.body}
                onChange={(event) => updateSection(index, { body: event.target.value })}
                className="mt-3 min-h-[82px] w-full resize-none rounded-2xl border border-violet-100 bg-violet-50/45 px-3 py-2 text-sm font-semibold leading-6 text-slate-700 outline-none focus:ring-4 focus:ring-violet-100"
              />
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-black text-violet-700">
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1"><Highlighter className="h-3 w-3" /> Highlight</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1"><Paperclip className="h-3 w-3" /> Attachment-ready</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
