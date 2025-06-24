"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { getSessionTimeRemaining, formatTimeRemaining } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, RefreshCw, Info } from "lucide-react"

export function SessionStatus() {
  const { data: session, update } = useSession()
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    if (!session?.user) return

    // Get authTime from session
    const authTime = session.authTime
    if (!authTime) return

    const updateTimeRemaining = () => {
      const remaining = getSessionTimeRemaining(authTime)
      setTimeRemaining(remaining)
      
      // Show warning when less than 2 hours remaining
      setShowWarning(remaining < 2 * 60 * 60 && remaining > 0)
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [session])

  const handleRefreshSession = async () => {
    await update()
    window.location.reload() // Force a reload to get a fresh session
  }

  // Early return if no session
  if (!session?.user) return null

  // Get authTime for display
  const authTime = session.authTime

  // Show warning card if session is expiring soon
  if (showWarning) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Session Expiring Soon
          </CardTitle>
          <CardDescription className="text-yellow-700 dark:text-yellow-300">
            Your session will expire in {formatTimeRemaining(timeRemaining)}. 
            You&apos;ll need to sign in again to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
            onClick={handleRefreshSession}
            size="sm"
            variant="outline"
            className="bg-white hover:bg-gray-50 border-yellow-300 text-yellow-800 hover:text-yellow-900"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Extend Session
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Show info card with current session status
  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Session Information
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          {authTime ? (
            <>
              Your session will expire in {formatTimeRemaining(timeRemaining)}.
              <br />
              <span className="text-xs">
                Session started: {new Date(authTime * 1000).toLocaleString()}
              </span>
            </>
          ) : (
            <>
              Session information not available. You may need to sign out and sign back in.
            </>
          )}
        </CardDescription>
      </CardHeader>
      {authTime && (
        <CardContent className="pt-0">
          <Button 
            onClick={handleRefreshSession}
            size="sm"
            variant="outline"
            className="bg-white hover:bg-gray-50 border-blue-300 text-blue-800 hover:text-blue-900"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Session
          </Button>
        </CardContent>
      )}
    </Card>
  )
} 