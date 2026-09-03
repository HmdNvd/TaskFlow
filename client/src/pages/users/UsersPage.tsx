import React, { useState } from 'react'
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
import { MOCK_USERS } from '@/data/mockData'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { UsersSkeleton } from '@/components/common/skeletons'
import type { User, Role } from '@/types'

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'member' as Role,
    department: 'Engineering',
  })

  // Ready for API: set isLoading/error from fetch instead of mock data.
  const isLoading: boolean = false
  const error: string | null = null

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()))
  )

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.name || !newUser.email) return

    const created: User = {
      id: `usr-00${users.length + 1}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      created_at: new Date().toISOString().split('T')[0],
    }

    setUsers([...users, created])
    setIsAddOpen(false)
    setNewUser({ name: '', email: '', role: 'member', department: 'Engineering' })
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
              Team Directory
            </h1>
            <Badge variant="admin" className="text-xs font-bold">
              Admin Only
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage organization members, system roles, and department assignments.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm rounded-xl font-semibold">
              <UserPlus className="h-4 w-4" />
              <span>Invite User</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New Team Member</DialogTitle>
              <DialogDescription>
                Assign role and provide corporate email to generate an onboarding invitation.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Full Name
                </label>
                <Input
                  placeholder="e.g. Robin Banks"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Corporate Email
                </label>
                <Input
                  type="email"
                  placeholder="e.g. robin.banks@taskflow.internal"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Assigned Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Department
                  </label>
                  <Input
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Send Invitation</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Input */}
      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
            <Input
              placeholder="Search users by name, email, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List Grid */}
      {isLoading ? (
        <UsersSkeleton count={6} />
      ) : error ? (
        <ErrorState title="Unable to load users" message={error} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No users found"
          description={
            search
              ? 'Try a different name, email, or department.'
              : 'There are currently no users in the directory.'
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow border-border/70 rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-12 w-12 rounded-2xl object-cover ring-2 ring-primary/20 shadow-xs"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-extrabold text-sm">
                        {user.name[0]}
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-bold text-foreground">{user.name}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                      {user.department && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Building className="h-3 w-3" />
                          <span>{user.department}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Badge variant={user.role === 'admin' ? 'admin' : 'member'}>
                    {user.role === 'admin' ? (
                      <ShieldCheck className="mr-1 h-3 w-3" />
                    ) : (
                      <UserCheck className="mr-1 h-3 w-3" />
                    )}
                    {user.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
export default UsersPage
