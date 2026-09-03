import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Menu,
  PlusCircle,
  Bell,
  Search,
  ShieldCheck,
  User as UserIcon,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface HeaderProps {
  onOpenMobileMenu?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { user, isAdmin } = useAuth()
  const location = useLocation()

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
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
          <Input
            placeholder="Search tasks by title, description, or assignee..."
            className="w-full pl-9 h-9 text-xs rounded-xl bg-muted/40 border-border/70 focus-visible:ring-1 focus-visible:bg-background transition-all"
          />
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
