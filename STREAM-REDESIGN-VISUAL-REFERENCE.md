# 🎓 Stream Redesign - Visual Reference

## Card Layout Structure

### Announcement Card
```
┌─────────────────────────────────────┐
│ ║ [Avatar] John Doe                 │ ⋮
│   Posted an announcement           │
│   2 hours ago                       │
├─────────────────────────────────────┤
│                                     │
│ Important Class Updates             │
│ Short description or preview...     │
│                                     │
├─────────────────────────────────────┤
│ [View Details]                      │
└─────────────────────────────────────┘
```

### Assignment Card
```
┌─────────────────────────────────────┐
│ ║ [Avatar] John Doe                 │ ⋮
│   Posted an assignment             │
│   1 day ago                         │
├─────────────────────────────────────┤
│                                     │
│ Reflection Activity                 │
│ Describe your learning journey...   │
│                                     │
│ [Submitted] ← Status badge          │
├─────────────────────────────────────┤
│ 📅 Due in 2 days  •  50 points      │
├─────────────────────────────────────┤
│ [View Submission]                   │
└─────────────────────────────────────┘
```

### Quiz Card
```
┌─────────────────────────────────────┐
│ ║ [Avatar] John Doe                 │ ⋮
│   Posted a quiz                    │
│   3 days ago                        │
├─────────────────────────────────────┤
│                                     │
│ Unit 3 Assessment                   │
│ Test your knowledge on the concepts │
│                                     │
│ [Completed] ← Status badge          │
│ Your Score: 92%                     │
├─────────────────────────────────────┤
│ 📋 10 questions  •  Due in 1 week   │
├─────────────────────────────────────┤
│ [View Results]                      │
└─────────────────────────────────────┘
```

### Module Card
```
┌─────────────────────────────────────┐
│ ║ [Avatar] John Doe                 │ ⋮
│   Created a module                 │
│   1 week ago                        │
├─────────────────────────────────────┤
│                                     │
│ Chapter 2: Advanced Concepts        │
│ In-depth exploration of...          │
│                                     │
├─────────────────────────────────────┤
│ [Open Module]                       │
└─────────────────────────────────────┘
```

## Full Stream Layout

```
╔═════════════════════════════════════════════════════════════════╗
║                    Course Name                                  ║
║            Course Description (Optional)                        ║
╚═════════════════════════════════════════════════════════════════╝

╔══════════════════════════════╦═══════════════════════════════╗
║   Main Stream (2 columns)    ║ Sidebar (1 column)            ║
║                              ║                               ║
║ ┌─────────────────────────┐  ║ ╔═══════════════════════════╗ ║
║ │ Announcement Card       │  ║ ║ 📚 Active Learning      ║ ║
║ └─────────────────────────┘  ║ ╚═══════════════════════════╝ ║
║                              ║                               ║
║ ┌─────────────────────────┐  ║ ┌─────────────────────────┐ ║
║ │ Assignment Card         │  ║ │ 📖 Continue Learning    │ ║
║ │ [Status: Pending]       │  ║ │ Module Name [60% ████░] │ ║
║ └─────────────────────────┘  ║ └─────────────────────────┘ ║
║                              ║                               ║
║ ┌─────────────────────────┐  ║ ┌─────────────────────────┐ ║
║ │ Quiz Card               │  ║ │ ✓ Pending Assignments   │ ║
║ │ [Status: Completed]     │  ║ │ Assignment 1 [2 days]   │ ║
║ │ Score: 88%              │  ║ │ Assignment 2 [5 days]   │ ║
║ └─────────────────────────┘  ║ └─────────────────────────┘ ║
║                              ║                               ║
║ ┌─────────────────────────┐  ║ ┌─────────────────────────┐ ║
║ │ Module Card             │  ║ │ ⚡ Upcoming Quizzes     │ ║
║ └─────────────────────────┘  ║ │ Quiz 1 [4 questions]    │ ║
║                              ║ │ Quiz 2 [7 questions]    │ ║
║                              ║ └─────────────────────────┘ ║
║                              ║                               ║
╚══════════════════════════════╩═══════════════════════════════╝
```

