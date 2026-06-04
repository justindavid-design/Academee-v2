import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import About from './components/About'
import Features from './components/Features'
import Footer from './components/Footer'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Login from './components/Login'
import PasswordReset from './components/PasswordReset'
import RecoverEmail from './components/RecoverEmail'
import RecoverReset from './components/RecoverReset'
import RecoverVerify from './components/RecoverVerify'
import SignUp from './components/SignUp'
import Testimonials from './components/Testimonials'
import Archived from './components/dashboard/Archived'
import Calendar from './components/dashboard/Calendar'
import CourseDetails from './components/dashboard/CourseDetails'
import Courses from './components/dashboard/Courses'
import Dashboard from './components/dashboard/dashboard'
import EnrollPage from './components/dashboard/EnrollPage'
import Settings from './components/dashboard/Settings'
import Tasks from './components/dashboard/Tasks'
import Notifications from './components/Notifications'
import QuizMaker from './components/dashboard/QuizMaker'
import QuizBuilderPage from './components/quiz/QuizBuilderPage'
import QuizTypeSelector from './components/quiz/QuizTypeSelector'
import QuestionEditor from './components/quiz/QuestionEditor'
import StudentQuizPage from './components/student-quiz/StudentQuizPage'
import ReviewerTypeSelector from './components/reviewer/ReviewerTypeSelector'
import ReviewerBuilderPage from './components/reviewer/ReviewerBuilderPage'
import { ReviewerStudio } from './components/reviewer/ReviewerBuilderPage'
import RequireAuth from './lib/RequireAuth'
import { CourseContextProvider } from './lib/CourseNameContext'
import { NotificationProvider } from './lib/NotificationContext'
import { ToastProvider } from './lib/ToastProvider'

function Landing() {
  return (
    <div className="font-sans text-main">
      <Hero />
      <main className="relative z-10 bg-transparent">
        <Features />
        <HowItWorks />
        <About />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-6">
      <div className="theme-card max-w-md rounded-2xl p-8 text-center shadow-card">
        <p className="text-sm font-semibold tracking-wide text-muted">404</p>
        <h1 className="text-2xl font-bold text-main mt-2">Page not found</h1>
        <p className="text-muted mt-2">The page you requested does not exist.</p>
        <a href="/" className="mt-6 inline-block rounded-md bg-primary-token px-4 py-2 font-semibold text-white transition hover:bg-primary-hover">
          Go to home
        </a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <CourseContextProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/recover" element={<RecoverEmail />} />
              <Route path="/recover/verify" element={<RecoverVerify />} />
              <Route path="/recover/reset" element={<RecoverReset />} />
              <Route path="/reset" element={<PasswordReset />} />
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/courses" element={<RequireAuth><Dashboard><Courses /></Dashboard></RequireAuth>} />
              <Route path="/courses/enroll" element={<RequireAuth><Dashboard><EnrollPage /></Dashboard></RequireAuth>} />
              <Route path="/courses/:id" element={<RequireAuth><Dashboard><CourseDetails /></Dashboard></RequireAuth>} />
              <Route path="/dashboard/course/:courseId/quiz/types" element={<RequireAuth><QuizTypeSelector /></RequireAuth>} />
              <Route path="/dashboard/course/:courseId/reviewer/types" element={<RequireAuth><ReviewerTypeSelector /></RequireAuth>} />
              <Route path="/dashboard/course/:courseId/quiz/create" element={<RequireAuth><QuizBuilderPage /></RequireAuth>} />
              <Route path="/dashboard/course/:courseId/quiz/:quizId/edit" element={<RequireAuth><QuizBuilderPage /></RequireAuth>} />
              <Route path="/courses/:courseId/quiz/:quizId/take" element={<RequireAuth><StudentQuizPage /></RequireAuth>} />
              <Route path="/courses/:courseId/quizzes/:quizId/questions/:questionId/edit" element={<RequireAuth><QuestionEditor /></RequireAuth>} />
              <Route path="/dashboard/course/:courseId/reviewer/create" element={<RequireAuth><Dashboard><ReviewerBuilderPage /></Dashboard></RequireAuth>} />
              <Route path="/dashboard/course/:courseId/reviewer/:reviewerId/edit" element={<RequireAuth><Dashboard><ReviewerBuilderPage /></Dashboard></RequireAuth>} />
              <Route path="/calendar" element={<RequireAuth><Dashboard><Calendar /></Dashboard></RequireAuth>} />
              <Route path="/tasks" element={<RequireAuth><Dashboard><Tasks /></Dashboard></RequireAuth>} />
              <Route path="/reviewers" element={<RequireAuth><Dashboard><ReviewerStudio /></Dashboard></RequireAuth>} />
              <Route path="/quiz-maker" element={<RequireAuth><Dashboard><QuizMaker /></Dashboard></RequireAuth>} />
              <Route path="/archived" element={<RequireAuth><Dashboard><Archived /></Dashboard></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><Dashboard><Settings /></Dashboard></RequireAuth>} />
              <Route path="/notifications" element={<RequireAuth><Dashboard><Notifications /></Dashboard></RequireAuth>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </CourseContextProvider>
      </NotificationProvider>
    </ToastProvider>
  )
}
