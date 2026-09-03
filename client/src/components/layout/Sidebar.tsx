
import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CheckSquare,
  PlusCircle,
  Users,
  Layers,
  LogOut,
  User as UserIcon,
  UserCheck,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'

interface SidebarProps {
  className?: string
  onCloseMobile?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const mainNavItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'member'] as Role[],
    },
    {
      label: 'All Tasks',
      href: '/tasks',
      icon: CheckSquare,
      roles: ['admin', 'member'] as Role[],
    },
    {
      label: 'Create Task',
      href: '/tasks/create',
      icon: PlusCircle,
      roles: ['admin', 'member'] as Role[],
    },
    {
      label: 'Team Directory',
      href: '/users',
      icon: Users,
      roles: ['admin'] as Role[],
      badge: 'admin',
    },
  ]

  const visibleNavItems = mainNavItems.filter(
    (item) => !!user?.role && item.roles.includes(user.role)
  )

  // Assigned to me is active only when Dashboard's My Tasks section is selected
  const isAssignedToMeActive =
    location.pathname === '/dashboard' &&
    location.hash === '#my-tasks'

  // Handle Assigned to me click
  const handleAssignedToMeClick = (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault()
    onCloseMobile?.()

    // Navigate to Dashboard with the hash
    navigate('/dashboard#my-tasks')

    // Wait for Dashboard to render/update, then scroll to My Tasks
    setTimeout(() => {
      document.getElementById('my-tasks')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 100)
  }

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col border-r border-border/80 bg-card/95 text-card-foreground shadow-2xs backdrop-blur-md',
        className
      )}
    >
      {/* Brand & Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border/60 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-md shadow-primary/20 ring-4 ring-primary/10">
          <Layers className="h-5 w-5" />
        </div>

        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-tight text-foreground font-sans">
            TaskFlow
          </span>

          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Internal Operations
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {/* Main Section */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider">
              Navigation
            </span>
          </div>

          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon

              /*
               * Manual active state is used because React Router's
               * NavLink considers /dashboard and /dashboard#my-tasks
               * as the same pathname.
               */
              const isItemActive =
                item.href === '/dashboard'
                  ? location.pathname === '/dashboard' &&
                  location.hash !== '#my-tasks'
                  : item.href === '/tasks'
                    ? location.pathname === '/tasks'
                    : location.pathname === item.href

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end
                  onClick={onCloseMobile}
                  className={cn(
                    'group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150',
                    isItemActive
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-bold'
                      : 'text-muted-foreground hover:bg-accent/80 hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                        isItemActive
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />

                    <span>{item.label}</span>
                  </div>

                  {item.badge && !isItemActive && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Quick Views */}
        <div>
          <div className="px-3 mb-2">
            <span className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider">
              Quick Views
            </span>
          </div>

          <div className="space-y-1 text-xs font-medium">
            <NavLink
              to="/dashboard#my-tasks"
              onClick={handleAssignedToMeClick}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2 transition-colors',
                isAssignedToMeActive
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              )}
            >
              <UserCheck
                className={cn(
                  'h-4 w-4',
                  isAssignedToMeActive
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground'
                )}
              />

              <span>Assigned to me</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* User Info & Footer */}
      {user && (
        <div className="border-t border-border/60 p-3 bg-muted/10">
          <div className="flex items-center gap-3 rounded-xl bg-card border border-border/80 p-2.5 shadow-2xs">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-border"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  <UserIcon className="h-4 w-4" />
                </div>
              )}

              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-bold text-foreground">
                {user.name}
              </span>

              <span className="text-[10px] text-muted-foreground truncate">
                {user.department || user.email}
              </span>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}

