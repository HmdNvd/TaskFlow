import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  PlusCircle,
  Bell,
  Search,
  ShieldCheck,
  User as UserIcon,
  CheckCircle2,
  Loader2,
  X,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { TaskStatusBadge } from '@/components/common/TaskStatusBadge'
import { searchTasks, getTasksErrorMessage } from '@/services/tasks'
import type { Task } from '@/types'

interface HeaderProps {
  onOpenMobileMenu?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { user, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchContainerRef = useRef<HTMLDivElement>(null)

  // 350ms debounce before triggering backend search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 350)

    return () => clearTimeout(timer)
  }, [query])

  // Execute search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([])
      setIsLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    setIsLoading(true)
    setError(null)
    setIsOpen(true)

    searchTasks(debouncedQuery, controller.signal)
      .then((tasks) => {
        setResults(tasks)
        setIsLoading(false)
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(getTasksErrorMessage(err))
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [debouncedQuery])

  // Dismiss dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'Enter') {
      if (query.trim()) {
        setIsOpen(false)
        navigate(`/tasks?search=${encodeURIComponent(query.trim())}`)
      }
    }
  }

  const handleSelectTask = (task: Task) => {
    setIsOpen(false)
    navigate(`/tasks?taskId=${task.id}`)
  }

  const handleClear = () => {
    setQuery('')
    setDebouncedQuery('')
    setResults([])
    setError(null)
    setIsOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/80 bg-card/90 px-4 backdrop-blur-md sm:px-6">
      {/* Left Section: Mobile trigger + Quick Create action */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Create New Task Button matching Dribbble reference */}
        {location.pathname !== '/tasks/create' && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary font-semibold shadow-2xs"
          >
            <Link to="/tasks/create">
              <PlusCircle className="h-4 w-4" />
              <span>Create New Task</span>
            </Link>
          </Button>
        )}
      </div>

      {/* Middle Section: Quick Global Search bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div ref={searchContainerRef} className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (!isOpen && e.target.value.trim()) {
                setIsOpen(true)
              }
            }}
            onFocus={() => {
              if (query.trim()) {
                setIsOpen(true)
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks by title, description, or assignee..."
            className="w-full pl-9 pr-8 h-9 text-xs rounded-xl bg-muted/40 border-border/70 focus-visible:ring-1 focus-visible:bg-background transition-all"
          />

          {/* Right indicator/actions inside input: Spinner or Clear button */}
          <div className="absolute right-2.5 top-2.5 flex items-center">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/70" />
            ) : query ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground/60 hover:text-foreground transition-colors p-0.5 rounded"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {/* Search Results Dropdown */}
          {isOpen && debouncedQuery && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-border/80 bg-card/95 shadow-xl backdrop-blur-md overflow-hidden max-h-80 flex flex-col">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 p-6 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Searching tasks...</span>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-xs text-destructive">
                  {error}
                </div>
              ) : results.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">No tasks found</p>
                  <p className="text-[11px] mt-1 text-muted-foreground">
                    No matching tasks for &ldquo;{debouncedQuery}&rdquo;
                  </p>
                </div>
              ) : (
                <>
                  <div className="px-3 py-2 text-[11px] font-semibold text-muted-foreground border-b border-border/50 flex items-center justify-between bg-muted/20">
                    <span>Matching Tasks ({results.length})</span>
                    <span className="text-[10px] text-muted-foreground/80 font-normal">Press Enter to view all</span>
                  </div>

                  <div className="overflow-y-auto divide-y divide-border/40">
                    {results.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => handleSelectTask(task)}
                        className="w-full text-left px-3 py-2.5 hover:bg-muted/60 transition-colors flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-muted-foreground group-hover:text-primary transition-colors">
                              #{task.id}
                            </span>
                            <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {task.title}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                            {task.assigned_to ? (
                              <span className="flex items-center gap-1 truncate max-w-[140px]">
                                <UserIcon className="h-3 w-3 text-primary/70 shrink-0" />
                                <span className="truncate">{task.assigned_to.name}</span>
                              </span>
                            ) : (
                              <span className="italic text-muted-foreground/60">Unassigned</span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          <TaskStatusBadge status={task.status} size="sm" />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-2 border-t border-border/50 bg-muted/20 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false)
                        navigate(`/tasks?search=${encodeURIComponent(query.trim())}`)
                      }}
                      className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <span>View all results in Tasks list</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Notifications + User profile pill */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/20 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-card animate-pulse" />
        </button>

        <div className="h-5 w-px bg-border/80 hidden sm:block" />

        {/* Authenticated User Display Pill */}
        {user ? (
          <div className="flex items-center gap-2.5 rounded-full border border-border/80 bg-muted/30 py-1 pl-1.5 pr-3 shadow-2xs">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-primary/20"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                <UserIcon className="h-3.5 w-3.5" />
              </div>
            )}

            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight text-foreground">
                {user.name}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight hidden lg:inline">
                {user.department || user.email}
              </span>
            </div>

            <Badge
              variant={isAdmin ? 'admin' : 'member'}
              className="ml-1 h-4 px-1.5 text-[10px] font-semibold gap-0.5"
            >
              {isAdmin ? (
                <ShieldCheck className="h-2.5 w-2.5" />
              ) : (
                <CheckCircle2 className="h-2.5 w-2.5" />
              )}
              {user.role}
            </Badge>
          </div>
        ) : null}
      </div>
    </header>
  )
}
