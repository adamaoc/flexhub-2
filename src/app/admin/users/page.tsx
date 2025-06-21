'use client'

import { useSession } from 'next-auth/react'
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout'
import { InviteUserModal } from '@/components/InviteUserModal'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Shield, 
  UserCheck, 
  UserX, 
  Mail,
  Calendar,
  MoreHorizontal,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Trash
} from 'lucide-react'
import { PrismaClient } from '@prisma/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const prisma = new PrismaClient()

interface User {
  id: string
  name: string | null
  email: string
  role: string
  isActive: boolean
  lastLogin: string | null
  createdAt: string
  invitedBy?: string | null
}

interface Invite {
  id: string
  email: string
  role: string
  isUsed: boolean
  expiresAt: string
  invitedAt: string
  usedAt: string | null
  invitedBy: string
}

export default function UserManagementPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [invitesLoading, setInvitesLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [deletingInvite, setDeletingInvite] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/users')
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please sign in again')
        } else if (response.status === 403) {
          throw new Error('Access denied - Super admin privileges required')
        } else {
          throw new Error('Failed to fetch users')
        }
      }
      
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchInvites = async () => {
    try {
      setInvitesLoading(true)
      
      const response = await fetch('/api/invites')
      
      if (!response.ok) {
        console.error('Failed to fetch invites')
        return
      }
      
      const data = await response.json()
      // Filter out used invites - only show active/pending invites
      const activeInvites = data.filter((invite: Invite) => !invite.isUsed)
      setInvites(activeInvites)
    } catch (err) {
      console.error('Error fetching invites:', err)
    } finally {
      setInvitesLoading(false)
    }
  }

  const deleteInvite = async (inviteId: string) => {
    try {
      setDeletingInvite(inviteId)
      
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete invite')
      }
      
      // Remove the invite from the local state
      setInvites(prev => prev.filter(invite => invite.id !== inviteId))
    } catch (err) {
      console.error('Error deleting invite:', err)
      setError('Failed to delete invite')
    } finally {
      setDeletingInvite(null)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchInvites()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return <Badge variant="destructive">Super</Badge>
      case 'ADMIN':
        return <Badge variant="default">Admin</Badge>
      case 'USER':
        return <Badge variant="secondary">User</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <UserCheck className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary">
        <UserX className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  const getInviteStatusBadge = (invite: Invite) => {
    const now = new Date()
    const expiresAt = new Date(invite.expiresAt)
    const isExpired = expiresAt < now

    if (invite.isUsed) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Used
        </Badge>
      )
    } else if (isExpired) {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      )
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatInvitedDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    })
  }

  const formatExpiresDate = (dateString: string) => {
    const now = new Date()
    const expiresAt = new Date(dateString)
    const diffTime = expiresAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return 'Expired'
    } else if (diffDays === 0) {
      return 'Expires today'
    } else if (diffDays === 1) {
      return 'Expires tomorrow'
    } else {
      return `Expires in ${diffDays} days`
    }
  }

  const handleInviteCreated = () => {
    // Refresh both users and invites after creating an invite
    fetchUsers()
    fetchInvites()
  }

  if (session?.user?.role !== 'SUPERADMIN') {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Access Denied</h1>
            <p className="text-muted-foreground mt-2">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage users, roles, and permissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                fetchUsers()
                fetchInvites()
              }}
              disabled={loading || invitesLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading || invitesLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <InviteUserModal onInviteCreated={handleInviteCreated} />
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">{users.filter(u => u.isActive).length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'ADMIN' || u.role === 'SUPERADMIN').length}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Invites</p>
                <p className="text-2xl font-bold text-foreground">{invites.filter(i => new Date(i.expiresAt) > new Date()).length}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background text-foreground"
            >
              <option value="all">All Roles</option>
              <option value="SUPERADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Users</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {users.length === 0 ? 'No users found in database' : 'No users match your search'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Last Login</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-foreground">{user.name || 'No name'}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(user.isActive)}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDate(user.lastLogin)}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Invites Table */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Invites</h3>
            
            {invitesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading invites...</p>
              </div>
            ) : invites.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No invites found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Invited</th>
                      <th className="text-center py-1 px-1 font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((invite) => (
                      <tr key={invite.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{invite.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          {getRoleBadge(invite.role)}
                        </td>
                        <td className="py-3 px-4">
                          {getInviteStatusBadge(invite)}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          <strong>{formatInvitedDate(invite.invitedAt)}</strong>
                          <p className="text-xs text-muted-foreground">{formatExpiresDate(invite.expiresAt)}</p>
                        </td>
                        <td className="py-3 px-4">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                disabled={deletingInvite === invite.id}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Invite</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the invite for <strong>{invite.email}</strong>? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteInvite(invite.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deletingInvite === invite.id}
                                >
                                  {deletingInvite === invite.id ? 'Deleting...' : 'Delete Invite'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
} 