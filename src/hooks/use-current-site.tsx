"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";

interface SiteFeature {
  id: string;
  feature: string;
  displayName: string;
  description: string | null;
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

const CurrentSiteContext = createContext<CurrentSiteContextType | undefined>(
  undefined
);

export function CurrentSiteProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCurrentSite = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/sites");

      if (!response.ok) {
        throw new Error("Failed to fetch sites");
      }

      const data = await response.json();
      setSites(data.sites || []);

      if (data.sites && data.sites.length > 0) {
        // Get the stored site ID from localStorage (only after mounted)
        const storedSiteId = mounted
          ? localStorage.getItem("selectedSiteId")
          : null;

        // Try to find the stored site, fallback to first site if not found
        let selectedSite = data.sites[0];
        if (storedSiteId) {
          const storedSite = data.sites.find(
            (site: Site) => site.id === storedSiteId
          );
          if (storedSite) {
            selectedSite = storedSite;
          }
        }

        setCurrentSite(selectedSite);

        // Always store the selected site ID to ensure persistence (only after mounted)
        if (mounted) {
          localStorage.setItem("selectedSiteId", selectedSite.id);
        }
      } else {
        setCurrentSite(null);
        if (mounted) {
          localStorage.removeItem("selectedSiteId");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setCurrentSite(null);
      setSites([]);
      if (mounted) {
        localStorage.removeItem("selectedSiteId");
      }
    } finally {
      setLoading(false);
    }
  }, [mounted]);

  const refreshSite = useCallback(async () => {
    await fetchCurrentSite();
  }, [fetchCurrentSite]);

  // Custom setCurrentSite function that also persists to localStorage
  const setCurrentSitePersistent = useCallback(
    (site: Site | null) => {
      setCurrentSite(site);
      if (mounted) {
        if (site) {
          localStorage.setItem("selectedSiteId", site.id);
        } else {
          localStorage.removeItem("selectedSiteId");
        }
      }
    },
    [mounted]
  );

  useEffect(() => {
    if (session?.user) {
      fetchCurrentSite();
    } else if (session === null) {
      // Only clear when session is explicitly null (not undefined during loading)
      setCurrentSite(null);
      setLoading(false);
      if (mounted) {
        localStorage.removeItem("selectedSiteId");
      }
    } else {
      // Session is undefined (still loading), don't clear localStorage yet
      setLoading(true);
    }
  }, [session?.user, session, fetchCurrentSite, mounted]);

  return (
    <CurrentSiteContext.Provider
      value={{
        currentSite,
        sites,
        loading,
        error,
        refreshSite,
        setCurrentSite: setCurrentSitePersistent,
      }}
    >
      {children}
    </CurrentSiteContext.Provider>
  );
}

export function useCurrentSite() {
  const context = useContext(CurrentSiteContext);
  if (context === undefined) {
    throw new Error("useCurrentSite must be used within a CurrentSiteProvider");
  }
  return context;
}
