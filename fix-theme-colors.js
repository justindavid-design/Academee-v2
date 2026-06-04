#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/student/StudentCourseExperience.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// All color replacements (hard-coded → theme tokens)
const replacements = [
  // Text colors
  ['text-slate-950', 'text-main'],
  ['text-slate-800', 'text-main'],
  ['text-slate-700', 'text-main'],
  ['text-slate-600', 'text-muted'],
  ['text-slate-500', 'text-subtle'],
  ['text-slate-400', 'text-subtle'],
  
  // Background colors  
  ['bg-white/90', 'bg-surface/90'],
  ['bg-white', 'bg-surface'],
  ['bg-slate-50', 'bg-surface-alt'],
  ['bg-slate-100', 'bg-surface-alt'],
  
  // Border colors
  ['border-slate-300', 'border-token'],
  ['border-slate-200', 'border-token'],
];

replacements.forEach(([oldText, newText]) => {
  const regex = new RegExp(`\\b${oldText}\\b`, 'g');
  content = content.replace(regex, newText);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Theme colors updated successfully!');
