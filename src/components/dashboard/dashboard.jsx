import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Add, KeyboardArrowDown, Menu, NotificationsNone, Search, TuneOutlined, ChevronLeftRounded} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';
import Home from './Home'
import LogoutButton from '../LogoutButton'
import ThemeToggle from '../ThemeToggle'
import { useAuth } from '../../lib/AuthProvider'
import { useCourseName } from '../../lib/CourseNameContext'
import { CourseModalProvider, useCourseModal } from '../../lib/CourseModalContext'
import CourseModalOverlay from '../CourseModalOverlay'
import { apiFetch } from '../../lib/apiClient'
import { safeJson } from '../courses/utils'
import { applyAccessibilityPreferences, getAccessibilityPreferences } from '../../lib/theme'
import logo from '../../assets/logo_f.png'
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined'
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/courses', label: 'Courses' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/reviewers', label: 'Reviewers' },
  { to: '/archived', label: 'Archive' },
  { to: '/settings', label: 'Settings' },
]

function getInitials(name, user) {
  const metadata = user?.user_metadata || {}
  const first = metadata.first_name || metadata.given_name
  const last = metadata.last_name || metadata.family_name

  if (first || last) {
    return `${String(first || '').trim()[0] || ''}${String(last || '').trim()[0] || ''}`.toUpperCase() || 'U'
  }

  const cleanName = String(name || '')
    .trim()
    .replace(/\s+/g, ' ')

  if (cleanName && !cleanName.includes('@')) {
    const parts = cleanName.split(' ')
    const firstInitial = parts[0]?.[0] || ''
    const lastInitial = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : ''
    return `${firstInitial}${lastInitial}`.toUpperCase() || 'U'
  }

  return String(user?.email || cleanName || 'U')[0]?.toUpperCase() || 'U'
}

