'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useCurrentSite } from '@/hooks/use-current-site'
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  User,
  ChevronRight,
  Shield,
  Globe,
  File
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Pages', href: '/pages', icon: File },
  { name: 'Content', href: '/content', icon: FileText },
  { name: 'Profile', href: '/profile', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { currentSite } = useCurrentSite()
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center space-x-2 px-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">F</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl">FlexHub</span>
            {currentSite && (
              <span className="text-xs text-sidebar-foreground/70 truncate">
                {currentSite.name}
              </span>
            )}
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.name}</span>
                        {isActive && <ChevronRight className="ml-auto" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Super User Actions */}
        {session?.user?.role === 'SUPERADMIN' && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Create Invite">
                      <Link href="/dashboard">
                        <Plus />
                        <span>Create Invite</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem> */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="User Management" isActive={pathname === '/admin/users'}>
                      <Link href="/admin/users">
                        <Shield />
                        <span>User Management</span>
                        {pathname === '/admin/users' && <ChevronRight className="ml-auto" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Sites" isActive={pathname === '/admin/sites'}>
                      <Link href="/admin/sites">
                        <Globe />
                        <span>Sites</span>
                        {pathname === '/admin/sites' && <ChevronRight className="ml-auto" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex items-center space-x-3 px-2 py-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {session?.user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleSignOut}
                  tooltip="Sign out"
                  variant="outline"
                  size="sm"
                >
                  <LogOut />
                  <span>Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
} 