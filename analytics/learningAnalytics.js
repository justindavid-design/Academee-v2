function percentage(numerator, denominator) {
  if (!denominator) return 0
  return Math.round((numerator / denominator) * 100)
}

function buildInstitutionAnalytics({ courses = [], assignments = [], quizzes = [], submissions = [], accessibilityEvents = [] }) {
  const submitted = submissions.filter((item) => item.submitted_at)
  const graded = submissions.filter((item) => item.score != null)
  const averageScore = graded.length
    ? Math.round(graded.reduce((sum, item) => sum + Number(item.score || 0), 0) / graded.length)
    : 0

  const courseMetrics = courses.map((course) => {
    const courseAssignments = assignments.filter((item) => String(item.course_id) === String(course.id))
    const courseSubmissions = submissions.filter((item) => courseAssignments.some((assignment) => String(assignment.id) === String(item.assignment_id)))
    const courseSubmitted = courseSubmissions.filter((item) => item.submitted_at)
    const courseGraded = courseSubmissions.filter((item) => item.score != null)
    return {
      courseId: course.id,
      title: course.title,
      assignmentCount: courseAssignments.length,
      submissionRate: percentage(courseSubmitted.length, courseAssignments.length),
      gradedRate: percentage(courseGraded.length, courseSubmitted.length),
      averageScore: courseGraded.length
        ? Math.round(courseGraded.reduce((sum, item) => sum + Number(item.score || 0), 0) / courseGraded.length)
        : 0,
    }
  })

  return {
    generatedAt: new Date().toISOString(),
    institution: {
      courseCount: courses.length,
      assignmentCount: assignments.length,
      quizCount: quizzes.length,
      submissionRate: percentage(submitted.length, assignments.length),
      gradedRate: percentage(graded.length, submitted.length),
      averageScore,
      accessibilityUsage: accessibilityEvents.length,
    },
    courseMetrics,
    insights: generateInsights(courseMetrics, averageScore),
  }
}

function generateInsights(courseMetrics, averageScore) {
  const insights = []
  const lowSubmission = courseMetrics.filter((course) => course.submissionRate > 0 && course.submissionRate < 60)
  if (lowSubmission.length) insights.push({ type: 'engagement', severity: 'medium', message: `${lowSubmission.length} course(s) show low submission rates and may need deadline reminders.` })
  const lowMastery = courseMetrics.filter((course) => course.averageScore > 0 && course.averageScore < 70)
  if (lowMastery.length) insights.push({ type: 'mastery', severity: 'high', message: `${lowMastery.length} course(s) are below the 70% mastery threshold.` })
  if (averageScore >= 85) insights.push({ type: 'performance', severity: 'positive', message: 'Institution-wide graded performance is strong.' })
  return insights
}

module.exports = {
  buildInstitutionAnalytics,
}