## Color-Coded Variants

### Announcement Card (Amber Theme)
```
┌─────────────────────────────────────┐
│ ╔ (4px amber left border)            │
│ ║ [Avatar] Teacher Name              │
│   Posted an announcement            │
│   2 hours ago                        │
├─────────────────────────────────────┤
│ (Hover: bg-amber-50/50 visible)     │
│ Content here...                      │
├─────────────────────────────────────┤
│ (Hover: shadow-md elevation)         │
│ [Action Button]                      │
└─────────────────────────────────────┘
```

### Assignment Card (Blue Theme)
```
┌─────────────────────────────────────┐
│ ╔ (4px blue left border)             │
│ ║ [Avatar] Teacher Name              │
│   Posted an assignment              │
│   1 day ago                          │
├─────────────────────────────────────┤
│ (bg-blue-50 on hover)               │
│ Content here...                      │
│ [Submitted] ← Green badge            │
├─────────────────────────────────────┤
│ [Submit Work] or [View Submission]  │
└─────────────────────────────────────┘
```

### Quiz Card (Purple Theme)
```
┌─────────────────────────────────────┐
│ ╔ (4px purple left border)           │
│ ║ [Avatar] Teacher Name              │
│   Posted a quiz                     │
│   3 days ago                         │
├─────────────────────────────────────┤
│ (bg-purple-50 on hover)             │
│ Content here...                      │
│ [Completed] ← Green badge            │
│ Score: 92%                           │
├─────────────────────────────────────┤
│ [View Results]                       │
└─────────────────────────────────────┘
```

### Reviewer Card (Emerald Theme)
```
┌─────────────────────────────────────┐
│ ╔ (4px emerald left border)          │
│ ║ [Avatar] Teacher Name              │
│   Started a reviewer                │
│   5 days ago                         │
├─────────────────────────────────────┤
│ (bg-emerald-50 on hover)            │
│ Content here...                      │
├─────────────────────────────────────┤
│ [Open Reviewer]                      │
└─────────────────────────────────────┘
```

## Status Badge Examples

```
[Submitted]     ← Green, filled background, checkmark
[Pending]       ← Blue, filled background
[Overdue]       ← Red, filled background, alert icon
[Completed]     ← Green, filled background
[In Progress]   ← Purple, filled background
```

## Active Learning Card Examples

### Continue Learning
```
┌──────────────────────────────┐
│ 📖 | Module Name            │ →
│    | Continue learning       │
│    | Progress: 60% ████░░   │
└──────────────────────────────┘
```

### Pending Assignment
```
┌──────────────────────────────┐
│ ✓ | Assignment Name         │ →
│   | 50 points               │
│   | Due in 2 days [pending] │
└──────────────────────────────┘
```

### Upcoming Quiz
```
┌──────────────────────────────┐
│ ⚡ | Quiz Name              │ →
│    | 10 questions           │
│    | Due in 5 days [1 left] │
└──────────────────────────────┘
```

## Responsive Breakpoints

### Desktop (1024px+)
```
┌─────────────────┬─────────┐
│   Main Stream   │ Sidebar │
│   (2 columns)   │  (1)    │
│                 │         │
│ [Card 1]        │ [Info]  │
│ [Card 2]        │ [Info]  │
│ [Card 3]        │ [Info]  │
└─────────────────┴─────────┘
```

### Tablet (768px-1023px)
```
┌──────────────────────────┐
│     Main Stream          │
│     (Single column)      │
│                          │
│ [Card 1]                 │
│ [Card 2]                 │
│ [Sidebar - Below stream] │
│ [Info Widget]            │
└──────────────────────────┘
```

### Mobile (<768px)
```
┌──────────┐
│  Stream  │
│ (Mobile) │
│          │
│[Card 1]  │
│[Card 2]  │
│[Card 3]  │
│[Widget]  │
└──────────┘
```

