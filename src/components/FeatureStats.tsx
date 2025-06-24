import { FileText, Image as ImageIcon, Users, Trophy, MessageSquare, Store, BarChart3, Newspaper } from 'lucide-react';

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

interface SiteFeature {
  id: string;
  feature: string;
  isEnabled: boolean;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface Site {
  id: string;
  name: string;
  domain: string | null;
  createdAt: string;
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
  }>;
  pages: Array<{
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    createdAt: string;
  }>;
  blogPosts: Array<{
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    publishedAt: string | null;
    createdAt: string;
  }>;
  mediaFiles: MediaFile[];
  features: SiteFeature[];
  _count: {
    pages: number;
    blogPosts: number;
    mediaFiles: number;
    users: number;
  };
}

interface FeatureStatsProps {
  currentSite: Site;
}

export function FeatureStats({ currentSite }: FeatureStatsProps) {
  const getPublishedCount = (items: Array<{ isPublished: boolean }>) => {
    return items.filter(item => item.isPublished).length;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalMediaSize = (mediaFiles: MediaFile[]) => {
    return mediaFiles.reduce((total, file) => total + file.size, 0);
  };

  // Check if a feature is enabled
  const isFeatureEnabled = (featureType: string) => {
    return currentSite.features?.some(f => f.feature === featureType && f.isEnabled) || false;
  };

  // Get enabled stats for rendering
  const getEnabledStats = () => {
    const stats = [];

    // Pages
    if (isFeatureEnabled('PAGES')) {
      stats.push({
        icon: <FileText className="h-4 w-4 text-blue-500" />,
        label: 'Pages',
        value: currentSite._count.pages,
        subtitle: `${getPublishedCount(currentSite.pages)} published`
      });
    }

    // Blog Posts
    if (isFeatureEnabled('BLOG_POSTS')) {
      stats.push({
        icon: <FileText className="h-4 w-4 text-green-500" />,
        label: 'Blog Posts',
        value: currentSite._count.blogPosts,
        subtitle: `${getPublishedCount(currentSite.blogPosts)} published`
      });
    }

    // Media Files
    if (isFeatureEnabled('MEDIA_FILES')) {
      stats.push({
        icon: <ImageIcon className="h-5 w-5 text-purple-500" />,
        label: 'Media Files',
        value: currentSite._count.mediaFiles,
        subtitle: formatFileSize(getTotalMediaSize(currentSite.mediaFiles))
      });
    }

    // Sponsors
    if (isFeatureEnabled('SPONSORS')) {
      // For sponsors, we'll need to make a separate API call or include in site data
      // For now, show placeholder
      stats.push({
        icon: <Trophy className="h-4 w-4 text-yellow-500" />,
        label: 'Sponsors',
        value: 0, // This would need to come from API
        subtitle: 'Active sponsors'
      });
    }

    // Team Members (always show - not really a toggleable feature)
    stats.push({
      icon: <Users className="h-4 w-4 text-orange-500" />,
      label: 'Team Members',
      value: currentSite._count.users,
      subtitle: `${currentSite.users.filter(u => u.role === 'ADMIN').length} admins`
    });

    // Contact Management
    if (isFeatureEnabled('CONTACT_MANAGEMENT')) {
      stats.push({
        icon: <MessageSquare className="h-4 w-4 text-green-600" />,
        label: 'Contact Forms',
        value: 0, // Would need to come from API
        subtitle: 'Total submissions'
      });
    }

    // Online Store
    if (isFeatureEnabled('ONLINE_STORE')) {
      stats.push({
        icon: <Store className="h-4 w-4 text-emerald-500" />,
        label: 'Products',
        value: 0, // Would need to come from API
        subtitle: 'In catalog'
      });
    }

    // Newsletter
    if (isFeatureEnabled('NEWSLETTER')) {
      stats.push({
        icon: <Newspaper className="h-4 w-4 text-indigo-500" />,
        label: 'Newsletter',
        value: 0, // Would need to come from API
        subtitle: 'Subscribers'
      });
    }

    // Analytics
    if (isFeatureEnabled('ANALYTICS')) {
      stats.push({
        icon: <BarChart3 className="h-4 w-4 text-red-500" />,
        label: 'Page Views',
        value: 0, // Would need to come from analytics API
        subtitle: 'This month'
      });
    }

    return stats;
  };

  const enabledStats = getEnabledStats();

  if (enabledStats.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No features enabled for statistics</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {enabledStats.map((stat, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center gap-2">
            {stat.icon}
            <span className="text-sm font-medium">{stat.label}</span>
          </div>
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="text-xs text-muted-foreground">
            {stat.subtitle}
          </div>
        </div>
      ))}
    </div>
  );
} 