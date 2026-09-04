
import React, { useEffect, useMemo, useState } from 'react'
import {
  UserPlus,
  ShieldCheck,
  UserCheck,
  Search,
  Mail,
  Building,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'

import { usersApi } from '@/services/api'
import type { User, Role } from '@/types'

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member' as Role,
  })

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await usersApi.getAll()
      setUsers(response.data.data)
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          'Failed to load users. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return users
    }

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query)
    )
  }, [users, search])

  const resetForm = () => {
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'member',
    })

    setFormError(null)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    const name = newUser.name.trim()
    const email = newUser.email.trim().toLowerCase()
    const password = newUser.password

    if (!name || !email || !password) {
      setFormError('Name, email, and password are required.')
      return
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.')
      return
    }

    setIsCreating(true)
    setFormError(null)

    try {
      await usersApi.create({
        name,
        email,
        password,
        role: newUser.role,
      })

      // Reload users from the database so the new user
      // immediately appears in the Team Directory.
      await fetchUsers()

      setIsAddOpen(false)
      resetForm()

      console.log('User created successfully')
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Failed to create user. Please try again.'

      setFormError(message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDialogChange = (open: boolean) => {
    setIsAddOpen(open)

    if (!open) {
      resetForm()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Team Directory
          </h1>

          <p className="text-muted-foreground">
            Manage users and their roles.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>

          <DialogContent>
            <form onSubmit={handleCreateUser}>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>

                <DialogDescription>
                  Create a new user account and assign a role.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium"
                  >
                    Full Name
                  </label>

                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser((current) => ({
                        ...current,
                        name: e.target.value,
                      }))
                    }
                    disabled={isCreating}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium"
                  >
                    Corporate Email
                  </label>

                  <Input
                    id="email"
                    type="email"
                    placeholder="user@company.com"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser((current) => ({
                        ...current,
                        email: e.target.value,
                      }))
                    }
                    disabled={isCreating}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium"
                  >
                    Temporary Password
                  </label>

                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser((current) => ({
                        ...current,
                        password: e.target.value,
                      }))
                    }
                    disabled={isCreating}
                  />

                  <p className="text-xs text-muted-foreground">
                    The user can use this password to log in.
                  </p>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label
                    htmlFor="role"
                    className="text-sm font-medium"
                  >
                    Assigned Role
                  </label>

                  <select
                    id="role"
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser((current) => ({
                        ...current,
                        role: e.target.value as Role,
                      }))
                    }
                    disabled={isCreating}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Error */}
                {formError && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {formError}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            Loading users...
          </p>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <ErrorState message={error} />
      )}

      {/* Empty */}
      {!isLoading && !error && filteredUsers.length === 0 && (
        <EmptyState
          title="No users found"
          description={
            search
              ? 'Try changing your search.'
              : 'There are no users to display.'
          }
        />
      )}

      {/* Users */}
      {!isLoading && !error && filteredUsers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        {user.name}
                      </h3>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant={
                      user.role === 'admin'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {user.role === 'admin' ? (
                      <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                    ) : (
                      <UserCheck className="mr-1 h-3.5 w-3.5" />
                    )}

                    {user.role}
                  </Badge>
                </div>

                {user.department && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    {user.department}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default UsersPage
