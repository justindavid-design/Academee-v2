import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  ArchiveOutlined,
  AssignmentOutlined,
  CalendarTodayOutlined,
  DashboardOutlined,
  LibraryBooksOutlined,
  SettingsOutlined,
  AutoStoriesOutlined,
} from '@mui/icons-material'
import LogoutButton from '../LogoutButton'
import logoutIcon from '../../assets/lg.png'

const primaryItems = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardOutlined },
  { to: '/courses', label: 'Courses', icon: LibraryBooksOutlined },
  { to: '/calendar', label: 'Calendar', icon: CalendarTodayOutlined },
  { to: '/tasks', label: 'Assignments', icon: AssignmentOutlined },
  { to: '/reviewers', label: 'Reviewers', icon: AutoStoriesOutlined },
  { to: '/archived', label: 'Archive', icon: ArchiveOutlined },
]

function SidebarItem({ to, label, icon: Icon, isCollapsed }) {
  return (
    <NavLink
      to={to}
      title={label}
      aria-label={label}
      className={({ isActive }) => `group relative flex min-h-[56px] items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm font-semibold tracking-[0.01em] outline-none transition-all duration-300 focus-visible:ring-4 focus-visible:ring-primary/15 ${
        isActive
          ? 'bg-primary-soft text-primary-token'
          : 'text-muted hover:bg-surface-alt hover:text-main'
      }`}
    >
      {({ isActive }) => (
        <>
          <span className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl transition ${
            isActive ? 'bg-primary-token text-white' : 'bg-surface text-muted group-hover:bg-surface-alt group-hover:text-main'
          }`}>
            <Icon sx={{ fontSize: 20 }} />
          </span>
          {!isCollapsed ? <span className="truncate">{label}</span> : null}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ isOpen }) {
  return (
    <aside
      className={`${isOpen ? 'w-[270px]' : 'w-[90px]'} relative flex-shrink-0 border-r border-token bg-sidebar transition-all duration-300`}
      aria-label="Dashboard navigation"
    >
      <div className="flex h-full flex-col justify-between px-4 pb-6 pt-5">
        <div>
          <nav className="grid gap-1.5">
            {primaryItems.map((item) => (
              <SidebarItem key={item.to} {...item} isCollapsed={!isOpen} />
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-token pt-4">
          <div className="grid gap-1.5">
            <SidebarItem
              to="/settings"
              label="Settings"
              icon={SettingsOutlined}
              isCollapsed={!isOpen}
            />

            <div
              className={`
                [&_button]:flex
                [&_button]:min-h-[52px]
                [&_button]:w-full
                [&_button]:items-center
                ${!isOpen
                  ? '[&_button]:justify-center [&_button]:px-0'
                  : '[&_button]:gap-3 [&_button]:px-4'}
                [&_button]:rounded-2xl
                [&_button]:py-3
                [&_button]:text-sm
                [&_button]:font-semibold
                [&_button]:text-muted
                [&_button]:transition-all
                [&_button]:duration-200
                [&_button]:hover:bg-surface-alt
                [&_button]:hover:text-main
              `}
            >
              <LogoutButton
                isOpen={isOpen}
                imageSrc={logoutIcon}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
