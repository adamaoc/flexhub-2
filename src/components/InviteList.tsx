'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface Invite {
  id: string
  email: string
  role: string
  token: string
  invitedAt: string
  expiresAt: string
  isUsed: boolean
  usedAt?: string
  inviter: {
    name?: string
    email?: string
  }
}

export default function InviteList() {
  const [invites, setInvites] = useState<Invite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingInvite, setUpdatingInvite] = useState<string | null>(null)
  const [deletingInvite, setDeletingInvite] = useState<string | null>(null)

  const fetchInvites = async () => {
    try {
      const response = await fetch('/api/invites')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invites')
      }

      setInvites(data.invites)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInvites()
  }, [])

  const updateInviteRole = async (inviteId: string, newRole: string) => {
    setUpdatingInvite(inviteId)
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update invite')
      }

      // Update the local state
      setInvites(prev => prev.map(invite => 
        invite.id === inviteId 
          ? { ...invite, role: newRole }
          : invite
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invite')
    } finally {
      setUpdatingInvite(null)
    }
  }

  const deleteInvite = async (inviteId: string) => {
    if (!confirm('Are you sure you want to delete this invite? This action cannot be undone.')) {
      return
    }

    setDeletingInvite(inviteId)
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete invite')
      }

      // Remove from local state
      setInvites(prev => prev.filter(invite => invite.id !== inviteId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invite')
    } finally {
      setDeletingInvite(null)
    }
  }

  const formatDate = (dateString: string) => {
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

  const getStatusBadge = (invite: Invite) => {
    const now = new Date()
    const expiresAt = new Date(invite.expiresAt)
    
    if (invite.isUsed) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Used
        </span>
      )
    }
    
    if (expiresAt < now) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expired
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Active
      </span>
    )
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      USER: 'bg-gray-100 text-gray-800',
      ADMIN: 'bg-yellow-100 text-yellow-800',
      SUPERADMIN: 'bg-purple-100 text-purple-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role as keyof typeof colors] || colors.USER}`}>
        {role}
      </span>
    )
  }

  const RoleSelect = ({ invite }: { invite: Invite }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [selectedRole, setSelectedRole] = useState(invite.role)

    const handleSave = async () => {
      if (selectedRole !== invite.role) {
        await updateInviteRole(invite.id, selectedRole)
      }
      setIsEditing(false)
    }

    const handleCancel = () => {
      setSelectedRole(invite.role)
      setIsEditing(false)
    }

    // If invite is used, show read-only state
    if (invite.isUsed) {
      return (
        <div className="flex items-center space-x-2">
          {getRoleBadge(invite.role)}
          <span className="text-xs text-gray-500 italic">(Used - cannot edit)</span>
        </div>
      )
    }

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={updatingInvite === invite.id}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="SUPERADMIN">SUPERADMIN</option>
          </select>
          <Button
            onClick={handleSave}
            disabled={updatingInvite === invite.id}
            size="sm"
            variant="default"
          >
            {updatingInvite === invite.id ? 'Saving...' : 'Save'}
          </Button>
          <Button
            onClick={handleCancel}
            disabled={updatingInvite === invite.id}
            size="sm"
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-2">
        {getRoleBadge(invite.role)}
        <Button
          onClick={() => setIsEditing(true)}
          size="sm"
          variant="link"
          className="text-xs p-0 h-auto"
        >
          Edit
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">Loading invites...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Invite Management
          </h3>
          <Button
            onClick={fetchInvites}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        </div>
        
        {invites.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No invites found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invited By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invites.map((invite) => (
                  <tr key={invite.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invite.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <RoleSelect invite={invite} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getStatusBadge(invite)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invite.inviter.name || invite.inviter.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatInvitedDate(invite.invitedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatExpiresDate(invite.expiresAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invite.isUsed ? (
                        <span className="text-gray-400 text-xs italic">(Used - cannot delete)</span>
                      ) : (
                        <Button
                          onClick={() => deleteInvite(invite.id)}
                          disabled={deletingInvite === invite.id}
                          variant="destructive"
                          size="sm"
                        >
                          {deletingInvite === invite.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 