## Hover States

### Normal State
```
┌─────────────────────────────────────┐
│ Border: 1px solid slate-200         │
│ Shadow: shadow-sm (subtle)          │
│ Background: white                   │
│ Cursor: pointer                     │
└─────────────────────────────────────┘
```

### Hover State
```
┌─────────────────────────────────────┐
│ Border: 1px solid slate-300         │
│ Shadow: shadow-md (elevated)        │
│ Background: white                   │
│ Transform: scale(1.02)              │
│ Cursor: pointer (emphasized)        │
└─────────────────────────────────────┘
```

### Focus State (Keyboard)
```
┌─────────────────────────────────────┐
│ ╔═ Focus outline: 2px blue           │
│ ║ Card content inside                │
│ ║                                    │
└─────────────────────────────────────┘
```

### Active/Pressed State
```
┌─────────────────────────────────────┐
│ Border: 1px solid slate-300         │
│ Shadow: shadow-sm                   │
│ Background: white                   │
│ Transform: scale(0.98)              │
│ Transition: 100ms ease-out          │
└─────────────────────────────────────┘
```

## Button Styles in Cards

### Primary Button
```
[Blue Filled Button]
Background: #3B82F6
Text: White
Hover: Darker blue + shadow-md
Padding: px-4 py-2
Rounded: rounded-lg
```

### Secondary Button
```
[Bordered Button]
Background: White
Border: 1px solid #E2E8F0
Text: #475569
Hover: bg-slate-50
Padding: px-4 py-2
Rounded: rounded-lg
```

### Danger Button
```
[Red Bordered Button]
Background: White
Border: 1px solid #FEE2E2
Text: #DC2626
Hover: bg-red-50
Padding: px-4 py-2
Rounded: rounded-lg
```

## Animation Sequences

### Card Entry Animation
```
Timeline:
0ms:   opacity: 0, transform: translateY(20px)
150ms: opacity: 0.5, transform: translateY(10px)
300ms: opacity: 1, transform: translateY(0)
```

### Hover Animation
```
Duration: 200ms
Easing: ease-out
Transform: scale 1.0 → 1.02
Shadow: shadow-sm → shadow-md
Border: slight color shift
```

### Click Animation
```
Duration: 100ms
Easing: ease-out
Transform: scale 1.02 → 0.98
Shadow: maintained
After release: return to hover state
```

## Typography Hierarchy

```
Card Title:
  Font size: 18px (text-lg)
  Font weight: 700 (font-bold)
  Color: #0F172A (slate-900)
  
Teacher Name:
  Font size: 14px (text-sm)
  Font weight: 600 (font-semibold)
  Color: #0F172A (slate-900)
  
Action Label:
  Font size: 12px (text-xs)
  Font weight: 500 (font-medium)
  Color: #475569 (slate-600)
  
Description:
  Font size: 14px (text-sm)
  Font weight: 400 (normal)
  Color: #475569 (slate-600)
  Line height: 1.5
  
Metadata:
  Font size: 12px (text-xs)
  Font weight: 400 (normal)
  Color: #64748B (slate-500)
```

## Spacing Guidelines

```
Between Cards:          1rem (space-y-4)
Card Padding:           1.5rem (px-6 py-4)
Header Padding:         1.25rem (pt-5)
Header Spacing:         0.75rem (pb-3 border-b-0)
Section Spacing:        1rem (space-y-4)
Content Spacing:        1rem (mb-4)
Button Spacing:         0.75rem (gap-3)
```

## Icon Usage

```
Calendar:      Due dates
Clock:         Time-related
Clipboard:     Assignments, submissions
PenTool:       Quizzes
BookOpen:      Modules, lessons
Users:         Collaborators
AlertCircle:   Urgent/Overdue
CheckCircle:   Completed
ArrowRight:    Navigation/Actions
MoreVertical:  Menu options
```

---

This visual reference provides a complete design system for understanding and implementing the classroom-inspired stream redesign.
