'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UserPlus } from 'lucide-react'
import InviteForm from './InviteForm'

interface InviteUserModalProps {
  onInviteCreated: () => void
}

export function InviteUserModal({ onInviteCreated }: InviteUserModalProps) {
  const [open, setOpen] = useState(false)

  const handleInviteCreated = () => {
    onInviteCreated()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Send an invitation to a new user. They will receive an email with instructions to join.
          </DialogDescription>
        </DialogHeader>
        <InviteForm onInviteCreated={handleInviteCreated} />
      </DialogContent>
    </Dialog>
  )
} 