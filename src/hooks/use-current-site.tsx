'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface SiteFeature {
  id: string;
  feature: string;
  isEnabled: boolean;
  config: any;
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
  mediaFiles: Array<{
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    createdAt: string;
  }>;
  features: SiteFeature[];
  _count: {
    pages: number;
    blogPosts: number;
    mediaFiles: number;
    users: number;
  };
}

interface CurrentSiteContextType {
  currentSite: Site | null;
  sites: Site[];
  loading: boolean;
  error: string | null;
  refreshSite: () => Promise<void>;
  setCurrentSite: (site: Site | null) => void;
}

const CurrentSiteContext = createContext<CurrentSiteContextType | undefined>(undefined);

export function CurrentSiteProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentSite = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/sites');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sites');
      }
      
      const data = await response.json();
      setSites(data.sites || []);
      // Get the first site the user has access to
      if (data.sites && data.sites.length > 0) {
        setCurrentSite(data.sites[0]);
      } else {
        setCurrentSite(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCurrentSite(null);
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshSite = async () => {
    await fetchCurrentSite();
  };

  useEffect(() => {
    if (session?.user) {
      fetchCurrentSite();
    } else {
      setCurrentSite(null);
      setLoading(false);
    }
  }, [session?.user]);

  return (
    <CurrentSiteContext.Provider
      value={{
        currentSite,
        sites,
        loading,
        error,
        refreshSite,
        setCurrentSite,
      }}
    >
      {children}
    </CurrentSiteContext.Provider>
  );
}

export function useCurrentSite() {
  const context = useContext(CurrentSiteContext);
  if (context === undefined) {
    throw new Error('useCurrentSite must be used within a CurrentSiteProvider');
  }
  return context;
} 