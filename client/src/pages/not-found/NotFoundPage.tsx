import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground mb-6 ring-12 ring-muted/30">
        <FileQuestion className="h-10 w-10" />
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">404</h1>
      <h2 className="mt-2 text-lg font-semibold text-foreground">Page Not Found</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The requested resource or page could not be located in TaskFlow.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" asChild className="gap-2">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Link>
        </Button>
        <Button asChild className="gap-2">
          <Link to="/dashboard">
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
export default NotFoundPage
