import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Loading from './components/Loading'
import RequireAuth from './lib/RequireAuth'
import { CourseContextProvider } from './lib/CourseNameContext'
import { NotificationProvider } from './lib/NotificationContext'
import { ToastProvider } from './lib/ToastProvider'

const Hero = lazy(() => import('./components/Hero'))
const Features = lazy(() => import('./components/Features'))
const HowItWorks = lazy(() => import('./components/HowItWorks'))
const About = lazy(() => import('./components/About'))
const Testimonials = lazy(() => import('./components/Testimonials'))
const Footer = lazy(() => import('./components/Footer'))
const Dashboard = lazy(() => import('./components/dashboard/dashboard'))
const Login = lazy(() => import('./components/Login'))
const SignUp = lazy(() => import('./components/SignUp'))
const PasswordReset = lazy(() => import('./components/PasswordReset'))
const RecoverEmail = lazy(() => import('./components/RecoverEmail'))
const RecoverVerify = lazy(() => import('./components/RecoverVerify'))
const RecoverReset = lazy(() => import('./components/RecoverReset'))
const Courses = lazy(() => import('./components/dashboard/Courses'))
const EnrollPage = lazy(() => import('./components/dashboard/EnrollPage'))
const Calendar = lazy(() => import('./components/dashboard/Calendar'))
const Tasks = lazy(() => import('./components/dashboard/Tasks'))
const Archived = lazy(() => import('./components/dashboard/Archived'))
const Notifications = lazy(() => import('./components/Notifications'))
const CourseDetails = lazy(() => import('./components/dashboard/CourseDetails'))
const Settings = lazy(() => import('./components/dashboard/Settings'))
const QuizMaker = lazy(() => import('./components/dashboard/QuizMaker'))
const QuizBuilderPage = lazy(() => import('./components/quiz/QuizBuilderPage'))
const QuizTypeSelector = lazy(() => import('./components/quiz/QuizTypeSelector'))
const QuestionEditor = lazy(() => import('./components/quiz/QuestionEditor'))
const StudentQuizPage = lazy(() => import('./components/student-quiz/StudentQuizPage'))
const ReviewerTypeSelector = lazy(() => import('./components/reviewer/ReviewerTypeSelector'))
const ReviewerBuilderPage = lazy(() => import('./components/reviewer/ReviewerBuilderPage'))
const ReviewerStudio = lazy(() => import('./components/reviewer/ReviewerStudioPage'))

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <Loading message="Loading page..." />
    </div>
  )
}

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
            <Suspense fallback={<RouteFallback />}>
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
            </Suspense>
          </Router>
        </CourseContextProvider>
      </NotificationProvider>
    </ToastProvider>
  )
}
