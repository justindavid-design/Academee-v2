#!/usr/bin/env node
const fs = require('fs');

const filePath = 'src/components/student/StudentCourseExperience.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  // QuestionCard modal
  ['border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]', 'border border-token bg-surface p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]'],
  ['p className="mt-2 text-sm font-semibold leading-6 text-slate-600', 'p className="mt-2 text-sm font-semibold leading-6 text-muted'],
  ['rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-700', 'rounded-2xl border border-token bg-surface-alt p-4 text-sm font-bold text-main'],
  
  // Quiz header and footer
  ['border-b border-slate-200 bg-white', 'border-b border-token bg-surface'],
  ['text-sm font-black text-slate-950', 'text-sm font-black text-main'],
  ['border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700', 'border border-token bg-surface px-3 py-2 text-sm font-black text-main'],
  ['hover:bg-slate-50', 'hover:bg-surface-alt'],
  ['focus:ring-slate-100', 'focus:ring-primary/10'],
  
  // Confirm submit modal
  ['fixed inset-0 z-[70] grid place-items-center bg-slate-950/45', 'fixed inset-0 z-[70] grid place-items-center bg-slate-950/45'],
  ['w-full max-w-md rounded-[28px] bg-white p-6 text-slate-950', 'w-full max-w-md rounded-[28px] bg-surface p-6 text-main'],
  ['text-2xl font-black', 'text-2xl font-black text-main'],
  ['mt-2 text-sm font-semibold leading-6 text-slate-600', 'mt-2 text-sm font-semibold leading-6 text-muted'],
  
  // Assignment submission modal
  ['border-b border-slate-100 p-5', 'border-b border-token/50 p-5'],
  ['mt-3 text-2xl font-black tracking-tight text-slate-950', 'mt-3 text-2xl font-black tracking-tight text-main'],
  ['mt-2 text-sm font-bold text-slate-500', 'mt-2 text-sm font-bold text-subtle'],
  ['rounded-xl p-2 text-slate-500 hover:bg-slate-100', 'rounded-xl p-2 text-subtle hover:bg-surface-alt'],
  ['text-sm font-black uppercase tracking-wide text-slate-500', 'text-sm font-black uppercase tracking-wide text-subtle'],
  ['mt-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-7 text-slate-700', 'mt-3 rounded-2xl bg-surface-alt p-4 text-sm font-semibold leading-7 text-main'],
  ['mb-3 text-xs font-black uppercase tracking-wide text-slate-500', 'mb-3 text-xs font-black uppercase tracking-wide text-subtle'],
  ['mt-4 block text-sm font-black text-slate-700', 'mt-4 block text-sm font-black text-main'],
  ['min-h-[100px] w-full rounded-2xl border border-slate-200 p-4', 'min-h-[100px] w-full rounded-2xl border border-token p-4'],
  ['focus:ring-sky-100', 'focus:ring-primary/10'],
  ['rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50', 'rounded-2xl border border-token px-4 py-3 text-sm font-black text-main hover:bg-surface-alt'],
  ['text-xs font-bold text-slate-500', 'text-xs font-bold text-subtle'],
  
  // File upload and attachments
  ['grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600', 'grid h-10 w-10 place-items-center rounded-xl bg-surface-alt text-muted'],
  ['truncate text-sm font-black text-slate-800', 'truncate text-sm font-black text-main'],
  ['rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600', 'rounded-lg p-2 text-subtle hover:bg-rose-50 hover:text-rose-600'],
  
  // Notifications and panels
  ['rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]', 'rounded-[28px] border border-token bg-surface p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]'],
  ['text-base font-black text-slate-950', 'text-base font-black text-main'],
  ['h-5 w-5 text-slate-400', 'h-5 w-5 text-subtle'],
  ['rounded-2xl border border-slate-200 bg-slate-50/80 p-3', 'rounded-2xl border border-token bg-surface-alt/80 p-3'],
  ['truncate text-sm font-black text-slate-800', 'truncate text-sm font-black text-main'],
  
  // Achievements and progress
  ['grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-400', 'grid h-10 w-10 place-items-center rounded-xl bg-surface text-subtle'],
  ['text-sm font-black text-slate-800', 'text-sm font-black text-main'],
  
  // Progress dashboard
  ['rounded-[28px] border border-slate-200 bg-white p-5', 'rounded-[28px] border border-token bg-surface p-5'],
  ['text-2xl font-black text-slate-950', 'text-2xl font-black text-main'],
  ['text-lg font-black text-slate-950', 'text-lg font-black text-main'],
  ['rounded-2xl bg-slate-50 p-3', 'rounded-2xl bg-surface-alt p-3'],
  ['border border-slate-100 bg-slate-50 opacity-70', 'border border-token/40 bg-surface-alt opacity-70'],
  
  // Quiz results
  ['text-sm font-black uppercase tracking-wide text-slate-500', 'text-sm font-black uppercase tracking-wide text-subtle'],
  ['mt-1 text-3xl font-black tracking-tight text-slate-950', 'mt-1 text-3xl font-black tracking-tight text-main'],
  ['mt-1 text-5xl font-black text-slate-950', 'mt-1 text-5xl font-black text-main'],
  ['rounded-2xl border border-slate-200 bg-slate-50 p-5', 'rounded-2xl border border-token bg-surface-alt p-5'],
  ['mt-1 line-clamp-2 text-sm font-semibold text-slate-600', 'mt-1 line-clamp-2 text-sm font-semibold text-muted'],
];

replacements.forEach(([oldText, newText]) => {
  const regex = new RegExp(oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  content = content.replace(regex, newText);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ All theme colors updated!');
