require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const multer = require('multer')
const fs = require('fs')

function requireServerEnv(keys) {
  const missing = keys.filter((key) => !process.env[key])
  if (!missing.length) return

  throw new Error(`Missing required server environment variables: ${missing.join(', ')}`)
}

requireServerEnv(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'])

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now()
    const random = Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    cb(null, `${name}-${timestamp}-${random}${ext}`)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase()
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip', '.jpg', '.jpeg', '.png']
    if (!allowedExtensions.includes(ext)) {
      cb(new Error(`File extension ${ext || '(none)'} is not allowed`), false)
      return
    }

    // Allowed MIME types
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
      'application/zip',
      'image/jpeg',
      'image/png',
    ]
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false)
    }
  }
})

const sendOtp = require(path.resolve(__dirname, 'api', 'send-otp'))
const verifyOtp = require(path.resolve(__dirname, 'api', 'verify-otp'))
const resetPassword = require(path.resolve(__dirname, 'api', 'reset-password'))
const stats = require(path.resolve(__dirname, 'api', 'stats'))
const courses = require(path.resolve(__dirname, 'api', 'courses'))
const courseModules = require(path.resolve(__dirname, 'api', 'course-modules'))
const courseAssignments = require(path.resolve(__dirname, 'api', 'course-assignments'))
const courseQuizzes = require(path.resolve(__dirname, 'api', 'course-quizzes'))
const coursePeople = require(path.resolve(__dirname, 'api', 'course-people'))
const notifications = require(path.resolve(__dirname, 'api', 'notifications'))
const profiles = require(path.resolve(__dirname, 'api', 'profiles'))
const submissions = require(path.resolve(__dirname, 'api', 'submissions'))
const tasks = require(path.resolve(__dirname, 'api', 'tasks'))
const calendar = require(path.resolve(__dirname, 'api', 'calendar'))
const aiRoutes = require(path.resolve(__dirname, 'src', 'routes', 'ai'))
const register = require(path.resolve(__dirname, 'api', 'register'))
const { attachAuthenticatedUser } = require(path.resolve(__dirname, 'api', '_lms'))
const { createClient } = require('@supabase/supabase-js')

const app = express()
const PORT = process.env.API_PORT || 8787
const HOST = process.env.API_HOST || '0.0.0.0'
const authSupabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const authSupabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
let authSupabaseClient = null

function getAuthSupabaseClient() {
  if (!authSupabaseUrl || !authSupabaseKey) {
    return null
  }

  if (!authSupabaseClient) {
    authSupabaseClient = createClient(authSupabaseUrl, authSupabaseKey)
  }

  return authSupabaseClient
}

// Enable CORS for cross-origin requests (needed when frontend runs on different port)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5180', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use('/api', attachAuthenticatedUser)
app.use('/api/ai', aiRoutes)

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'lms-api' })
})