function DashboardContent({ children }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const { openCreate, openEnroll } = useCourseModal();
  const [showCourseMenu, setShowCourseMenu] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allCourses, setAllCourses] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const location = useLocation();
  const { user, profileName } = useAuth();
  const { currentCourseName } = useCourseName();
  const searchRef = useRef(null);

  const userName = profileName || user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email || 'Justin';
  const firstName = String(userName).split(/\s+/)[0] || 'Justin'
  const avatarInitials = getInitials(userName, user);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { courses: [], tasks: [] };
    const query = searchQuery.toLowerCase().trim();
    const courses = allCourses.filter(
      (course) =>
        (course.title && course.title.toLowerCase().includes(query)) ||
        (course.course_code && course.course_code.toLowerCase().includes(query)) ||
        (course.author_name && course.author_name.toLowerCase().includes(query))
    );
    const tasks = allTasks.filter(
      (task) =>
        (task.title && task.title.toLowerCase().includes(query)) ||
        (task.description && task.description.toLowerCase().includes(query))
    );
    return { courses, tasks };
  }, [searchQuery, allCourses, allTasks]);

  useEffect(() => {
    setShowCourseMenu(false);
    setShowAvatarMenu(false);
    setShowSearchResults(false);
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (!user?.id) return;
      try {
        const [courseRes, taskRes] = await Promise.all([
          apiFetch(`/api/courses?user_id=${encodeURIComponent(user.id)}`),
          apiFetch(`/api/tasks?user_id=${encodeURIComponent(user.id)}`),
        ]);
        const [courseData, taskData] = await Promise.all([safeJson(courseRes), safeJson(taskRes)]);
        if (active) {
          setAllCourses(Array.isArray(courseData) ? courseData : []);
          setAllTasks(Array.isArray(taskData) ? taskData : []);
        }
      } catch (err) {
        console.error('Failed to load search data:', err);
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }
    if (showSearchResults) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [showSearchResults]);

  useEffect(() => {
    const loadProfilePicture = () => {
      try {
        const savedProfile = JSON.parse(window.localStorage.getItem('userProfile') || '{}')
        if (savedProfile.profilePicture) setProfilePicture(savedProfile.profilePicture)
      } catch (_e) {}
    }

    loadProfilePicture()
    const interval = setInterval(loadProfilePicture, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    applyAccessibilityPreferences(getAccessibilityPreferences())
  }, []);

  const currentTitle = location.pathname.startsWith('/courses/') && location.pathname !== '/courses'
    ? currentCourseName || 'Course Details'
    : navItems.find((item) => item.to === location.pathname)?.label || 'Dashboard'

  return (
    <div className="flex h-screen flex-col bg-app font-sans text-main">
      <header className="sticky top-0 z-30 flex min-h-[82px] flex-shrink-0 items-center justify-between border-b border-token bg-header px-5 md:px-7 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-5">
          <button
            type="button"
            className="hidden h-11 w-11 place-items-center rounded-2xl border-0 primary-btn md:grid"
            onClick={() => setIsOpen((value) => !value)}
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
           {isOpen ? (
              <MenuOpenRoundedIcon sx={{ fontSize: 22 }} />
            ) : (
              <ViewSidebarOutlinedIcon sx={{ fontSize: 22 }} />
            )}
          </button>
          
          <Link to="/dashboard" aria-label="Academee dashboard" className="flex items-center gap-4">
            <span className="grid h-11 w-auto place-items-center">
              <img src={logo} alt="Academee logo" className="h-7 w-auto" />
            </span>
          </Link>

          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-surface text-main shadow-sm md:hidden"
            onClick={() => setIsOpen((value) => !value)}
            aria-label="Toggle sidebar"
          >
            <Menu sx={{ fontSize: 22 }} />
          </button>
        </div>

        <div className="relative mx-5 hidden min-w-[200px] max-w-[500px] flex-1 items-center rounded-2xl border border-token bg-surface px-4 py-2.5 shadow-card lg:flex" ref={searchRef}>
          <Search sx={{ fontSize: 21 }} className="text-subtle" />
          <input
            type="search"
            placeholder="Search courses, tasks, students..."
            className="ml-3 w-full bg-transparent text-sm font-semibold text-main placeholder:text-subtle focus:outline-none"
            aria-label="Search dashboard"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
          />

          {showSearchResults && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[500px] overflow-y-auto rounded-3xl border border-token bg-surface shadow-card">
              {searchResults.courses.length === 0 && searchResults.tasks.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm font-bold text-muted">No results found for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="p-2">
                  {searchResults.courses.length > 0 && (
                    <>
                      <div className="px-3 py-2 text-xs font-black uppercase tracking-wider text-subtle">Courses</div>
                      {searchResults.courses.map((course) => (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => {
                            navigate(`/courses/${course.id}`);
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="w-full rounded-2xl px-3 py-2.5 text-left hover-surface transition"
                        >
                          <p className="text-sm font-bold text-main">{course.title}</p>
                          <p className="text-xs font-semibold text-muted mt-0.5">
                            {course.course_code && `Code: ${course.course_code} • `}By {course.author_name || 'Teacher'}
                          </p>
                        </button>
                      ))}
                    </>
                  )}
                  {searchResults.tasks.length > 0 && (
                    <>
                      <div className="mt-2 px-3 py-2 text-xs font-black uppercase tracking-wider text-subtle">Tasks</div>
                      {searchResults.tasks.map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => {
                            navigate(`/tasks`);
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="w-full rounded-2xl px-3 py-2.5 text-left hover-surface transition"
                        >
                          <p className="text-sm font-bold text-main">{task.title}</p>
                          <p className="text-xs font-semibold text-muted mt-0.5">{task.description?.slice(0, 50)}</p>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCourseMenu((value) => !value)}
              className="relative h-11 w-11 items-center rounded-2xl primary-btn"
              aria-label="Course actions"
            >
              <Add sx={{ fontSize: 25 }} />
            </button>
            {showCourseMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCourseMenu(false)} />
                <div className="absolute right-0 z-50 mt-3 w-56 rounded-3xl border border-token bg-surface p-2 shadow-card">
                  <button
                    onClick={() => { openCreate(); setShowCourseMenu(false); }}
                    className="w-full rounded-2xl px-4 py-3 text-left text-sm font-bold text-main hover-surface"
                  >
                    Create Course
                  </button>
                  <button
                    onClick={() => { openEnroll(); setShowCourseMenu(false); }}
                    className="w-full rounded-2xl px-4 py-3 text-left text-sm font-bold text-main hover-surface"
                  >
                    Join Course
                  </button>
                </div>
              </>
            )}
          </div>
          <Link to="/notifications" className="relative grid h-11 w-11 place-items-center rounded-2xl border border-token bg-surface text-main shadow-sm transition hover-surface" aria-label="Notifications">
            <NotificationsNone />
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-primary-token" />
          </Link>

          <div className="hidden md:block">
            {/* Theme toggle available in header */}
            <ThemeToggle />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAvatarMenu((value) => !value)}
              className="flex items-center gap-2 rounded-2xl border border-token bg-surface px-2 py-1.5 shadow-sm transition hover-surface"
              aria-expanded={showAvatarMenu}
              aria-haspopup="menu"
            >
              <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-primary-token text-sm font-black text-white">
                {profilePicture ? <img src={profilePicture} alt={userName} className="h-full w-full object-cover" /> : avatarInitials}
              </span>
              <KeyboardArrowDown className="text-subtle" />
            </button>

            {showAvatarMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAvatarMenu(false)} />
                <div role="menu" className="absolute right-0 z-50 mt-3 w-64 rounded-3xl border border-token bg-surface p-2 shadow-card">
                  <div className="px-3 py-3">
                    <p className="truncate text-sm font-black text-main">{userName}</p>
                    <p className="truncate text-xs font-medium text-subtle">{user?.email}</p>
                  </div>
                  <Link to="/settings" className="block rounded-2xl px-3 py-2.5 text-sm font-bold text-main hover:bg-success-soft">
                    Profile settings
                  </Link>
                  <LogoutButton isOpen />
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar isOpen={isOpen} onToggle={() => setIsOpen((prev) => !prev)} />

        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full px-5 pb-8 pt-6 md:px-8">
            <div className="sr-only">{currentTitle}</div>
            {React.isValidElement(children) ? children : (children || <Home />)}
          </div>
        </main>
      </div>

      <CourseModalOverlay />
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <CourseModalProvider>
      <DashboardContent>{children}</DashboardContent>
    </CourseModalProvider>
  )
}
