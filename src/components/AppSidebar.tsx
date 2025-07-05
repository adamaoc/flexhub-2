"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useCurrentSite } from "@/hooks/use-current-site";
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
  File,
  ExternalLink,
  Image as ImageIcon,
  Mail,
  MessageSquare,
  Store,
  BarChart3,
  Search,
  Share2,
  Languages,
  FormInput,
  Lock,
  Calendar,
  Newspaper,
  Award,
} from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";

// Feature configuration with icons and routes
const FEATURE_CONFIG = {
  PAGES: {
    name: "Pages",
    icon: File,
    href: "/pages",
    description: "Manage static pages",
  },
  BLOG_POSTS: {
    name: "Blog Posts",
    icon: FileText,
    href: "/blog",
    description: "Manage blog content",
  },
  MEDIA_FILES: {
    name: "Media Files",
    icon: ImageIcon,
    href: "/media",
    description: "Manage media files",
  },
  EMAIL_MANAGEMENT: {
    name: "Email Management",
    icon: Mail,
    href: "/email",
    description: "Manage email campaigns",
  },
  CONTACT_MANAGEMENT: {
    name: "Contact Management",
    icon: MessageSquare,
    href: "/contact",
    description: "Manage contact forms",
  },
  SPONSORS: {
    name: "Sponsors",
    icon: Award,
    href: "/sponsors",
    description: "Manage sponsors",
  },
  ONLINE_STORE: {
    name: "Online Store",
    icon: Store,
    href: "/store",
    description: "Manage e-commerce",
  },
  NEWSLETTER: {
    name: "Newsletter",
    icon: Newspaper,
    href: "/newsletter",
    description: "Manage newsletter",
  },
  ANALYTICS: {
    name: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    description: "View site analytics",
  },
  SEO_TOOLS: {
    name: "SEO Tools",
    icon: Search,
    href: "/seo",
    description: "SEO optimization tools",
  },
  SOCIAL_MEDIA_INTEGRATION: {
    name: "Social Media",
    icon: Share2,
    href: "/social-media",
    description: "Social media integration",
  },
  MULTI_LANGUAGE: {
    name: "Multi Language",
    icon: Languages,
    href: "/languages",
    description: "Multi-language content",
  },
  CUSTOM_FORMS: {
    name: "Custom Forms",
    icon: FormInput,
    href: "/forms",
    description: "Create custom forms",
  },
  MEMBER_AREA: {
    name: "Member Area",
    icon: Lock,
    href: "/members",
    description: "Member-only content",
  },
  EVENT_MANAGEMENT: {
    name: "Event Management",
    icon: Calendar,
    href: "/events",
    description: "Manage events",
  },
} as const;

const baseNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Profile", href: "/profile", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

// External links configuration
const EXTERNAL_LINKS_CONFIG = {
  EMAIL_MANAGEMENT: {
    name: "Email Management",
    href: "https://mail.zoho.com/zm/#mail/folder/inbox",
    icon: ExternalLink,
    feature: "EMAIL_MANAGEMENT",
  },
} as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { currentSite } = useCurrentSite();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  // Handler to close mobile sidebar when navigation occurs
  const handleMobileNavigation = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  // Get enabled features for the current site
  const enabledFeatures =
    currentSite?.features?.filter((f) => f.isEnabled) || [];

  // Create dynamic external links based on enabled features
  const externalLinks = Object.values(EXTERNAL_LINKS_CONFIG)
    .filter((link) =>
      enabledFeatures.some((feature) => feature.feature === link.feature)
    )
    .map((link) => ({
      name: link.name,
      href: link.href,
      icon: link.icon,
    }));

  // Create feature navigation items
  const featureNavigation = enabledFeatures
    .map((feature) => {
      const config =
        FEATURE_CONFIG[feature.feature as keyof typeof FEATURE_CONFIG];
      if (!config) return null;

      // Skip email management feature
      if (feature.feature === "EMAIL_MANAGEMENT") return null;

      return {
        name: feature.displayName, // Use database displayName instead of config.name
        href: config.href,
        icon: config.icon,
        description: feature.description || config.description, // Use database description, fallback to config
        feature: feature.feature,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center space-x-2 px-2"
          onClick={handleMobileNavigation}
        >
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
            <Image
              src="/favicon-32x32.png"
              alt="FlexHub Logo"
              width={32}
              height={32}
              className="object-contain"
            />
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
              {baseNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                    >
                      <Link href={item.href} onClick={handleMobileNavigation}>
                        <item.icon />
                        <span>{item.name}</span>
                        {isActive && <ChevronRight className="ml-auto" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Feature-based Navigation */}
        {featureNavigation.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Site Features</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {featureNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.description}
                        >
                          <Link
                            href={item.href}
                            onClick={handleMobileNavigation}
                          >
                            <item.icon />
                            <span>{item.name}</span>
                            {isActive && <ChevronRight className="ml-auto" />}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* External Links */}
        {externalLinks.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>External Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {externalLinks.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild tooltip={item.name}>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <item.icon />
                          <span>{item.name}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Super User Actions */}
        {session?.user?.role === "SUPERADMIN" && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip="User Management"
                      isActive={pathname === "/admin/users"}
                    >
                      <Link
                        href="/admin/users"
                        onClick={handleMobileNavigation}
                      >
                        <Shield />
                        <span>User Management</span>
                        {pathname === "/admin/users" && (
                          <ChevronRight className="ml-auto" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip="Sites"
                      isActive={pathname === "/admin/sites"}
                    >
                      <Link
                        href="/admin/sites"
                        onClick={handleMobileNavigation}
                      >
                        <Globe />
                        <span>Sites</span>
                        {pathname === "/admin/sites" && (
                          <ChevronRight className="ml-auto" />
                        )}
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
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {session?.user?.email || "user@example.com"}
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
  );
}
