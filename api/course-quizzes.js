const {
  computeSubmissionStatus,
  createCourseNotifications,
  ensureCourseAccess,
  fetchProfilesByIds,
  getQuery,
  getSupabase,
  requireUserId,
  respondWithError,
} = require('./_lms')

function normalizeQuizQuestions(value) {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => ({
        id: item.id || `question-${index + 1}`,
        question: String(item.question || item.text || '').trim(),
        text: String(item.text || item.question || '').trim(),
        choices: Array.isArray(item.choices)
          ? item.choices.map((choice) => String(choice?.text || choice || '').trim())
          : Array.isArray(item.options)
            ? item.options.map((opt) => String(opt || '').trim())
            : [],
        options: Array.isArray(item.options)
          ? item.options.map((opt) => String(opt || '').trim())
          : Array.isArray(item.choices)
            ? item.choices.map((opt) => String(opt?.text || opt || '').trim())
            : [],
        correct: Number.isInteger(item.correct)
          ? item.correct
          : Array.isArray(item.choices)
            ? item.choices.findIndex((choice) => Boolean(choice && typeof choice === 'object' && choice.is_correct))
            : 0,
        correctAnswer: String(item.correctAnswer || item.answer || item.options?.[item.correct] || '').trim(),
        difficulty: item.difficulty || 'Medium',
        conceptTags: Array.isArray(item.conceptTags) ? item.conceptTags.map((tag) => String(tag || '').trim()).filter(Boolean) : [],
        explanation: String(item.explanation || '').trim(),
        trivia: String(item.trivia || '').trim(),
        learningTip: String(item.learningTip || '').trim(),
      }))
      .filter((item) => item.text)
  }

  return String(value || '')
    .split('\n')
    .map((line, index) => ({
      id: `question-${index + 1}`,
      question: line.trim(),
      text: line.trim(),
      choices: [],
      options: [],
      correct: 0,
      correctAnswer: '',
      difficulty: 'Medium',
      conceptTags: [],
      explanation: '',
      trivia: '',
      learningTip: '',
    }))
    .filter((item) => item.text)
}

function normalizeBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback
  return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true'
}

function getQuizMetaFromBody(body = {}, existingMeta = {}) {
  const previous = existingMeta || {}
  const previousSettings = previous.settings || {}
  const suppliedQuestions = Array.isArray(body.questions) ? normalizeQuizQuestions(body.questions) : null
  const questions = suppliedQuestions || previous.questions || []

  const timeLimit = Number(body.time_limit ?? previous.time_limit ?? previousSettings.time_limit ?? 30) || 30
  const attemptsAllowed = Number(body.attempts_allowed ?? previous.attempts_allowed ?? previousSettings.attempts_allowed ?? 1) || 1
  const passingScore = Number(body.passing_score ?? previous.passing_score ?? previousSettings.passing_score ?? 70) || 70
  const mode = String(body.mode ?? previous.mode ?? previousSettings.mode ?? 'practice').toLowerCase()

  return {
    questions,
    time_limit: timeLimit,
    attempts_allowed: attemptsAllowed,
    passing_score: passingScore,
    module_id: body.module_id ?? previous.module_id ?? previousSettings.module_id ?? null,
    shuffleQuestions: normalizeBoolean(body.shuffleQuestions, previous.shuffleQuestions ?? previousSettings.shuffleQuestions ?? false),
    shuffleAnswers: normalizeBoolean(body.shuffleAnswers, previous.shuffleAnswers ?? previousSettings.shuffleAnswers ?? false),
    showCorrectAnswers: body.showCorrectAnswers !== undefined
      ? normalizeBoolean(body.showCorrectAnswers, true)
      : previous.showCorrectAnswers !== undefined
        ? Boolean(previous.showCorrectAnswers)
        : previousSettings.showCorrectAnswers !== undefined
          ? Boolean(previousSettings.showCorrectAnswers)
          : true,
    autoGrading: body.autoGrading !== undefined
      ? normalizeBoolean(body.autoGrading, true)
      : previous.autoGrading !== undefined
        ? Boolean(previous.autoGrading)
        : previousSettings.autoGrading !== undefined
          ? Boolean(previousSettings.autoGrading)
          : true,
    mode,
    instructions: body.instructions ?? previous.instructions ?? previousSettings.instructions ?? null,
    settings: {
      time_limit: timeLimit,
      attempts_allowed: attemptsAllowed,
      passing_score: passingScore,
      module_id: body.module_id ?? previous.module_id ?? previousSettings.module_id ?? null,
      shuffleQuestions: normalizeBoolean(body.shuffleQuestions, previous.shuffleQuestions ?? previousSettings.shuffleQuestions ?? false),
      shuffleAnswers: normalizeBoolean(body.shuffleAnswers, previous.shuffleAnswers ?? previousSettings.shuffleAnswers ?? false),
      showCorrectAnswers: body.showCorrectAnswers !== undefined
        ? normalizeBoolean(body.showCorrectAnswers, true)
        : previous.showCorrectAnswers !== undefined
          ? Boolean(previous.showCorrectAnswers)
          : previousSettings.showCorrectAnswers !== undefined
            ? Boolean(previousSettings.showCorrectAnswers)
            : true,
      autoGrading: body.autoGrading !== undefined
        ? normalizeBoolean(body.autoGrading, true)
        : previous.autoGrading !== undefined
          ? Boolean(previous.autoGrading)
          : previousSettings.autoGrading !== undefined
            ? Boolean(previousSettings.autoGrading)
            : true,
      mode,
      instructions: body.instructions ?? previous.instructions ?? previousSettings.instructions ?? null,
    },
  }
}

