
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Layers, ArrowRight, Loader2 } from 'lucide-react'

import { useAuth } from '@/context/AuthContext'
import { getAuthErrorMessage } from '@/services/auth'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters long'),

  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),

  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long'),
})

type RegisterFormData = z.infer<typeof registerSchema>

export const MemberRegisterPage: React.FC = () => {
  const [apiError, setApiError] = React.useState<string | null>(null)

  const { register: registerMember } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null)

    try {
      await registerMember(
        data.name.trim(),
        data.email.trim().toLowerCase(),
        data.password
      )

      navigate('/dashboard', { replace: true })
    } catch (error) {
      setApiError(getAuthErrorMessage(error))
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Logo & Heading */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <Layers className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Join TaskFlow
          </h1>

          <p className="text-sm text-muted-foreground">
            Create your member account to get started
          </p>
        </div>

        {/* Registration Card */}
        <Card className="shadow-lg border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">
              Register as a Member
            </CardTitle>

            <CardDescription>
              Enter your details to create a TaskFlow member account
            </CardDescription>
          </CardHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <CardContent className="space-y-4">

              {/* API Error */}
              {apiError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {apiError}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  Full Name
                </label>

                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  disabled={isSubmitting}
                  {...register('name')}
                />

                {errors.name && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  Email
                </label>

                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  {...register('email')}
                />

                {errors.email && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  Password
                </label>

                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...register('password')}
                />

                {errors.password && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

            </CardContent>

            <CardFooter className="flex flex-col gap-3">

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}

                <span>
                  {isSubmitting
                    ? 'Creating account...'
                    : 'Create Member Account'}
                </span>
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Your account will be created with Member access.
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  disabled={isSubmitting}
                  className="font-medium text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
                >
                  Sign In
                </button>
              </div>

            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default MemberRegisterPage
