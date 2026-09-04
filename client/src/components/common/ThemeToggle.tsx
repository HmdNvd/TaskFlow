import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/20 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
    >
      <Sun
        className={`h-4 w-4 transition-all ${
          isDark ? 'scale-0 -rotate-90 absolute' : 'scale-100 rotate-0'
        }`}
      />
      <Moon
        className={`h-4 w-4 transition-all ${
          isDark ? 'scale-100 rotate-0' : 'scale-0 rotate-90 absolute'
        }`}
      />
    </button>
  )
}