function buildQuizResponse(quiz, assignment = null) {
  if (!quiz) return null

  const meta = quiz.meta || {}
  const settings = meta.settings || {}
  const questions = Array.isArray(meta.questions) ? meta.questions : []
  const dueAt = assignment?.due_at ?? quiz.due_at ?? null
  const status = assignment?.status ?? (quiz.published ? 'published' : 'draft')
  const moduleId = assignment?.module_id ?? meta.module_id ?? settings.module_id ?? null
  const instructions = assignment?.instructions ?? meta.instructions ?? settings.instructions ?? quiz.description ?? null
  const timeLimit = Number(meta.time_limit ?? settings.time_limit ?? quiz.time_limit ?? 30) || 30
  const attemptsAllowed = Number(meta.attempts_allowed ?? settings.attempts_allowed ?? quiz.attempts_allowed ?? 1) || 1
  const passingScore = Number(meta.passing_score ?? settings.passing_score ?? quiz.passing_score ?? 70) || 70
  const mode = String(meta.mode || settings.mode || quiz.mode || 'practice').toLowerCase()

  return {
    ...quiz,
    questions,
    meta: {
      ...meta,
      questions,
      time_limit: timeLimit,
      attempts_allowed: attemptsAllowed,
      passing_score: passingScore,
      module_id: moduleId,
      shuffleQuestions: normalizeBoolean(meta.shuffleQuestions ?? settings.shuffleQuestions ?? quiz.shuffleQuestions),
      shuffleAnswers: normalizeBoolean(meta.shuffleAnswers ?? settings.shuffleAnswers ?? quiz.shuffleAnswers),
      showCorrectAnswers: meta.showCorrectAnswers !== undefined
        ? Boolean(meta.showCorrectAnswers)
        : settings.showCorrectAnswers !== undefined
          ? Boolean(settings.showCorrectAnswers)
          : quiz.showCorrectAnswers !== false,
      autoGrading: meta.autoGrading !== undefined
        ? Boolean(meta.autoGrading)
        : settings.autoGrading !== undefined
          ? Boolean(settings.autoGrading)
          : quiz.autoGrading !== false,
      mode,
      instructions,
      settings: {
        time_limit: timeLimit,
        attempts_allowed: attemptsAllowed,
        passing_score: passingScore,
        module_id: moduleId,
        shuffleQuestions: normalizeBoolean(meta.shuffleQuestions ?? settings.shuffleQuestions ?? quiz.shuffleQuestions),
        shuffleAnswers: normalizeBoolean(meta.shuffleAnswers ?? settings.shuffleAnswers ?? quiz.shuffleAnswers),
        showCorrectAnswers: meta.showCorrectAnswers !== undefined
          ? Boolean(meta.showCorrectAnswers)
          : settings.showCorrectAnswers !== undefined
            ? Boolean(settings.showCorrectAnswers)
            : quiz.showCorrectAnswers !== false,
        autoGrading: meta.autoGrading !== undefined
          ? Boolean(meta.autoGrading)
          : settings.autoGrading !== undefined
            ? Boolean(settings.autoGrading)
            : quiz.autoGrading !== false,
        mode,
        instructions,
      },
    },
    assignment_id: assignment?.id ?? quiz.assignment_id ?? null,
    module_id: moduleId,
    instructions,
    due_at: dueAt,
    status,
    question_count: questions.length,
    time_limit: timeLimit,
    attempts_allowed: attemptsAllowed,
    passing_score: passingScore,
    shuffleQuestions: normalizeBoolean(meta.shuffleQuestions ?? settings.shuffleQuestions ?? quiz.shuffleQuestions),
    shuffleAnswers: normalizeBoolean(meta.shuffleAnswers ?? settings.shuffleAnswers ?? quiz.shuffleAnswers),
    showCorrectAnswers: meta.showCorrectAnswers !== false && settings.showCorrectAnswers !== false && quiz.showCorrectAnswers !== false,
    autoGrading: meta.autoGrading !== false && settings.autoGrading !== false && quiz.autoGrading !== false,
    mode,
  }
}