app.post('/api/send-otp', async (req, res) => {
  try{
    await sendOtp(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.post('/api/verify-otp', async (req, res) => {
  try{
    await verifyOtp(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.post('/api/reset-password', async (req, res) => {
  try{
    await resetPassword(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.get('/api/stats', async (req, res) => {
  try{
    await stats(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.get('/api/tasks', async (req, res) => {
  try{
    await tasks(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.get('/api/calendar', async (req, res) => {
  try{
    await calendar(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/courses', async (req, res) => {
  try{
    await courses(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/courses/:id/modules', async (req, res) => {
  try{
    req.params = req.params || {}
    await courseModules(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/courses/:id/assignments', async (req, res) => {
  try{
    req.params = req.params || {}
    await courseAssignments(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/courses/:id/quizzes', async (req, res) => {
  try{
    req.params = req.params || {}
    await courseQuizzes(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

// Support direct quiz id routes (e.g. /api/courses/:id/quizzes/:quizId)
app.all('/api/courses/:id/quizzes/:quizId', async (req, res) => {
  try {
    req.params = req.params || {}

    // Quick dev shortcut: serve local sample quiz when courseId === 'sample'
    try {
      const courseId = req.params.id
      const quizId = req.params.quizId
      if (String(courseId) === 'sample' && String(quizId) === 'sample-quiz') {
        const samplePath = path.resolve(__dirname, 'sample-quiz.json')
        if (fs.existsSync(samplePath)) {
          const raw = fs.readFileSync(samplePath, 'utf8')
          const data = JSON.parse(raw)
          return res.status(200).json(data)
        }
      }
    } catch (err) {
      // fall through to normal handler on error
      console.warn('Sample quiz shortcut failed:', err.message || err)
    }

    await courseQuizzes(req, res)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/courses/:id/quizzes/:quizId/:action', async (req, res) => {
  try {
    req.params = req.params || {}
    await courseQuizzes(req, res)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/courses/:id/people', async (req, res) => {
  try{
    req.params = req.params || {}
    await coursePeople(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/quizzes', async (req, res) => {
  try{
    await courseQuizzes(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

// Support direct quiz access by id
app.all('/api/quizzes/:quizId', async (req, res) => {
  try {
    req.params = req.params || {}
    await courseQuizzes(req, res)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/quizzes/:quizId/:action', async (req, res) => {
  try {
    req.params = req.params || {}
    await courseQuizzes(req, res)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/courses/:id', async (req, res) => {
  try{
    req.params = req.params || {}
    await courses(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/assignments/:id/submissions', async (req, res) => {
  try{
    req.params = req.params || {}
    await submissions(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.patch('/api/submissions/:submissionId', async (req, res) => {
  try{
    req.params = req.params || {}
    await submissions(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

// Allow DELETE for individual submissions (e.g. unsubmit)
app.delete('/api/submissions/:submissionId', async (req, res) => {
  try{
    req.params = req.params || {}
    await submissions(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/notifications', async (req, res) => {
  try{
    await notifications(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/profiles', async (req, res) => {
  try{
    await profiles(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/profiles/:id', async (req, res) => {
  try{
    req.params = req.params || {}
    await profiles(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

// ============ Google OAuth Authentication ============
app.post('/api/auth/register', async (req, res) => {
  try {
    await register(req, res)
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: err.message || 'Registration failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const supabase = getAuthSupabaseClient()
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase auth client is not configured' })
    }

    const { email, password } = req.body || {}

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).toLowerCase(),
      password,
    })

    if (error) {
      if (error.status === 400) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }
      throw error
    }

    return res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        display_name: data.user.user_metadata?.display_name,
      },
      session: data.session,
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Login failed' })
  }
})

app.post('/api/auth/google', async (req, res) => {
  try {
    const googleAuth = require(path.resolve(__dirname, 'api', 'google-auth'))
    await googleAuth(req, res)
  } catch (err) {
    console.error('Google auth error:', err)
    const missingDependency = err.code === 'MODULE_NOT_FOUND'
    res.status(missingDependency ? 503 : 500).json({
      error: missingDependency ? 'Google authentication dependencies are not installed' : (err.message || 'Authentication failed'),
    })
  }
})

// Refresh JWT token
app.post('/api/auth/refresh', (req, res) => {
  try {
    const authMiddleware = require(path.resolve(__dirname, 'api', 'auth-middleware'))
    authMiddleware.refreshToken(req, res)
  } catch (err) {
    console.error('Token refresh error:', err)
    const missingDependency = err.code === 'MODULE_NOT_FOUND'
    res.status(missingDependency ? 503 : 500).json({
      error: missingDependency ? 'JWT dependencies are not installed' : 'Token refresh failed',
    })
  }
})

// Protected route example - verify auth token
app.get('/api/auth/verify', (req, res, next) => {
  try {
    const authMiddleware = require(path.resolve(__dirname, 'api', 'auth-middleware'))
    return authMiddleware.verifyAuthToken(req, res, next)
  } catch (err) {
    console.error('Token verify error:', err)
    const missingDependency = err.code === 'MODULE_NOT_FOUND'
    return res.status(missingDependency ? 503 : 500).json({
      error: missingDependency ? 'JWT dependencies are not installed' : 'Token verification failed',
    })
  }
}, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  })
})

app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' })
})

const server = app.listen(PORT, HOST, () => {
  console.log(`API dev server listening on http://localhost:${PORT}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`API dev server could not start because port ${PORT} is already in use.`)
    console.error('Close the existing API server, or start this one with a different port:')
    console.error('  $env:API_PORT=8788; npm run api')
    console.error('If you change API_PORT, restart Vite so its /api proxy picks up the same port.')
    process.exit(1)
  }

  console.error('API dev server failed to start:', err)
  process.exit(1)
})