async function resolveQuizContext(db, { courseId = null, quizId = null } = {}) {
  if (!quizId) return { courseId, quiz: null, assignment: null }

  let quizQuery = db.from('quizzes').select('*').eq('id', quizId)
  if (courseId) quizQuery = quizQuery.eq('course_id', courseId)
  const { data: quiz, error: quizError } = await quizQuery.maybeSingle()
  if (quizError) throw quizError
  if (!quiz) return { courseId, quiz: null, assignment: null }

  const resolvedCourseId = courseId || quiz.course_id || null
  const { data: assignment, error: assignmentError } = await db
    .from('assignments')
    .select('*')
    .eq('quiz_id', quiz.id)
    .eq('course_id', resolvedCourseId || quiz.course_id)
    .eq('kind', 'quiz')
    .maybeSingle()

  if (assignmentError) throw assignmentError
  return { courseId: resolvedCourseId, quiz, assignment }
}

async function listQuizAttempts(db, { assignment, quiz, userId = null, isTeacher = false }) {
  if (!assignment && quiz) {
    const { data, error } = await db
      .from('assignments')
      .select('*')
      .eq('quiz_id', quiz.id)
      .eq('course_id', quiz.course_id)
      .eq('kind', 'quiz')
      .maybeSingle()
    if (error) throw error
    assignment = data || null
  }

  if (!assignment) return []

  const query = db
    .from('submissions')
    .select('*')
    .eq('assignment_id', assignment.id)

  if (!isTeacher && userId) {
    query.eq('student_id', userId)
  }

  const { data: submissions, error } = await query.order('submitted_at', { ascending: false, nullsFirst: false })
  if (error) throw error

  const rows = submissions || []
  const attemptsByStudent = new Map()
  rows
    .slice()
    .sort((a, b) => new Date(a.submitted_at || a.updated_at || a.created_at || 0) - new Date(b.submitted_at || b.updated_at || b.created_at || 0))
    .forEach((submission) => {
      const studentId = submission.student_id
      const current = attemptsByStudent.get(studentId) || 0
      attemptsByStudent.set(studentId, current + 1)
      submission.user_id = submission.student_id
      submission.attempt_number = current + 1
    })

  const profiles = await fetchProfilesByIds(rows.map((row) => row.student_id))
  rows.forEach((submission) => {
    submission.user_name = profiles[submission.student_id]?.display_name || null
    submission.student_name = profiles[submission.student_id]?.display_name || null
  })

  return rows
}

function computeQuizScoreFromAnswers(quiz, submittedAnswers) {
  const questions = normalizeQuizQuestions(quiz?.meta?.questions)
  const answers = Array.isArray(submittedAnswers) ? submittedAnswers : []
  if (!questions.length) {
    return { score: 0, total: 0, percentage: 0 }
  }

  const byQuestionId = new Map(
    answers
      .map((item) => [
        String(item?.questionId ?? item?.question_id ?? ''),
        Number(item?.chosen ?? item?.selectedAnswerIndex ?? item?.selected_answer_index),
      ])
      .filter(([id]) => id)
  )

  let score = 0
  questions.forEach((question, index) => {
    const picked = byQuestionId.get(String(question.id))
    const fallback = Number(answers[index]?.chosen ?? answers[index]?.selectedAnswerIndex ?? answers[index]?.selected_answer_index)
    const chosen = Number.isFinite(picked) ? picked : fallback
    if (Number.isFinite(chosen) && chosen === Number(question.correct)) {
      score += 1
    }
  })

  return {
    score,
    total: questions.length,
    percentage: questions.length ? Math.round((score / questions.length) * 100) : 0,
  }
}

module.exports = async (req, res) => {
  try {
    const userId = requireUserId(req)
    const courseId = req.params?.id || getQuery(req, 'courseId')
    const quizId = req.params?.quizId || getQuery(req, 'quizId')
    const action = req.params?.action || getQuery(req, 'action')

    if (!courseId) return res.status(400).json({ error: 'course id required' })

    // GET single quiz
    if (req.method === 'GET' && quizId) {
      const db = getSupabase()
      const context = await resolveQuizContext(db, { courseId, quizId })
      if (!context.quiz) return res.status(404).json({ error: 'quiz not found' })

      const access = await ensureCourseAccess(context.courseId, userId)
      if (!access.isTeacher && context.assignment?.status !== 'published') {
        return res.status(404).json({ error: 'quiz not found' })
      }

      return res.status(200).json(buildQuizResponse(context.quiz, context.assignment))
    }

    // POST submit quiz attempt by quiz id
    if (req.method === 'POST' && quizId && action === 'submit') {
      const db = getSupabase()
      const context = await resolveQuizContext(db, { courseId, quizId })
      if (!context.quiz) return res.status(404).json({ error: 'quiz not found' })

      const access = await ensureCourseAccess(context.courseId, userId)
      if (access.isTeacher) {
        return res.status(403).json({ error: 'teachers cannot submit student work' })
      }

      const quiz = context.quiz
      const assignment = context.assignment
      if (!assignment) return res.status(404).json({ error: 'assignment not found for quiz' })

      if (assignment.status !== 'published') {
        return res.status(403).json({ error: 'quiz is not published' })
      }

      const body = req.body || {}
      const scored = computeQuizScoreFromAnswers(quiz, body.answers)
      const submittedAt = new Date().toISOString()
      const content = JSON.stringify({
        answers: Array.isArray(body.answers) ? body.answers : [],
        analytics: body.analytics || null,
        masteryByConcept: body.masteryByConcept || null,
        adaptiveInsights: body.adaptiveInsights || null,
        mode: body.mode || null,
      })

      const { data: submission, error: submissionError } = await db
        .from('submissions')
        .upsert(
          [
            {
              assignment_id: assignment.id,
              student_id: userId,
              content,
              status: 'graded',
              submitted_at: submittedAt,
              graded_at: submittedAt,
              score: scored.score,
              feedback: `Auto-scored quiz: ${scored.score}/${scored.total}`,
              updated_at: submittedAt,
            },
          ],
          { onConflict: 'assignment_id,student_id' }
        )
        .select()
        .maybeSingle()

      if (submissionError) throw submissionError

      return res.status(201).json({
        ...submission,
        user_id: submission?.student_id || userId,
        score: scored.score,
        total: scored.total,
        percentage: scored.percentage,
      })
    }

    if (req.method === 'GET' && quizId && action === 'attempts') {
      const db = getSupabase()
      const context = await resolveQuizContext(db, { courseId, quizId })
      if (!context.quiz) return res.status(404).json({ error: 'quiz not found' })

      const access = await ensureCourseAccess(context.courseId, userId)
      const attempts = await listQuizAttempts(db, {
        assignment: context.assignment,
        quiz: context.quiz,
        userId,
        isTeacher: access.isTeacher,
      })

      return res.status(200).json(
        attempts.map((attempt) => ({
          ...attempt,
          user_id: attempt.student_id,
          student_id: attempt.student_id,
        }))
      )
    }

    if (req.method === 'POST' && quizId && action === 'duplicate') {
      const db = getSupabase()
      const context = await resolveQuizContext(db, { courseId, quizId })
      if (!context.quiz) return res.status(404).json({ error: 'quiz not found' })

      await ensureCourseAccess(context.courseId, userId, { teacherOnly: true })
      const nextTitle = `${context.quiz.title} (Copy)`
      const nextMeta = {
        ...(context.quiz.meta || {}),
        questions: Array.isArray(context.quiz.meta?.questions) ? context.quiz.meta.questions : [],
      }

      const { data: duplicatedQuiz, error: duplicateQuizError } = await db
        .from('quizzes')
        .insert([
          {
            course_id: context.courseId,
            title: nextTitle,
            description: context.quiz.description || null,
            published: false,
            meta: nextMeta,
          },
        ])
        .select()
        .maybeSingle()

      if (duplicateQuizError) throw duplicateQuizError

      const { data: duplicatedAssignment, error: duplicateAssignmentError } = await db
        .from('assignments')
        .insert([
          {
            course_id: context.courseId,
            module_id: context.assignment?.module_id || nextMeta.module_id || null,
            quiz_id: duplicatedQuiz.id,
            kind: 'quiz',
            title: nextTitle,
            instructions: context.assignment?.instructions || context.quiz.description || null,
            status: 'draft',
            due_at: null,
            created_by: userId,
          },
        ])
        .select()
        .maybeSingle()

      if (duplicateAssignmentError) throw duplicateAssignmentError

      return res.status(201).json(buildQuizResponse(duplicatedQuiz, duplicatedAssignment))
    }

    if (req.method === 'GET') {
      const access = await ensureCourseAccess(courseId, userId)
      const db = getSupabase()

      const { data: quizzes, error: quizError } = await db
        .from('quizzes')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })

      if (quizError) throw quizError

      const quizIds = (quizzes || []).map((item) => item.id)
      const { data: assignmentRows, error: assignmentError } = quizIds.length
        ? await db.from('assignments').select('*').in('quiz_id', quizIds).eq('kind', 'quiz')
        : { data: [], error: null }

      if (assignmentError) throw assignmentError

      const assignmentMap = new Map((assignmentRows || []).map((item) => [item.quiz_id, item]))
      const visibleAssignments = (assignmentRows || []).filter((item) =>
        access.isTeacher ? true : item.status === 'published'
      )

      const assignmentIds = visibleAssignments.map((item) => item.id)
      const { data: submissions, error: submissionsError } = assignmentIds.length
        ? access.isTeacher
          ? await db.from('submissions').select('id, assignment_id, student_id, status, submitted_at, graded_at, score').in('assignment_id', assignmentIds)
          : await db.from('submissions').select('*').in('assignment_id', assignmentIds).eq('student_id', userId)
        : { data: [], error: null }

      if (submissionsError) throw submissionsError

      const submissionsByAssignment = new Map()
      ;(submissions || []).forEach((submission) => {
        if (!submissionsByAssignment.has(submission.assignment_id)) {
          submissionsByAssignment.set(submission.assignment_id, [])
        }
        submissionsByAssignment.get(submission.assignment_id).push(submission)
      })

      const payload = (quizzes || [])
        .map((quiz) => {
          const assignment = assignmentMap.get(quiz.id)
          if (!assignment) return null
          if (!access.isTeacher && assignment.status !== 'published') return null

          const rows = submissionsByAssignment.get(assignment.id) || []
          const studentSubmission = access.isTeacher ? null : rows[0] || null

          const response = buildQuizResponse(quiz, assignment)

          return {
            ...response,
            pending_review_count: rows.filter((row) => row.submitted_at && !row.graded_at).length,
            submission_count: rows.length,
            submission: studentSubmission
              ? {
                  ...studentSubmission,
                  user_id: studentSubmission.student_id,
                  status: computeSubmissionStatus(assignment, studentSubmission),
                }
              : null,
            status_for_user: computeSubmissionStatus(assignment, studentSubmission),
          }
        })
        .filter(Boolean)

      return res.status(200).json(payload)
    }

    if (req.method === 'POST') {
      const access = await ensureCourseAccess(courseId, userId, { teacherOnly: true })
      const body = req.body || {}

      if (!body.title) return res.status(400).json({ error: 'title required' })

      const meta = getQuizMetaFromBody(body)
      const normalizedQuestions = meta.questions

      const quizPayload = {
        course_id: courseId,
        title: body.title,
        description: body.description || null,
        published: body.status === 'published',
        meta,
      }

      const { data: quiz, error: quizInsertError } = await getSupabase()
        .from('quizzes')
        .insert([quizPayload])
        .select()
        .maybeSingle()

      if (quizInsertError) throw quizInsertError

      const { data: assignment, error: assignmentError } = await getSupabase()
        .from('assignments')
        .insert([
          {
            course_id: courseId,
            module_id: body.module_id || null,
            quiz_id: quiz.id,
            kind: 'quiz',
            title: body.title,
            instructions: body.instructions || body.description || null,
            status: body.status || 'draft',
            due_at: body.due_at || null,
            created_by: userId,
          },
        ])
        .select()
        .maybeSingle()

      if (assignmentError) throw assignmentError

      if (assignment.status === 'published') {
        await createCourseNotifications(
          courseId,
          `Quiz posted in ${access.course.title}`,
          `${quiz.title}${assignment.due_at ? ` is due on ${new Date(assignment.due_at).toLocaleString()}` : ' is ready to take.'}`,
          'quiz'
        )
      }

      return res.status(201).json({
        ...buildQuizResponse(quiz, assignment),
        question_count: normalizedQuestions.length,
      })
    }

    if (req.method === 'PATCH') {
      const body = req.body || {}
      const targetQuizId = body.quiz_id || quizId
      if (!targetQuizId) return res.status(400).json({ error: 'quiz_id required' })

      const db = getSupabase()
      const context = await resolveQuizContext(db, { courseId, quizId: targetQuizId })
      if (!context.quiz) return res.status(404).json({ error: 'quiz not found' })

      await ensureCourseAccess(context.courseId, userId, { teacherOnly: true })

      const nextMeta = getQuizMetaFromBody(body, context.quiz.meta || {})
      const quizUpdates = {
        meta: nextMeta,
      }

      if (body.title !== undefined) quizUpdates.title = body.title
      if (body.description !== undefined) quizUpdates.description = body.description
      if (body.status !== undefined) quizUpdates.published = body.status === 'published'

      const { data: updatedQuiz, error: quizError } = await db
        .from('quizzes')
        .update(quizUpdates)
        .eq('id', context.quiz.id)
        .eq('course_id', context.courseId)
        .select()
        .maybeSingle()

      if (quizError) throw quizError
      if (!updatedQuiz) return res.status(404).json({ error: 'quiz not found' })

      const nextAssignmentId = body.assignment_id || context.assignment?.id || null
      let updatedAssignment = context.assignment

      if (nextAssignmentId) {
        const assignmentUpdates = {}
        if (body.title !== undefined) assignmentUpdates.title = body.title
        if (body.instructions !== undefined || body.description !== undefined) {
          assignmentUpdates.instructions = body.instructions || body.description || context.assignment?.instructions || null
        }
        if (body.status !== undefined) assignmentUpdates.status = body.status
        if (body.due_at !== undefined) assignmentUpdates.due_at = body.due_at
        if (body.module_id !== undefined) assignmentUpdates.module_id = body.module_id || null

        const { data: assignmentRow, error: assignmentError } = await db
          .from('assignments')
          .update(assignmentUpdates)
          .eq('id', nextAssignmentId)
          .eq('course_id', context.courseId)
          .eq('kind', 'quiz')
          .select()
          .maybeSingle()

        if (assignmentError) throw assignmentError
        if (!assignmentRow) return res.status(404).json({ error: 'assignment not found' })
        updatedAssignment = assignmentRow
      }

      return res.status(200).json(buildQuizResponse(updatedQuiz, updatedAssignment))
    }

    if (req.method === 'DELETE') {
      const body = req.body || {}
      const targetQuizId = body.quiz_id || quizId
      if (!targetQuizId) return res.status(400).json({ error: 'quiz_id required' })

      const db = getSupabase()
      const context = await resolveQuizContext(db, { courseId, quizId: targetQuizId })
      if (!context.quiz) return res.status(404).json({ error: 'quiz not found' })

      await ensureCourseAccess(context.courseId, userId, { teacherOnly: true })

      if (!context.assignment) {
        return res.status(404).json({ error: 'assignment not found' })
      }

      const { data: deletedAssignment, error: assignmentError } = await db
        .from('assignments')
        .delete()
        .eq('id', context.assignment.id)
        .eq('course_id', context.courseId)
        .eq('kind', 'quiz')
        .select()
        .maybeSingle()

      if (assignmentError) throw assignmentError
      if (!deletedAssignment) return res.status(404).json({ error: 'assignment not found' })

      const { data: deletedQuiz, error: quizError } = await db
        .from('quizzes')
        .delete()
        .eq('id', context.quiz.id)
        .eq('course_id', context.courseId)
        .select()
        .maybeSingle()

      if (quizError) throw quizError

      return res.status(200).json({ ok: true, deleted: { quiz: deletedQuiz, assignment: deletedAssignment } })
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
    return res.status(405).end('Method Not Allowed')
  } catch (err) {
    return respondWithError(res, err)
  }
}
